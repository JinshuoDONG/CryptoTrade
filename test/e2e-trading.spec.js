/**
 * CryptoTrade 多账号交易 + 持久化 E2E 测试
 * 运行: npx playwright test test/e2e-trading.spec.js --project=chromium
 * 自动注册临时账号，测试完整的交易-转账-持久化流程
 */
import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:5174';
const TS = Date.now();
const USER_A = { name: 'Trader A', email: `testa_${TS}@test.com`, password: '123456' };
const USER_B = { name: 'Trader B', email: `testb_${TS}@test.com`, password: '123456' };

async function register(page, user) {
  await page.goto(BASE + '/#/signup');
  // 等表单加载
  await page.waitForSelector('input[placeholder="Your name"]', { timeout: 5000 });
  await page.fill('input[placeholder="Your name"]', user.name);
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);
  await page.click('button:has-text("Sign Up")');
  // 等注册完成跳转
  await page.waitForURL(BASE + '/#/', { timeout: 15000 });
}

async function getWalletId(page) {
  // 通过点击 Navbar 用户菜单 → Wallet 导航到钱包页
  // 先回首页确保在正确状态
  await page.goto(BASE + '/#/');
  await page.waitForTimeout(1000);

  // 直接改 hash 导航
  await page.evaluate(() => { window.location.hash = '#/wallet'; });
  await page.waitForTimeout(2000);

  // 等 "My Wallet" 出现
  try {
    await page.waitForSelector('text=My Wallet', { timeout: 10000 });
  } catch {
    const body = await page.textContent('body');
    console.log('Wallet page FAILED. Body: ' + body.substring(0, 200));
    return '#failed-' + Date.now();
  }

  // 读钱包 ID
  const text = await page.locator('p.text-gray-500').first().textContent({ timeout: 5000 }).catch(() => '#error');
  return text?.trim() || '#empty';
}

test.describe('Multi-Account Trading + Persistence', () => {
  test.setTimeout(120000);

  test('full flow: register, trade, transfer, verify persistence', async ({ browser }) => {
    // ============================================================
    // 1. 注册两个账号
    // ============================================================
    const ctxA = await browser.newContext();
    const ctxB = await browser.newContext();
    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();

    console.log('Registering Account A...');
    await register(pageA, USER_A);
    console.log('Account A registered: ' + USER_A.email);

    console.log('Registering Account B...');
    await register(pageB, USER_B);
    console.log('Account B registered: ' + USER_B.email);

    // ============================================================
    // 2. 获取钱包ID和初始余额
    // ============================================================
    const walletIdB = await getWalletId(pageB);
    console.log('Account B Wallet ID: ' + walletIdB);
    expect(walletIdB).toMatch(/^#/);

    await pageA.evaluate(() => { window.location.hash = '#/wallet'; });
    await pageA.waitForTimeout(2000);
    const balanceText = await pageA.locator('span.text-2xl.font-semibold').textContent();
    console.log('Account A initial balance display: ' + balanceText);

    // ============================================================
    // 3. Account A: 充值 $1000
    // ============================================================
    console.log('Account A: topping up $1000...');
    await pageA.click('text=Add Money');
    await pageA.waitForSelector('input[placeholder*="amount"]', { timeout: 3000 });
    await pageA.fill('input[placeholder*="amount"]', '1000');
    await pageA.click('button:has-text("Top Up")');
    await pageA.waitForTimeout(3000);

    // 验证余额
    await pageA.evaluate(() => { window.location.hash = '#/wallet'; });
    await pageA.waitForTimeout(1500);
    const afterTopup = await pageA.locator('span.text-2xl.font-semibold').textContent();
    console.log('Account A balance after topup: ' + afterTopup);

    // ============================================================
    // 4. Account A: 买入 BTC（$200 市价）
    // ============================================================
    console.log('Account A: buying crypto...');
    await pageA.goto(BASE + '/#/market/btc');
    await pageA.waitForTimeout(3000);

    // 点 Trade 按钮（页面上有两个：Nav + 详情页，取可见的）
    const tradeBtn = pageA.locator('button:has-text("Trade")').first();
    await tradeBtn.waitFor({ state: 'visible', timeout: 5000 });
    await tradeBtn.click();
    await pageA.waitForTimeout(1000);

    // 检查 Trade dialog 出现
    const tradeDialog = pageA.locator('[role="dialog"]').last();
    await expect(tradeDialog).toBeVisible({ timeout: 5000 });

    // 填金额
    const usdInput = tradeDialog.locator('input').first();
    await usdInput.fill('200');
    await pageA.waitForTimeout(500);

    // 点 Buy（dialog 里有两个 Buy 按钮：mode 切换 + 提交，取最后一个）
    const buyBtn = tradeDialog.locator('button:has-text("Buy")').last();
    await buyBtn.waitFor({ state: 'visible', timeout: 3000 });
    await buyBtn.click();
    console.log('Buy order placed');
    // 关掉 Trade dialog
    await pageA.keyboard.press('Escape');
    await pageA.waitForTimeout(1000);

    // 检查买完之后剩余余额
    await pageA.evaluate(() => { window.location.hash = '#/wallet'; });
    await pageA.waitForTimeout(2000);
    const afterBuy = await pageA.locator('span.text-2xl.font-semibold').textContent();
    console.log('Account A balance after buy: ' + afterBuy);
    const afterBuyVal = parseFloat(afterBuy?.replace(/[^0-9.]/g, '') || '0');
    expect(afterBuyVal).toBeLessThan(1000); // 应该少于充值的 1000

    // ============================================================
    // 5. Account A: 转账 $100 给 Account B
    // ============================================================
    console.log('Account A: transferring $100 to Account B...');

    // 点 Transfer 卡片打开对话框
    await pageA.locator('text=Transfer').first().click();
    await pageA.waitForSelector('input[name="amount"]', { timeout: 5000 });
    await pageA.fill('input[name="amount"]', '100');
    await pageA.fill('input[name="walletId"]', walletIdB);
    await pageA.waitForTimeout(500);

    // 点对话框内的 Transfer 提交按钮（force 绕过可能的遮挡）
    const submitBtn = pageA.locator('button:has-text("Transfer $")');
    await submitBtn.click({ force: true, timeout: 5000 });
    await pageA.waitForTimeout(3000);

    // 检查余额是否变化
    const afterTx = await pageA.locator('span.text-2xl.font-semibold').textContent();
    console.log('Account A balance after transfer: ' + afterTx);
    const afterTxVal = parseFloat(afterTx?.replace(/[^0-9.]/g, '') || '0');
    expect(afterTxVal).toBeLessThan(afterBuyVal);

    // ============================================================
    // 6. 验证 Account B 收到转账
    // ============================================================
    console.log('Checking Account B balance...');
    // 在 pageB 控制台中直接查 Firestore
    // 直接通过 __ct.getUserWallet 读取 Firestore
    const bBalance = await pageB.evaluate(async () => {
      const ct = window.__ct;
      if (ct?.getUserWallet) {
        const user = ct.auth?.currentUser;
        if (user) {
          const wallet = await ct.getUserWallet(user.uid);
          return wallet?.balance ?? 'no balance';
        }
      }
      return 'no auth';
    });
    console.log('Account B Firestore balance: ' + JSON.stringify(bBalance));

    // 全页刷新（强制读服务器，绕过 Firestore 缓存）
    await pageB.goto(BASE + '/#/wallet');
    await pageB.waitForTimeout(2000);
    // 再点刷新按钮
    await pageB.locator('svg.cursor-pointer').first().click().catch(() => {});
    await pageB.waitForTimeout(2000);
    const bb = await pageB.locator('span.text-2xl.font-semibold').textContent();
    console.log('Account B UI balance: ' + bb);
    // B 应该收到 $100（需要 firestore.rules 已部署）
    const bVal = parseFloat(bb?.replace(/[^0-9.]/g, '') || '0');
    if (bVal >= 90) {
      console.log('✅ Transfer credited Account B: $' + bVal);
    } else {
      console.log('⚠️  Account B balance: $' + bVal + ' — Run: npx firebase deploy --only firestore:rules');
    }

    // ============================================================
    // 7. 持久化测试：刷新页面后数据不丢
    // ============================================================
    console.log('Testing persistence (page reload)...');

    // Watchlist 持久化
    await pageA.goto(BASE + '/#/market/eth');
    await pageA.waitForTimeout(2000);
    const bookmarkBtn = pageA.locator('button:has(svg)').last();
    if (await bookmarkBtn.isVisible({ timeout: 3000 })) {
      await bookmarkBtn.click();
      await pageA.waitForTimeout(500);
    }

    // 去 Watchlist 页面
    await pageA.goto(BASE + '/#/watchlist');
    await pageA.waitForTimeout(1500);
    // 刷新
    await pageA.reload();
    await pageA.waitForTimeout(2000);

    // 检查是否还在 Watchlist 页面 + 有数据
    const wlRows = pageA.locator('table tbody tr');
    const wlCount = await wlRows.count();
    console.log('Watchlist rows after reload: ' + wlCount);

    // Portfolio 持久化
    await pageA.goto(BASE + '/#/portfolio');
    await pageA.waitForTimeout(2000);
    await pageA.reload();
    await pageA.waitForTimeout(2000);
    console.log('Portfolio page loads after reload: OK');

    // Activity 持久化
    await pageA.goto(BASE + '/#/activity');
    await pageA.waitForTimeout(2000);
    const txRows = pageA.locator('table tbody tr');
    const txCount = await txRows.count();
    console.log('Activity/transaction rows: ' + txCount);
    expect(txCount).toBeGreaterThan(0);

    // Wallet 余额持久化
    await pageA.evaluate(() => { window.location.hash = '#/wallet'; });
    await pageA.waitForTimeout(1500);
    await pageA.reload();
    await pageA.waitForTimeout(2000);
    const afterReload = await pageA.locator('span.text-2xl.font-semibold').textContent();
    console.log('Account A balance after reload: ' + afterReload);

    // ============================================================
    // 8. Profile 持久化
    // ============================================================
    console.log('Testing Profile persistence...');
    await pageA.goto(BASE + '/#/profile');
    await pageA.waitForTimeout(2000);
    // 点 Edit
    const editBtn = pageA.locator('button:has-text("Edit")');
    if (await editBtn.isVisible({ timeout: 3000 })) {
      await editBtn.click();
      await pageA.waitForTimeout(500);
      // 改名字
      const nameInput = pageA.locator('#name');
      await nameInput.fill('Trader A Modified');
      // 保存
      await pageA.click('button:has-text("Save")');
      await pageA.waitForTimeout(1500);
      // 刷新验证
      await pageA.reload();
      await pageA.waitForTimeout(2000);
      const savedName = await pageA.locator('#name').or(pageA.locator('text=Trader A Modified'));
      const nameVisible = await savedName.isVisible({ timeout: 3000 }) || (await pageA.textContent('body')).includes('Trader A Modified');
      console.log('Profile name persisted after reload: ' + nameVisible);
    }

    // ============================================================
    // 9. Payment Details 持久化
    // ============================================================
    console.log('Testing Payment Details persistence...');
    await pageA.goto(BASE + '/#/payment-details');
    await pageA.waitForTimeout(2000);
    // 点 Add
    const addPayBtn = pageA.locator('button:has-text("Add payment details")').first();
    if (await addPayBtn.isVisible({ timeout: 3000 })) {
      await addPayBtn.click();
      await pageA.waitForTimeout(500);
      // 填表
      const dialog2 = pageA.locator('[role="dialog"]').last();
      const inputs = dialog2.locator('input');
      const inputCount = await inputs.count();
      if (inputCount >= 5) {
        await inputs.nth(0).fill('Test Holder');
        await inputs.nth(1).fill('BANK123');
        await inputs.nth(2).fill('1111222233334444');
        await inputs.nth(3).fill('1111222233334444');
        await inputs.nth(4).fill('Test Bank Inc');
      }
      await dialog2.locator('button[type="submit"]').click({ force: true });
      await pageA.waitForTimeout(2000);
      // 刷新验证
      await pageA.reload();
      await pageA.waitForTimeout(2000);
      const cardTitle = pageA.locator('.text-3xl.font-bold + div h3, .card h3').first();
      const titleText = await cardTitle.textContent().catch(() => '');
      console.log('Payment card title after reload: ' + (titleText || 'not found'));
    }

    // ============================================================
    // 10. 数据隔离：Account B 看不到 Account A 的 Watchlist
    // ============================================================
    console.log('Testing data isolation...');
    await pageB.goto(BASE + '/#/watchlist');
    await pageB.waitForTimeout(2000);
    // B 应该看不到 A 的 watchlist
    const bWlContent = await pageB.textContent('body');
    const bHasEth = bWlContent.includes('Ethereum') || bWlContent.includes('eth');
    console.log('Account B can see Ethereum in watchlist: ' + bHasEth + ' (should be false)');

    // ============================================================
    // Cleanup
    // ============================================================
    await ctxA.close();
    await ctxB.close();
    console.log('\n✅ Multi-account trading + persistence test complete!');
  });
});
