package com.university.testing.execution.services;

import com.university.testing.execution.config.RabbitConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ExecutionProducer {

    private final RabbitTemplate rabbitTemplate;

    public void sendTask(String code, String language) {
        String message = "Code: " + code + " | Lang: " + language;
        rabbitTemplate.convertAndSend(RabbitConfig.EXECUTION_QUEUE, message);
    }
}