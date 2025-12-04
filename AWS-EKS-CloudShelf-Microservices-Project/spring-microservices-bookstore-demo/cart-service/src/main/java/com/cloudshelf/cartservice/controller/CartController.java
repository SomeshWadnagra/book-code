package com.cloudshelf.cartservice.controller;

import com.cloudshelf.cartservice.model.Cart;
import com.cloudshelf.cartservice.model.CartItem;
import com.cloudshelf.cartservice.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping("/{userId}")
    public Cart getCart(@PathVariable String userId) {
        return cartService.getCart(userId);
    }

    @PostMapping("/{userId}/add")
    public Cart addToCart(@PathVariable String userId,
                          @RequestBody CartItem item) {
        return cartService.addItem(userId, item);  // Changed from addToCart to addItem
    }

    @DeleteMapping("/{userId}/remove/{bookId}")
    public Cart removeItem(@PathVariable String userId,
                           @PathVariable String bookId) {
        return cartService.removeItem(userId, bookId);
    }

    @DeleteMapping("/{userId}/clear")
    public void clearCart(@PathVariable String userId) {
        cartService.clearCart(userId);
    }

    @PostMapping("/{userId}/checkout")
    public String checkout(@PathVariable String userId) {
        return cartService.checkout(userId);
    }
}