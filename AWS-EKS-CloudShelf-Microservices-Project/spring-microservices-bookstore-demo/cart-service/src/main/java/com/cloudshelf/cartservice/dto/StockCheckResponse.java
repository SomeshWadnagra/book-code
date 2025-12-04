package com.cloudshelf.cartservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockCheckResponse {
    private String bookId;
    private boolean inStock;
    private int availableQuantity;
}
