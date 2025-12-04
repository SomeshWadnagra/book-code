package com.chrisbaileydeveloper.messageservice;

import io.micrometer.observation.Observation;
import io.micrometer.observation.ObservationRegistry;
import io.micrometer.tracing.Tracer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.kafka.annotation.KafkaListener;

@SpringBootApplication
@Slf4j
@RequiredArgsConstructor
public class MessageServiceApplication {

    private final ObservationRegistry observationRegistry;
    private final Tracer tracer;
    private final SnsNotificationService snsNotificationService;

    public static void main(String[] args) {
        SpringApplication.run(MessageServiceApplication.class, args);
    }

    @KafkaListener(topics = "messageTopic")
    public void handleMessage(OrderPlacedEvent orderPlacedEvent) {
        Observation.createNotStarted("on-message", this.observationRegistry).observe(() -> {
            String traceId = this.tracer.currentSpan().context().traceId();
            
            log.info("Received message <{}>", orderPlacedEvent);
            log.info("For TraceId- {}, Received message for Order - {}", 
                traceId, orderPlacedEvent.getOrderNumber());
            
            // Send email notification via SNS
            snsNotificationService.sendOrderNotification(
                orderPlacedEvent.getOrderNumber(), 
                traceId
            );
        });
    }
}