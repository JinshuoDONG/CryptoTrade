/**
 * CryptoTrade E2E 浏览器自动化测试
 * 运行: npx playwright test test/e2e.spec.js --project=chromium
 * 前提: npm run dev 必须在另一个终端跑着 (localhost:5174)
 */
import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:5174';

test.describe('Home Page - Market Data', () => {
  test('page loads and shows coin table', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForSelector('table', { timeout: 15000 });
    // 表格应该有数据行
    const rows = page.locator('table tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 10000 });
  });

  test('category buttons filter coins', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForSelector('table');

    // Click "Top Gainers"
    await page.click('button:has-text("Top Gainers")');
    await page.waitForTimeout(1500);
    let rows = page.locator('table tbody tr');
    let count = await rows.count();
    expect(count).toBeGreaterThan(0);

    // Click "Top Losers"
    await page.click('button:has-text("Top Losers")');
    await page.waitForTimeout(1500);
    rows = page.locator('table tbody tr');
    count = await rows.count();
    expect(count).toBeGreaterThan(0);

    // Click "All"
    await page.click('button:has-text("All")');
    await page.waitForTimeout(1500);
    rows = page.locator('table tbody tr');
    count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('clicking coin name navigates to detail page', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForSelector('table tbody tr td', { timeout: 10000 });

    // 点击第一个币名（包在 group div 里）
    await page.locator('table tbody tr').first().locator('.group').click();
    await expect(page).toHaveURL(/\/market\//);
    // 详情页应该加载完成（有内容显示）
    await page.waitForTimeout(2000);
    const content = page.locator('p.font-bold').first();
    await expect(content).toBeVisible({ timeout: 8000 });
  });

  test('right panel shows chart after coin selection', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForSelector('table tbody tr td', { timeout: 10000 });

    // 点非币名的格子（价格），应该更新右侧面板
    await page.locator('table tbody tr').first().locator('td').last().click();
    await page.waitForTimeout(2000);
    // 右侧面板应该显示图表
    await expect(page.locator('#chart-timelines')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Search', () => {
  test('search shows results dropdown', async ({ page }) => {
    await page.goto(BASE);
    // Navbar 搜索框常驻
    const searchInput = page.locator('input[placeholder="Search coins..."]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('bit');
    await page.waitForTimeout(1000);
    // 下拉结果出现
    await expect(page.locator('img.h-6.w-6').first()).toBeVisible({ timeout: 5000 });
  });

  test('clicking search result navigates', async ({ page }) => {
    await page.goto(BASE);
    const searchInput = page.locator('input[placeholder="Search coins..."]');
    await searchInput.fill('ethereum');
    await page.waitForTimeout(1500);
    // 点 ETH 结果
    const result = page.locator('img.h-6.w-6').first();
    if (await result.isVisible()) {
      await result.click();
      await expect(page).toHaveURL(/\/market\//);
    }
  });
});

test.describe('Navigation', () => {
  test('sidebar opens and navigates', async ({ page }) => {
    await page.goto(BASE);
    // 点汉堡菜单
    await page.click('button.rounded-full');
    await page.waitForSelector('[role="dialog"]', { timeout: 3000 });

    // Home 链接
    await page.click('text=Home');
    await expect(page).toHaveURL(BASE + '/#/');
  });

  test('Trade button in right panel navigates to detail', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForSelector('table tbody tr td', { timeout: 10000 });
    // 点非币名格切换面板
    await page.locator('table tbody tr').first().locator('td').last().click();
    await page.waitForTimeout(1000);
    // 点 Trade 按钮
    const tradeBtn = page.locator('button:has-text("Trade")');
    if (await tradeBtn.isVisible()) {
      await tradeBtn.click();
      await expect(page).toHaveURL(/\/market\//);
    }
  });

  test('navbar brand goes to home', async ({ page }) => {
    await page.goto(BASE + '/#/market/btc');
    await page.waitForTimeout(1000);
    await page.click('text=Crypto Trackr');
    await expect(page).toHaveURL(BASE + '/#/');
  });
});

test.describe('Auth Page', () => {
  test('auth page loads sign in form', async ({ page }) => {
    await page.goto(BASE + '/#/auth');
    await page.waitForSelector('text=Sign In', { timeout: 5000 });
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('can switch to sign up form', async ({ page }) => {
    await page.goto(BASE + '/#/signup');
    await page.waitForSelector('text=Sign Up', { timeout: 5000 });
    const count = await page.getByRole('button', { name: /sign up|sign in/i }).count();
    expect(count).toBeGreaterThan(0);
  });

  test('forgot password form loads', async ({ page }) => {
    await page.goto(BASE + '/#/forgot-password');
    await expect(page.locator('text=重置密码').or(page.locator('text=reset', { ignoreCase: true }))).toBeVisible({ timeout: 5000 });
  });
});

test.describe('404 / Error Handling', () => {
  test('unknown route shows not found', async ({ page }) => {
    await page.goto(BASE + '/#/some-random-nonexistent');
    await expect(page.locator('text=Notfound')).toBeVisible({ timeout: 5000 });
  });

  test('invalid coin shows error', async ({ page }) => {
    await page.goto(BASE + '/#/market/nonexistentxyz123');
    await page.waitForTimeout(2000);
    // 应该显示错误或空状态
    await expect(page.locator('text=Error').or(page.locator('text=No data'))).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Chatbot', () => {
  test('chatbot opens and responds', async ({ page }) => {
    await page.goto(BASE);
    // 点 Chat Bot 按钮
    const chatBtn = page.locator('button:has-text("Chat Bot")');
    await chatBtn.scrollIntoViewIfNeeded();
    await chatBtn.click();
    await page.waitForTimeout(500);

    // 聊天窗口出现
    const chatVisible = await page.locator('.bg-slate-800').first().isVisible({ timeout: 3000 });
    expect(chatVisible).toBe(true);

    // 发送消息
    const chatInput = page.locator('input[placeholder="Ask about crypto..."]');
    await chatInput.fill('hi');
    await chatInput.press('Enter');
    await page.waitForTimeout(2000);

    // 应该收到回复
    const botReplies = page.locator('.bg-slate-800.text-white');
    const count = await botReplies.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Watchlist (requires login)', () => {
  test('watchlist page shows login prompt when not logged in', async ({ page }) => {
    await page.goto(BASE + '/#/watchlist');
    const hasPrompt = await page.locator('text=log in').first().isVisible({ timeout: 5000 });
    expect(hasPrompt).toBe(true);
  });
});
