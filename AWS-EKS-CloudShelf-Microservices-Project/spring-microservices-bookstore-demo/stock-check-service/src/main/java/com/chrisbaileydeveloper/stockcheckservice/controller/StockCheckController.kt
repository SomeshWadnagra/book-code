package com.chrisbaileydeveloper.stockcheckservice.controller

import com.chrisbaileydeveloper.stockcheckservice.dto.StockCheckResponse
import com.chrisbaileydeveloper.stockcheckservice.dto.CartStockCheckResponse
import com.chrisbaileydeveloper.stockcheckservice.service.StockCheckService
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api")
class StockCheckController(private val stockCheckService: StockCheckService) {

    private val log = LoggerFactory.getLogger(StockCheckController::class.java)

    // Existing endpoint for order-service (List-based)
    @GetMapping("/stockcheck")
    @ResponseStatus(HttpStatus.OK)
    fun isInStock(@RequestParam skuCode: List<String>): List<StockCheckResponse> {
        log.info("Stock check request received for skuCode: {}", skuCode)
        return stockCheckService.isInStock(skuCode)
    }

    // New endpoint for cart-service (single bookId + quantity)
    @GetMapping("/stock/check")
    @ResponseStatus(HttpStatus.OK)
    fun checkStockForCart(
        @RequestParam bookId: String,
        @RequestParam quantity: Int
    ): CartStockCheckResponse {
        log.info("Cart stock check request received for bookId: {}, quantity: {}", bookId, quantity)
        return stockCheckService.checkStockForCart(bookId, quantity)
    }
}