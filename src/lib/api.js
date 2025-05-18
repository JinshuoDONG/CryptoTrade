const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

// Get coin list with market data
export const getCoinMarkets = async (currency = 'usd', count = 100, page = 1) => {
  try {
    const response = await fetch(`${COINGECKO_API_URL}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${count}&page=${page}&sparkline=false&price_change_percentage=24h`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching coin markets:', error);
    // 如果发生错误，返回模拟数据以避免UI崩溃
    return getMockData();
  }
};

// Get top gainers (coins with highest price change percentage)
export const getTopGainers = async (currency = 'usd', count = 100) => {
  try {
    const response = await fetch(`${COINGECKO_API_URL}/coins/markets?vs_currency=${currency}&order=price_change_percentage_24h_desc&per_page=${count}&page=1&sparkline=false&price_change_percentage=24h`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    
    // 过滤掉价格变化百分比为null或小于等于0的币种
    const filteredData = data.filter(coin => 
      coin.price_change_percentage_24h !== null && 
      coin.price_change_percentage_24h > 0
    );
    
    return filteredData || [];
  } catch (error) {
    console.error('Error fetching top gainers:', error);
    return getMockTopGainers();
  }
};

// Get top losers (coins with lowest price change percentage)
export const getTopLosers = async (currency = 'usd', count = 100) => {
  try {
    const response = await fetch(`${COINGECKO_API_URL}/coins/markets?vs_currency=${currency}&order=price_change_percentage_24h_asc&per_page=${count}&page=1&sparkline=false&price_change_percentage=24h`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    
    // 过滤掉价格变化百分比为null或大于等于0的币种
    const filteredData = data.filter(coin => 
      coin.price_change_percentage_24h !== null && 
      coin.price_change_percentage_24h < 0
    );
    
    return filteredData || [];
  } catch (error) {
    console.error('Error fetching top losers:', error);
    return getMockTopLosers();
  }
};

// 获取特定加密货币的市场图表数据
export const getCoinMarketChart = async (coinId, currency = 'usd', days = 1) => {
  try {
    const response = await fetch(`${COINGECKO_API_URL}/coins/${coinId}/market_chart?vs_currency=${currency}&days=${days}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data || { prices: [] };
  } catch (error) {
    console.error(`Error fetching market chart for ${coinId}:`, error);
    return { prices: getMockChartData() };
  }
};

// 获取加密货币详细信息
export const getCoinDetails = async (coinId) => {
  try {
    const response = await fetch(`${COINGECKO_API_URL}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching details for ${coinId}:`, error);
    // 返回模拟数据，避免UI出现无数据状态
    return getMockCoinDetails(coinId);
  }
};

// 搜索加密货币
export const searchCoins = async (query) => {
  try {
    const response = await fetch(`${COINGECKO_API_URL}/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    
    // CoinGecko search API返回的是不完整的币种数据，需要额外处理
    // 这里我们只获取前10个结果的完整数据
    if (data.coins && data.coins.length > 0) {
      const topResults = data.coins.slice(0, 10);
      // 获取完整的市场数据
      const coinIds = topResults.map(coin => coin.id).join(',');
      const marketDataResponse = await fetch(`${COINGECKO_API_URL}/coins/markets?vs_currency=usd&ids=${coinIds}&per_page=10&page=1&sparkline=false&price_change_percentage=24h`);
      
      if (marketDataResponse.ok) {
        return await marketDataResponse.json();
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error searching coins:', error);
    return getMockSearchResults(query);
  }
};

// 提供模拟搜索结果数据
function getMockSearchResults(query) {
  // 从模拟数据中过滤出匹配查询的币种
  const allMockCoins = [
    ...getMockData(),
    ...getMockTopGainers(),
    ...getMockTopLosers()
  ];
  
  const lowerQuery = query.toLowerCase();
  return allMockCoins.filter(coin => 
    coin.name.toLowerCase().includes(lowerQuery) || 
    coin.symbol.toLowerCase().includes(lowerQuery)
  );
}

// 提供模拟数据，以防API请求失败
function getMockData() {
  return [
    {
      id: "bitcoin",
      symbol: "btc",
      name: "Bitcoin",
      image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
      current_price: 69242,
      market_cap: 2064191106560,
      market_cap_rank: 1,
      total_volume: 25737052283,
      price_change_percentage_24h: 0.71,
    },
    {
      id: "ethereum",
      symbol: "eth",
      name: "Ethereum",
      image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
      current_price: 3352.45,
      market_cap: 288439005195,
      market_cap_rank: 2,
      total_volume: 20789203466,
      price_change_percentage_24h: -3.36,
    }
  ];
}

// 模拟Top Gainers数据
function getMockTopGainers() {
  return [
    {
      id: "pepe",
      symbol: "pepe",
      name: "Pepe",
      image: "https://assets.coingecko.com/coins/images/29850/large/pepe-token.png",
      current_price: 0.000011,
      market_cap: 4752423625,
      market_cap_rank: 15,
      total_volume: 1247452368,
      price_change_percentage_24h: 15.32,
    },
    {
      id: "injective-protocol",
      symbol: "inj",
      name: "Injective",
      image: "https://assets.coingecko.com/coins/images/12882/large/Secondary_Symbol.png",
      current_price: 33.85,
      market_cap: 3047483625,
      market_cap_rank: 32,
      total_volume: 247856368,
      price_change_percentage_24h: 10.24,
    },
    {
      id: "dogecoin",
      symbol: "doge",
      name: "Dogecoin",
      image: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png",
      current_price: 0.1245,
      market_cap: 17847625425,
      market_cap_rank: 9,
      total_volume: 1047958364,
      price_change_percentage_24h: 7.65,
    }
  ];
}

// 模拟Top Losers数据
function getMockTopLosers() {
  return [
    {
      id: "cardano",
      symbol: "ada",
      name: "Cardano",
      image: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
      current_price: 0.455,
      market_cap: 16087483625,
      market_cap_rank: 10,
      total_volume: 687452368,
      price_change_percentage_24h: -8.37,
    },
    {
      id: "solana",
      symbol: "sol",
      name: "Solana",
      image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
      current_price: 142.55,
      market_cap: 67847483625,
      market_cap_rank: 5,
      total_volume: 3047856368,
      price_change_percentage_24h: -5.18,
    },
    {
      id: "polygon",
      symbol: "matic",
      name: "Polygon",
      image: "https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png",
      current_price: 0.553,
      market_cap: 5487565425,
      market_cap_rank: 17,
      total_volume: 478958364,
      price_change_percentage_24h: -4.23,
    }
  ];
}

// 获取特定币种的模拟详细数据
function getMockCoinDetails(coinId) {
  const mockCoins = {
    "bitcoin": {
      id: "bitcoin",
      symbol: "btc",
      name: "Bitcoin",
      image: {
        large: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png"
      },
      market_data: {
        current_price: {
          usd: 69242
        },
        price_change_24h: -1240.58,
        price_change_percentage_24h: -0.71,
        market_cap: {
          usd: 2064191106560
        },
        total_volume: {
          usd: 25737052283
        }
      }
    },
    "ethereum": {
      id: "ethereum",
      symbol: "eth",
      name: "Ethereum",
      image: {
        large: "https://assets.coingecko.com/coins/images/279/large/ethereum.png"
      },
      market_data: {
        current_price: {
          usd: 3352.45
        },
        price_change_24h: -110.23,
        price_change_percentage_24h: -3.36,
        market_cap: {
          usd: 288439005195
        },
        total_volume: {
          usd: 20789203466
        }
      }
    },
    "ripple": {
      id: "ripple",
      symbol: "xrp",
      name: "XRP",
      image: {
        large: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png"
      },
      market_data: {
        current_price: {
          usd: 0.5023
        },
        price_change_24h: -0.0168,
        price_change_percentage_24h: -3.25,
        market_cap: {
          usd: 28300000000
        },
        total_volume: {
          usd: 958000000
        }
      }
    }
  };

  // 如果有对应币种的模拟数据就返回，否则返回通用模拟数据
  if (mockCoins[coinId]) {
    return mockCoins[coinId];
  }

  // 返回通用模拟数据
  return {
    id: coinId,
    symbol: coinId.substring(0, 3),
    name: coinId.charAt(0).toUpperCase() + coinId.slice(1),
    image: {
      large: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png"
    },
    market_data: {
      current_price: {
        usd: 500 + Math.random() * 1000
      },
      price_change_24h: Math.random() * 100 - 50,
      price_change_percentage_24h: Math.random() * 10 - 5,
      market_cap: {
        usd: 10000000000 + Math.random() * 50000000000
      },
      total_volume: {
        usd: 1000000000 + Math.random() * 5000000000
      }
    }
  };
}

// 提供图表的模拟数据
function getMockChartData() {
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;
  const data = [];
  
  // 生成过去24小时的模拟价格点
  for (let i = 24; i >= 0; i--) {
    const time = now - (i * dayInMs / 24);
    const basePrice = 84000;
    // 添加一些随机波动
    const randomVariation = Math.random() * 2000 - 1000;
    const price = basePrice + randomVariation;
    
    data.push([time, price]);
  }
  
  return data;
} 