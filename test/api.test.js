/**
 * CryptoTrade API 单元测试
 * 运行: npx vitest run test/api.test.js
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockTickerData = [
  { symbol: 'BTCUSDT', lastPrice: '68000', priceChangePercent: '2.5', priceChange: '1658', quoteVolume: '25000000000' },
  { symbol: 'ETHUSDT', lastPrice: '3400', priceChangePercent: '-1.2', priceChange: '-41', quoteVolume: '15000000000' },
  { symbol: 'SOLUSDT', lastPrice: '145', priceChangePercent: '5.8', priceChange: '7.95', quoteVolume: '3000000000' },
  { symbol: 'DOGEUSDT', lastPrice: '0.12', priceChangePercent: '-3.4', priceChange: '-0.004', quoteVolume: '1000000000' },
  { symbol: 'AVAXUSDT', lastPrice: '36', priceChangePercent: '0.0', priceChange: '0', quoteVolume: '500000000' },
  { symbol: 'USDCUSDT', lastPrice: '1.0', priceChangePercent: '0.01', priceChange: '0', quoteVolume: '100000' },
];
const mockKlineData = [
  [1625097600000, '67000', '68500', '66900', '68000', '1000', 1625183999999, '68000000', 500, '500', '34000000', '0'],
  [1625184000000, '68000', '69000', '67800', '68500', '1200', 1625270399999, '82000000', 600, '600', '41000000', '0'],
];

function mockGoodFetch() {
  vi.stubGlobal('fetch', vi.fn(async (url) => {
    if (url.includes('/ticker/24hr') && !url.includes('symbol=')) {
      return { ok: true, json: async () => mockTickerData };
    }
    if (url.includes('/klines')) {
      // Only return data for valid symbols
      const match = url.match(/symbol=(\w+)/);
      const sym = match ? match[1] : '';
      const valid = mockTickerData.find(x => x.symbol === sym);
      return valid
        ? { ok: true, json: async () => mockKlineData }
        : { ok: false, status: 404 };
    }
    if (url.includes('/ticker/24hr?symbol=')) {
      const sym = url.split('symbol=')[1];
      const t = mockTickerData.find(x => x.symbol === sym);
      return t ? { ok: true, json: async () => t } : { ok: false, status: 404 };
    }
    return { ok: false, status: 404 };
  }));
}

// Re-import api module to clear internal cache
async function freshApi() {
  return await import('../src/lib/api.js?' + Date.now() + Math.random());
}

describe('getCoinMarkets', () => {
  beforeEach(() => { mockGoodFetch(); });

  it('returns correct number of coins', async () => {
    const { getCoinMarkets } = await freshApi();
    const coins = await getCoinMarkets('usd', 3);
    expect(coins.length).toBe(3);
  });

  it('maps data to CoinGecko-compatible format', async () => {
    const { getCoinMarkets } = await freshApi();
    const coins = await getCoinMarkets('usd', 10);
    const btc = coins.find(c => c.id === 'btc');
    expect(btc).toBeDefined();
    expect(btc.name).toBe('Bitcoin');
    expect(btc.symbol).toBe('btc');
    expect(btc.current_price).toBe(68000);
    expect(btc.price_change_percentage_24h).toBe(2.5);
    expect(btc.price_change_24h).toBe(1658);
    expect(btc.total_volume).toBe(25000000000);
    expect(btc.image).toMatch(/^data:image\/svg\+xml/);
  });

  it('generates unique icon for each coin', async () => {
    const { getCoinMarkets } = await freshApi();
    const coins = await getCoinMarkets('usd', 5);
    const icons = coins.map(c => c.image);
    expect(new Set(icons).size).toBe(icons.length);
  });

  it('returns coins sorted by quote volume', async () => {
    const { getCoinMarkets } = await freshApi();
    const coins = await getCoinMarkets('usd', 5);
    // BTC should be first (highest volume 25B)
    expect(coins[0].id).toBe('btc');
    expect(coins[0].total_volume).toBe(25000000000);
  });
});

describe('getTopGainers', () => {
  beforeEach(() => { mockGoodFetch(); });

  it('only returns positive change coins', async () => {
    const { getTopGainers } = await freshApi();
    const gainers = await getTopGainers();
    expect(gainers.length).toBe(3); // BTC +2.5%, SOL +5.8%, USDC +0.01%
    gainers.forEach(c => expect(c.price_change_percentage_24h).toBeGreaterThan(0));
  });

  it('sorted descending by change percentage', async () => {
    const { getTopGainers } = await freshApi();
    const gainers = await getTopGainers();
    expect(gainers[0].price_change_percentage_24h).toBeGreaterThanOrEqual(gainers[1].price_change_percentage_24h);
  });
});

describe('getTopLosers', () => {
  beforeEach(() => { mockGoodFetch(); });

  it('only returns negative change coins', async () => {
    const { getTopLosers } = await freshApi();
    const losers = await getTopLosers();
    expect(losers.length).toBe(2); // ETH -1.2%, DOGE -3.4%
    losers.forEach(c => expect(c.price_change_percentage_24h).toBeLessThan(0));
  });
});

describe('getCoinDetails', () => {
  beforeEach(() => { mockGoodFetch(); });

  it('returns detail format with nested market_data', async () => {
    const { getCoinDetails } = await freshApi();
    const btc = await getCoinDetails('btc');
    expect(btc.name).toBe('Bitcoin');
    expect(btc.market_data.current_price.usd).toBe(68000);
    expect(btc.market_data.price_change_percentage_24h).toBe(2.5);
    expect(btc.market_data.market_cap.usd).toBe(0);
    expect(btc.image.large).toMatch(/^data:image\/svg\+xml/);
  });

  it('returns null for unknown coin (no mock data)', async () => {
    const { getCoinDetails } = await freshApi();
    const result = await getCoinDetails('nonexistent_xyz123');
    expect(result).toBeNull();
  });
});

describe('getCoinMarketChart', () => {
  beforeEach(() => { mockGoodFetch(); });

  it('returns prices in [timestamp, price] format', async () => {
    const { getCoinMarketChart } = await freshApi();
    const chart = await getCoinMarketChart('btc', 'usd', 1);
    expect(chart.prices.length).toBe(2);
    expect(chart.prices[0].length).toBe(2);
    expect(typeof chart.prices[0][0]).toBe('number');
    expect(typeof chart.prices[0][1]).toBe('number');
    expect(chart.prices[0][1]).toBe(68000); // close price
  });

  it('returns empty prices for unknown coin (no mock data)', async () => {
    const { getCoinMarketChart } = await freshApi();
    const chart = await getCoinMarketChart('nonexistent', 'usd', 1);
    expect(chart.prices.length).toBe(0);
  });
});

describe('searchCoins', () => {
  beforeEach(() => { mockGoodFetch(); });

  it('finds coins by name fragment', async () => {
    const { searchCoins } = await freshApi();
    const results = await searchCoins('bit');
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('btc');
  });

  it('finds coins by symbol', async () => {
    const { searchCoins } = await freshApi();
    const results = await searchCoins('eth');
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('eth');
  });

  it('returns empty array for unmatched query', async () => {
    const { searchCoins } = await freshApi();
    const results = await searchCoins('zzznotfound');
    expect(results.length).toBe(0);
  });
});
