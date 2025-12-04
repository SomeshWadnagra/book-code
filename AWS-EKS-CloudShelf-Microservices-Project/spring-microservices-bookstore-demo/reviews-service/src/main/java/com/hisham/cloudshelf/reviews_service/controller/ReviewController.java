package com.hisham.cloudshelf.reviews_service.controller;

import com.hisham.cloudshelf.reviews_service.model.Review;
import com.hisham.cloudshelf.reviews_service.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    private final ReviewService service;

    public ReviewController(ReviewService service) {
        this.service = service;
    }

    @GetMapping("/health")
    public String health() {
        return "Reviews Service is running";
    }

    @GetMapping
    public ResponseEntity<List<Review>> getAllReviews() {
        return ResponseEntity.ok(service.getAllReviews());
    }


    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody @Valid Review review) {
        Review saved = service.createReview(review);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/book/{bookId}")
    public ResponseEntity<List<Review>> getReviewsForBook(@PathVariable Long bookId) {
        return ResponseEntity.ok(service.getReviewsForBook(bookId));
    }

    @GetMapping("/book/{bookId}/average-rating")
    public ResponseEntity<Map<String, Object>> getAverageRating(@PathVariable Long bookId) {
        double avg = service.getAverageRatingForBook(bookId);
        return ResponseEntity.ok(Map.of(
                "bookId", bookId,
                "averageRating", avg
        ));

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        service.deleteReview(id);
        return ResponseEntity.noContent().build();
    }
}
