package com.chrisbaileydeveloper.stockcheckservice.dto

data class CartStockCheckResponse(
    val bookId: String,
    val inStock: Boolean,
    val availableQuantity: Int
)