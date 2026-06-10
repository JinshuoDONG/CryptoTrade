import { getCoinMarkets, getTopGainers, getTopLosers } from './api';

// 从消息中提取币种名
function extractCoinSymbol(msg) {
  const lower = msg.toLowerCase();
  const keywords = [
    'bitcoin', 'btc', 'ethereum', 'eth', 'solana', 'sol', 'bnb',
    'ripple', 'xrp', 'cardano', 'ada', 'dogecoin', 'doge',
    'avalanche', 'avax', 'polygon', 'matic', 'polkadot', 'dot',
    'chainlink', 'link', 'uniswap', 'uni', 'litecoin', 'ltc',
    'shiba', 'shib', 'pepe', 'sui', 'near', 'injective', 'inj',
  ];
  for (const kw of keywords) {
    if (lower.includes(kw)) return kw;
  }
  return null;
}

function findCoin(tickers, query) {
  const q = query.toLowerCase();
  return tickers.find(t => {
    const s = t.symbol.replace('USDT', '').toLowerCase();
    const name = t.name || s;
    return s === q || name.toLowerCase().includes(q) || q.includes(s);
  });
}

function formatPrice(p) {
  if (p >= 1) return '$' + p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return '$' + p.toFixed(6);
}

export async function getChatbotResponse(message) {
  const lower = message.toLowerCase().trim();

  // Greetings
  if (/^(hi|hello|hey|yo)\b/.test(lower)) {
    return "Hi there! 👋 I'm your crypto assistant. Ask me about prices, top gainers, top losers, or market info!";
  }
  if (/help|what can you do/i.test(lower)) {
    return "I can help you with:\n• Price of a coin: \"What's the price of Bitcoin?\"\n• Top gainers: \"Show me top gainers\"\n• Top losers: \"What are the biggest losers?\"\n• Market overview: \"How's the market?\"";
  }

  try {
    // Top gainers
    if (/top.*gain|gainer|biggest.*(win|up|gain)/i.test(lower)) {
      const gainers = await getTopGainers('usd', 5);
      if (gainers.length === 0) return "No gainers data available right now.";
      return '🔥 Top 5 Gainers (24h):\n' + gainers.map((c, i) =>
        `${i + 1}. ${c.name} (${c.symbol.toUpperCase()}) — ${formatPrice(c.current_price)} — +${c.price_change_percentage_24h.toFixed(2)}%`
      ).join('\n');
    }

    // Top losers
    if (/top.*los|loser|biggest.*(loss|down)/i.test(lower)) {
      const losers = await getTopLosers('usd', 5);
      if (losers.length === 0) return "No losers data available right now.";
      return '📉 Top 5 Losers (24h):\n' + losers.map((c, i) =>
        `${i + 1}. ${c.name} (${c.symbol.toUpperCase()}) — ${formatPrice(c.current_price)} — ${c.price_change_percentage_24h.toFixed(2)}%`
      ).join('\n');
    }

    // Market overview
    if (/market|overview|how.*market/i.test(lower)) {
      const markets = await getCoinMarkets('usd', 5);
      if (markets.length === 0) return "Market data unavailable right now.";
      return '📊 Market Overview (Top 5 by volume):\n' + markets.map((c, i) =>
        `${i + 1}. ${c.name} — ${formatPrice(c.current_price)} — ${c.price_change_percentage_24h >= 0 ? '+' : ''}${c.price_change_percentage_24h.toFixed(2)}%`
      ).join('\n');
    }

    // Price query
    const coinQuery = extractCoinSymbol(message);
    if (coinQuery) {
      const markets = await getCoinMarkets('usd', 200);
      const coin = findCoin(markets, coinQuery);
      if (coin) {
        const change = coin.price_change_percentage_24h;
        const emoji = change >= 0 ? '📈' : '📉';
        return `${emoji} ${coin.name} (${coin.symbol.toUpperCase()})\nPrice: ${formatPrice(coin.current_price)}\n24h Change: ${change >= 0 ? '+' : ''}${change.toFixed(2)}%\n24h Volume: $${(coin.total_volume || 0).toLocaleString()}`;
      }
      return `Sorry, I couldn't find "${coinQuery}". Try using the coin symbol (e.g., "btc", "eth").`;
    }

    // Search query
    if (lower.length > 2) {
      const markets = await getCoinMarkets('usd', 200);
      const match = findCoin(markets, lower);
      if (match) {
        const change = match.price_change_percentage_24h;
        const emoji = change >= 0 ? '📈' : '📉';
        return `${emoji} ${match.name} (${match.symbol.toUpperCase()})\nPrice: ${formatPrice(match.current_price)}\n24h Change: ${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
      }
    }
  } catch (e) {
    console.error('Chatbot error:', e);
    return "Sorry, I'm having trouble fetching market data. Please try again later.";
  }

  return "I'm not sure how to help with that. Try asking about:\n• A coin's price: \"Bitcoin price\"\n• Top gainers or losers\n• Market overview\n\nOr type \"help\" to see what I can do!";
}
