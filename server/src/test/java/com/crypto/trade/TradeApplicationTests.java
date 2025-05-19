package com.crypto.trade;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

@SpringBootTest
@AutoConfigureMockMvc
class TradeApplicationTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;


	@Test
	void testGetCoinListEndpoint() throws Exception {

		mockMvc.perform(get("/coins?page=1")
						.accept(MediaType.APPLICATION_JSON))
				.andDo(print()) //
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").isNotEmpty())
				.andExpect(jsonPath("$[0].name").exists());
	}

	@Test
	void testGetMarketChartEndpoint() throws Exception {
		// ✅ 打印真实接口响应内容
		mockMvc.perform(get("/coins/bitcoin/chart?days=7")
						.accept(MediaType.APPLICATION_JSON))
				.andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.prices").exists());
	}
}
