package com.crypto.trade.Service;

import com.crypto.trade.model.Coin;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface CoinService {
    List<Coin> getCoinList(int page) throws Exception;

    String getMarketChart(String coinId, int days) throws Exception;

    String getCoinDetail(String coinId) throws Exception;

    Coin findById(String coinId) throws Exception;

    String searchCoin(String keyword) throws Exception;

    String get50CoinsByMarketCapRank() throws Exception;

    String getTradingCoins() throws Exception;
}
