package com.university.testing.execution.services;

import com.university.testing.execution.config.RabbitConfig;
import com.university.testing.shared.dtos.ExecutionTaskDto;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ExecutionProducer {
    private final RabbitTemplate rabbitTemplate;

    public void sendTask(ExecutionTaskDto task) {
        rabbitTemplate.convertAndSend(
                RabbitConfig.EXCHANGE,
                RabbitConfig.ROUTING_KEY,
                task
        );
    }
}