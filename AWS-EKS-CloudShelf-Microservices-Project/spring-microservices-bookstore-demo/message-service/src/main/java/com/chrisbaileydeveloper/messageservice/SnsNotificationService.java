package com.chrisbaileydeveloper.messageservice;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.PublishRequest;
import software.amazon.awssdk.services.sns.model.PublishResponse;

import jakarta.annotation.PostConstruct;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
public class SnsNotificationService {

    @Value("${aws.sns.topic-arn:}")
    private String topicArn;

    @Value("${aws.region:us-east-1}")
    private String awsRegion;

    private SnsClient snsClient;

    private static final DateTimeFormatter PDT_FORMATTER = 
        DateTimeFormatter.ofPattern("yyyy-MM-dd hh:mm:ss a z");
    private static final ZoneId PDT_ZONE = ZoneId.of("America/Los_Angeles");

    @PostConstruct
    public void init() {
        if (topicArn != null && !topicArn.isEmpty()) {
            this.snsClient = SnsClient.builder()
                .region(Region.of(awsRegion))
                .build();
            log.info("SNS client initialized for topic: {}", topicArn);
        } else {
            log.warn("SNS topic ARN not configured, email notifications disabled");
        }
    }

    public void sendOrderNotification(String orderNumber, String traceId) {
        if (snsClient == null || topicArn == null || topicArn.isEmpty()) {
            log.info("SNS not configured, skipping email notification for order: {}", orderNumber);
            return;
        }

        String pdtTime = ZonedDateTime.now(PDT_ZONE).format(PDT_FORMATTER);

        String subject = "Order Placed Successfully - " + orderNumber;
        
        String message = String.format("""
            ====================================
            ORDER CONFIRMATION
            ====================================
            
            Time (PDT): %s
            Order Number: %s
            Trace ID: %s
            
            Your order has been placed successfully!
            
            Thank you for shopping with CloudShelf.
            ====================================
            """, pdtTime, orderNumber, traceId);

        try {
            PublishRequest request = PublishRequest.builder()
                .topicArn(topicArn)
                .subject(subject)
                .message(message)
                .build();

            PublishResponse response = snsClient.publish(request);
            log.info("Email notification sent for order: {}, messageId: {}", 
                orderNumber, response.messageId());
        } catch (Exception e) {
            log.error("Failed to send email notification for order: {}", orderNumber, e);
        }
    }
}