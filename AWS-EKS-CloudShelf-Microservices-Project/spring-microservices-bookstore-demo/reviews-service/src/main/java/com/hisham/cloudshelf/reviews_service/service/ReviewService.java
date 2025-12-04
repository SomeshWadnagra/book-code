package com.hisham.cloudshelf.reviews_service.service;

import com.hisham.cloudshelf.reviews_service.model.Review;
import com.hisham.cloudshelf.reviews_service.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.util.DoubleSummaryStatistics;
import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository repository;

    public ReviewService(ReviewRepository repository) {
        this.repository = repository;
    }

    public Review createReview(Review review) {
        return repository.save(review);
    }

    public List<Review> getReviewsForBook(Long bookId) {
        return repository.findByBookId(bookId);
    }

    public double getAverageRatingForBook(Long bookId) {
        List<Review> reviews = repository.findByBookId(bookId);
        if (reviews.isEmpty()) return 0.0;

        DoubleSummaryStatistics stats = reviews.stream()
                .mapToDouble(Review::getRating)
                .summaryStatistics();

        return stats.getAverage();
    }

    public List<Review> getAllReviews() {
        return repository.findAll();
    }


    public void deleteReview(Long id) {
        repository.deleteById(id);
    }
}
