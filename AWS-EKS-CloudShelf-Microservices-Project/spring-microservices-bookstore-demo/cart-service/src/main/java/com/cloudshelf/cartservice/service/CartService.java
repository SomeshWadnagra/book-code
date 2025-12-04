package com.cloudshelf.cartservice.service;

import com.cloudshelf.cartservice.client.OrderServiceClient;
import com.cloudshelf.cartservice.client.StockCheckClient;
import com.cloudshelf.cartservice.dto.OrderLineItemsDto;
import com.cloudshelf.cartservice.dto.OrderRequest;
import com.cloudshelf.cartservice.model.Cart;
import com.cloudshelf.cartservice.model.CartItem;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CartService {

    private final RedisTemplate<String, Cart> redisTemplate;
    private final StockCheckClient stockCheckClient;
    private final OrderServiceClient orderServiceClient;
    private static final String CART_PREFIX = "cart:";

    public CartService(RedisTemplate<String, Cart> redisTemplate,
                       StockCheckClient stockCheckClient,
                       OrderServiceClient orderServiceClient) {
        this.redisTemplate = redisTemplate;
        this.stockCheckClient = stockCheckClient;
        this.orderServiceClient = orderServiceClient;
    }

    public Cart getCart(String userId) {
        Cart cart = redisTemplate.opsForValue().get(CART_PREFIX + userId);
        return cart != null ? cart : new Cart(userId);
    }

    public Cart addItem(String userId, CartItem item) {
        // Check stock availability
        Map<String, Object> stockResponse = stockCheckClient.checkStock(
            item.getBookId(), 
            item.getQuantity()
        );
        
        Boolean inStock = (Boolean) stockResponse.get("inStock");
        if (inStock == null || !inStock) {
            throw new RuntimeException("Item not in stock: " + item.getBookId());
        }

        Cart cart = getCart(userId);
        cart.addItem(item);
        redisTemplate.opsForValue().set(CART_PREFIX + userId, cart);
        return cart;
    }

    public Cart removeItem(String userId, String bookId) {
        Cart cart = getCart(userId);
        cart.removeItem(bookId);
        redisTemplate.opsForValue().set(CART_PREFIX + userId, cart);
        return cart;
    }

    public void clearCart(String userId) {
        redisTemplate.delete(CART_PREFIX + userId);
    }

    public String checkout(String userId) {
        Cart cart = getCart(userId);

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty. Cannot checkout.");
        }

        // Build OrderRequest to send to order-service
        OrderRequest request = new OrderRequest();
        request.setUserId(userId);

        List<OrderLineItemsDto> orderItems = cart.getItems()
            .stream()
            .map(i -> new OrderLineItemsDto(
                i.getBookId(),                          // skuCode
                BigDecimal.valueOf(i.getPrice()),       // price as BigDecimal
                i.getQuantity()                         // quantity
            ))
            .collect(Collectors.toList());

        request.setOrderLineItemsDtoList(orderItems);

        // Call the Order-Service (Feign Client)
        Map<String, String> response = orderServiceClient.placeOrder(request);

        if (response == null || response.get("status") == null) {
            throw new RuntimeException("Invalid order-service response.");
        }

        if (!"success".equalsIgnoreCase(response.get("status"))) {
            throw new RuntimeException("Order failed: " + response.get("message"));
        }

        // SUCCESS → clear cart
        clearCart(userId);

        // Return success message (order-service doesn't return orderId)
        return response.get("message");
    }
}