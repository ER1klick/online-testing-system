package com.university.testing.execution.services;

import com.university.testing.execution.config.RabbitConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ExecutionConsumer {
    private final DockerService dockerService;

    @RabbitListener(queues = RabbitConfig.EXECUTION_QUEUE)
    public void receiveTask(String message) {
        System.out.println("Получена задача: " + message);

        dockerService.runCode(message);
    }
}