package com.hisham.cloudshelf.reviews_service.repository;

import com.hisham.cloudshelf.reviews_service.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByBookId(Long bookId);

    List<Review> findByUserId(Long userId);
}
