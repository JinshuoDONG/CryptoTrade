package com.crypto.trade.repository;

import com.crypto.trade.model.Coin;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CoinRepository extends JpaRepository<Coin, String> {

}
