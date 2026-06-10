const BINANCE_API = 'https://api.binance.com/api/v3';

// ============================================================
// 常用币种名称映射
// ============================================================
const COIN_NAMES = {
  btc: 'Bitcoin', eth: 'Ethereum', bnb: 'BNB', sol: 'Solana',
  xrp: 'XRP', ada: 'Cardano', doge: 'Dogecoin', avax: 'Avalanche',
  dot: 'Polkadot', matic: 'Polygon', shib: 'Shiba Inu', ltc: 'Litecoin',
  uni: 'Uniswap', link: 'Chainlink', atom: 'Cosmos', etc: 'Ethereum Classic',
  fil: 'Filecoin', apt: 'Aptos', arb: 'Arbitrum', op: 'Optimism',
  near: 'NEAR Protocol', vet: 'VeChain', algo: 'Algorand', icp: 'Internet Computer',
  grt: 'The Graph', sand: 'The Sandbox', mana: 'Decentraland', aave: 'Aave',
  axs: 'Axie Infinity', theta: 'Theta', ftm: 'Fantom', egld: 'Elrond',
  flow: 'Flow', cake: 'PancakeSwap', rune: 'THORChain', inj: 'Injective',
  pepe: 'Pepe', sui: 'Sui', sei: 'Sei', tia: 'Celestia',
  strk: 'Starknet', wld: 'Worldcoin', bome: 'BOOK OF MEME', wif: 'Dogwifhat',
  bonk: 'Bonk', floki: 'Floki', ens: 'Ethereum Name Service', ldo: 'Lido DAO',
  crv: 'Curve DAO', dydx: 'dYdX', snx: 'Synthetix', comp: 'Compound',
  mkr: 'Maker', yfi: 'yearn.finance', zrx: '0x', bat: 'Basic Attention Token',
  zil: 'Zilliqa', enj: 'Enjin Coin', chz: 'Chiliz', hot: 'Holo',
  ksm: 'Kusama', xtz: 'Tezos', neo: 'Neo', eos: 'EOS',
  iota: 'IOTA', dash: 'Dash', zec: 'Zcash', xmr: 'Monero',
  xlm: 'Stellar', trx: 'TRON', bch: 'Bitcoin Cash',
};

// ============================================================
// 缓存层
// ============================================================
let tickersCache = null;
let tickersCacheTime = 0;
const CACHE_DURATION = 30_000;

async function getAllTickers() {
  const now = Date.now();
  if (tickersCache && (now - tickersCacheTime) < CACHE_DURATION) {
    return tickersCache;
  }
  try {
    const response = await fetch(`${BINANCE_API}/ticker/24hr`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const all = await response.json();
    tickersCache = all.filter(t =>
      t.symbol.endsWith('USDT') &&
      parseFloat(t.lastPrice) > 0 &&
      parseFloat(t.quoteVolume) > 0
    );
    tickersCacheTime = now;
  } catch (error) {
    console.error('Binance fetch error:', error);
    if (!tickersCache) return [];
  }
  return tickersCache;
}

// ============================================================
// 数据转换
// ============================================================

function baseSymbol(ticker) {
  return ticker.symbol.replace('USDT', '').toLowerCase();
}

function coinName(symbol) {
  return COIN_NAMES[symbol] || symbol.toUpperCase();
}

function iconUrl(symbol) {
  const s = symbol || '?';
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = s.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  const letter = s.charAt(0).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="16" fill="hsl(${hue},55%,45%)"/>
    <text x="16" y="21" text-anchor="middle" fill="#fff" font-size="16" font-family="Arial,sans-serif" font-weight="bold">${letter}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function toMarketFormat(ticker) {
  const symbol = baseSymbol(ticker);
  const price = parseFloat(ticker.lastPrice);
  const changePercent = parseFloat(ticker.priceChangePercent);
  return {
    id: symbol,
    symbol: symbol,
    name: coinName(symbol),
    image: iconUrl(symbol),
    current_price: price,
    market_cap: 0,
    market_cap_rank: 0,
    total_volume: parseFloat(ticker.quoteVolume),
    price_change_percentage_24h: changePercent,
    price_change_24h: parseFloat(ticker.priceChange),
  };
}

function toDetailFormat(ticker) {
  const symbol = baseSymbol(ticker);
  const price = parseFloat(ticker.lastPrice);
  const changePercent = parseFloat(ticker.priceChangePercent);
  return {
    id: symbol,
    symbol: symbol,
    name: coinName(symbol),
    image: { large: iconUrl(symbol) },
    market_data: {
      current_price: { usd: price },
      price_change_24h: parseFloat(ticker.priceChange),
      price_change_percentage_24h: changePercent,
      market_cap: { usd: 0 },
      total_volume: { usd: parseFloat(ticker.quoteVolume) },
    },
  };
}

// ============================================================
// 对外 API — 失败时返回空数据，不造假
// ============================================================

export const getCoinMarkets = async (currency = 'usd', count = 100, page = 1) => {
  const all = await getAllTickers();
  const sorted = [...all].sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume));
  const start = (page - 1) * count;
  return sorted.slice(start, start + count).map(toMarketFormat);
};

export const getTopGainers = async (currency = 'usd', count = 100) => {
  const all = await getAllTickers();
  return all
    .filter(t => parseFloat(t.priceChangePercent) > 0)
    .sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent))
    .slice(0, count)
    .map(toMarketFormat);
};

export const getTopLosers = async (currency = 'usd', count = 100) => {
  const all = await getAllTickers();
  return all
    .filter(t => parseFloat(t.priceChangePercent) < 0)
    .sort((a, b) => parseFloat(a.priceChangePercent) - parseFloat(b.priceChangePercent))
    .slice(0, count)
    .map(toMarketFormat);
};

export const getCoinDetails = async (coinId) => {
  const all = await getAllTickers();
  const symbol = coinId.toLowerCase();
  const ticker = all.find(t => baseSymbol(t) === symbol);
  if (ticker) return toDetailFormat(ticker);

  try {
    const response = await fetch(`${BINANCE_API}/ticker/24hr?symbol=${symbol.toUpperCase()}USDT`);
    if (!response.ok) throw new Error('Not found');
    return toDetailFormat(await response.json());
  } catch (error) {
    console.error(`getCoinDetails error for ${coinId}:`, error);
    return null;
  }
};

export const getCoinMarketChart = async (coinId, currency = 'usd', days = 1) => {
  try {
    const symbol = coinId.toUpperCase() + 'USDT';
    let interval, limit;
    if (days <= 1) { interval = '1h'; limit = 24; }
    else if (days <= 7) { interval = '4h'; limit = 42; }
    else { interval = '1d'; limit = days; }
    const url = `${BINANCE_API}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const klines = await response.json();
    return {
      prices: klines.map(k => [k[0], parseFloat(k[4])]),
    };
  } catch (error) {
    console.error(`getCoinMarketChart error for ${coinId}:`, error);
    return { prices: [] };
  }
};

export const searchCoins = async (query) => {
  const all = await getAllTickers();
  const lower = query.toLowerCase();
  return all
    .filter(t => {
      const s = baseSymbol(t);
      return s.includes(lower) || (COIN_NAMES[s] || '').toLowerCase().includes(lower);
    })
    .slice(0, 15)
    .map(toMarketFormat);
};
