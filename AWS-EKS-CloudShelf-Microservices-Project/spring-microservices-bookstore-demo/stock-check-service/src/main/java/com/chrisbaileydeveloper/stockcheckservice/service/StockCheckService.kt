package com.chrisbaileydeveloper.stockcheckservice.service

import com.chrisbaileydeveloper.stockcheckservice.dto.StockCheckResponse
import com.chrisbaileydeveloper.stockcheckservice.dto.CartStockCheckResponse
import com.chrisbaileydeveloper.stockcheckservice.repository.StockCheckRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
open class StockCheckService(private val stockCheckRepository: StockCheckRepository) {

    private val log = LoggerFactory.getLogger(StockCheckService::class.java)

    // Existing method for order-service
    @Transactional(readOnly = true)
    open fun isInStock(skuCode: List<String>): List<StockCheckResponse> {
        log.info("Checking Stock for {}", skuCode)
        return stockCheckRepository.findBySkuCodeIn(skuCode).map { stockCheck ->
            StockCheckResponse(
                skuCode = stockCheck.skuCode,
                isInStock = stockCheck.quantity > 0
            )
        }
    }

    // New method for cart-service
    @Transactional(readOnly = true)
    open fun checkStockForCart(bookId: String, requestedQuantity: Int): CartStockCheckResponse {
        log.info("Checking stock for cart - bookId: {}, quantity: {}", bookId, requestedQuantity)
        
        val stockCheck = stockCheckRepository.findBySkuCodeIn(listOf(bookId)).firstOrNull()
        
        return if (stockCheck != null) {
            CartStockCheckResponse(
                bookId = bookId,
                inStock = stockCheck.quantity >= requestedQuantity,
                availableQuantity = stockCheck.quantity
            )
        } else {
            log.warn("Book not found in stock: {}", bookId)
            CartStockCheckResponse(
                bookId = bookId,
                inStock = false,
                availableQuantity = 0
            )
        }
    }
}