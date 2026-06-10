/**
 * CryptoTrade 浏览器控制台自动化测试
 *
 * 用法：
 *   1. 打开 http://localhost:5174 （确保 npm run dev 在跑）
 *   2. F12 → Console，全选粘贴本文件所有内容，回车
 *   3. 看输出：全部 ✅ 绿色 = 通过 / ❌ 红色 = 有 bug
 *
 * 需要先登录，然后在控制台设置用户信息：
 *   __testUser = { uid: "你的Firebase UID", email: "你的邮箱" };
 *   __testTargetWallet = "#目标钱包ID";  // 转账测试用（可选）
 *
 * 然后重新粘贴运行本脚本。
 */

(function runAllTests() {
  const log   = (m) => console.log(`%c${m}`, 'color:#888;font-size:12px');
  const pass  = (m) => console.log(`%c  ✅ ${m}`, 'color:#22c55e;font-weight:bold');
  const fail  = (m) => console.log(`%c  ❌ ${m}`, 'color:#ef4444;font-weight:bold');
  const title = (m) => console.log(`\n%c${m}`, 'color:#6366f1;font-size:16px;font-weight:bold');
  let ok = 0, ng = 0;
  const check = (cond, msg) => { if (cond) { pass(msg); ok++; } else { fail(msg); ng++; } };

  const api = window.__ct;
  if (!api) {
    fail('__ct not found! Make sure you are on http://localhost:5174 and the page loaded.');
    fail('Also check that npm run dev is running.');
    return;
  }

  // ============================================================
  // 1. API Market Data
  // ============================================================
  title('1. API Market Data');
  (async () => {
    try {
      const markets = await api.getCoinMarkets();
      check(markets.length > 10, `getCoinMarkets: ${markets.length} coins (>10)`);
      check(markets[0].id && markets[0].current_price > 0, `First coin: ${markets[0].name} $${markets[0].current_price}`);
      check(markets[0].image?.startsWith('data:image'), 'Icon is data URI (no external CDN)');

      const gainers = await api.getTopGainers();
      check(gainers.length > 0, `getTopGainers: ${gainers.length} coins`);
      if (gainers.length > 0) check(gainers[0].price_change_percentage_24h > 0, 'Top gainer has positive change');

      const losers = await api.getTopLosers();
      check(losers.length > 0, `getTopLosers: ${losers.length} coins`);

      const btc = await api.getCoinDetails('btc');
      check(btc && btc.name === 'Bitcoin', 'getCoinDetails(btc): Bitcoin');
      check(btc?.market_data?.current_price?.usd > 0, `BTC price: $${btc.market_data.current_price.usd}`);

      const invalid = await api.getCoinDetails('nonexistent_xyz');
      check(invalid === null, 'Invalid coin returns null (NO mock data ✅)');

      const chart = await api.getCoinMarketChart('btc', 'usd', 1);
      check(chart.prices.length > 0, `Chart: ${chart.prices.length} data points`);
      check(chart.prices[0].length === 2, 'Chart format: [timestamp, price]');

      const emptyChart = await api.getCoinMarketChart('nonexistent_xyz', 'usd', 1);
      check(emptyChart.prices.length === 0, 'Invalid chart returns empty (NO mock data ✅)');

      const search = await api.searchCoins('bit');
      check(search.some(c => c.id === 'btc'), 'searchCoins("bit") finds Bitcoin');
    } catch (e) { fail('API test crashed: ' + e.message); console.error(e); }
    runAuthTests();
  })();

  // ============================================================
  // 2. Auth & Wallet
  // ============================================================
  async function runAuthTests() {
    const user = window.__testUser;
    if (!user) {
      log('\nNo __testUser set. To test auth/wallet, first log in, then run:');
      log('  __testUser = { uid: "YOUR_UID", email: "your@email.com" };');
      log('  // then re-paste this script\n');
      summary();
      return;
    }
    title('2. Wallet Operations');

    try {
      // Get/Create wallet
      const wallet = await api.getUserWallet(user.uid);
      check(wallet && typeof wallet.balance === 'number', `Wallet exists, balance: $${wallet.balance?.toFixed(2)}`);
      check(wallet.walletId?.startsWith('#'), `Wallet ID: ${wallet.walletId}`);

      // Top up
      const before = wallet.balance || 0;
      const topup = await api.addMoney(user.uid, 100, 'TEST');
      check(topup.success, 'addMoney($100): success');
      const afterTopup = await api.getUserWallet(user.uid);
      check(Math.abs(afterTopup.balance - (before + 100)) < 0.01,
        `Balance after topup: $${before} → $${afterTopup.balance?.toFixed(2)}`);

      // Withdraw
      const wd = await api.withdrawMoney(user.uid, 50);
      check(wd.success, 'withdrawMoney($50): success');
      const afterWD = await api.getUserWallet(user.uid);
      check(Math.abs(afterWD.balance - (afterTopup.balance - 50)) < 0.01,
        `Balance after withdraw: $${afterWD.balance?.toFixed(2)}`);

      // Transfer (needs target wallet)
      const target = window.__testTargetWallet;
      if (target) {
        const tx = await api.transferMoney(user.uid, 25, target);
        check(tx.success, 'transferMoney($25): success');
        const afterTx = await api.getUserWallet(user.uid);
        check(afterTx.balance < afterWD.balance, 'Sender balance decreased');
      } else {
        log('Skipping transfer (set __testTargetWallet to test)');
      }
    } catch (e) { fail('Wallet test crashed: ' + e.message); console.error(e); }
    runTradeTests();
  }

  // ============================================================
  // 3. Trading
  // ============================================================
  async function runTradeTests() {
    const user = window.__testUser;
    if (!user) { summary(); return; }
    title('3. Trading (Buy / Sell)');

    try {
      const price = 60000;
      const buy = await api.buyCrypto(user.uid, 'btc', 10, price);
      check(buy.success, 'buyCrypto($10 BTC): success');
      check(buy.coinAmount > 0, `Got ${buy.coinAmount?.toFixed(6)} BTC`);

      const portfolio = await api.getPortfolio(user.uid);
      check(portfolio.btc?.amount > 0, `Portfolio has BTC: ${portfolio.btc?.amount?.toFixed(6)}`);

      const sell = await api.sellCrypto(user.uid, 'btc', buy.coinAmount, price);
      check(sell.success, 'sellCrypto: success (sold all)');

      const afterPortfolio = await api.getPortfolio(user.uid);
      check(!afterPortfolio.btc || afterPortfolio.btc.amount < 0.00000001, 'Portfolio cleaned up');
    } catch (e) { fail('Trade test crashed: ' + e.message); console.error(e); }
    runPersistenceTests();
  }

  // ============================================================
  // 4. Persistence (Watchlist / Profile / Payment / History)
  // ============================================================
  async function runPersistenceTests() {
    const user = window.__testUser;
    if (!user) { summary(); return; }
    title('4. Persistence (Watchlist, Profile, Payment)');

    try {
      // Watchlist
      await api.addToWatchlist(user.uid, 'btc');
      await api.addToWatchlist(user.uid, 'eth');
      const wl = await api.getUserWatchlist(user.uid);
      check(wl.includes('btc') && wl.includes('eth'), 'Watchlist: btc + eth saved');
      await api.removeFromWatchlist(user.uid, 'eth');
      const wl2 = await api.getUserWatchlist(user.uid);
      check(!wl2.includes('eth') && wl2.includes('btc'), 'Watchlist: eth removed, btc kept');

      // Transaction history
      const txs = await api.getTransactionHistory(user.uid, 20);
      check(txs.length >= 2, `Transaction history: ${txs.length} entries`);
      check(txs.some(t => t.type === 'TOPUP'), 'History has TOPUP');
      check(txs.some(t => t.type === 'BUY'), 'History has BUY');

      // Payment Details
      const { doc, setDoc, getDoc, serverTimestamp } = await import('firebase/firestore');
      const payRef = doc(api.db, 'paymentDetails', user.uid);
      await setDoc(payRef, {
        accountHolderName: 'Test User', bankId: 'TEST001',
        accountNumber: '1234567890', bankName: 'Test Bank', updatedAt: new Date()
      });
      const payDoc = await getDoc(payRef);
      check(payDoc.exists() && payDoc.data().bankName === 'Test Bank', 'Payment details persisted');

      log('All persistence tests done');
    } catch (e) { fail('Persistence test crashed: ' + e.message); console.error(e); }
    summary();
  }

  // ============================================================
  // Summary
  // ============================================================
  function summary() {
    console.log(`\n%c═════════════════════════`, 'color:#6366f1');
    console.log(`%c📊 ${ok} passed, ${ng} failed, ${ok+ng} total`,
      `font-size:18px;font-weight:bold;color:${ng===0?'#22c55e':'#ef4444'}`);
    if (ng === 0) console.log(`%c🎉 ALL TESTS PASSED`, 'color:#22c55e;font-size:14px');
    else console.log(`%c⚠️  ${ng} FAILED — check above`, 'color:#ef4444;font-size:14px');
    console.log(`%c═════════════════════════`, 'color:#6366f1');
  }
})();
