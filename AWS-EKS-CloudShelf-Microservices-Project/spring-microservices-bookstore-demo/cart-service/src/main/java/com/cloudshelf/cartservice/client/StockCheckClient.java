package com.cloudshelf.cartservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

@FeignClient(name = "stock-check-service", url = "${STOCK_CHECK_SERVICE_URL:http://stock-check-service.cloudshelf.svc.cluster.local:8083}")
public interface StockCheckClient {

    @GetMapping("/api/stock/check")
    Map<String, Object> checkStock(@RequestParam("bookId") String bookId, 
                                   @RequestParam("quantity") int quantity);
}