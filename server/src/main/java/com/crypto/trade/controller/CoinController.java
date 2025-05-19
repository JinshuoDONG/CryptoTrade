package com.crypto.trade.controller;

import com.crypto.trade.Service.CoinService;
import com.crypto.trade.model.Coin;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/coins")
public class CoinController {
    @Autowired
    private CoinService coinService;
    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping
    ResponseEntity<List<Coin>>getCoinList(@RequestParam("page") int page) throws Exception {
        List<Coin> coins=coinService.getCoinList(page);
        return new ResponseEntity<>(coins, HttpStatus.OK);
    }

    @GetMapping("/{coinId}/chart")
    ResponseEntity<JsonNode>getMarketChart(
            @PathVariable String coinId,
            @RequestParam("days") int days) throws Exception {

        String res=coinService.getMarketChart(coinId, days);
        JsonNode jsonNode=objectMapper.readTree(res);
        return new ResponseEntity<>(jsonNode, HttpStatus.OK);
    }

}
