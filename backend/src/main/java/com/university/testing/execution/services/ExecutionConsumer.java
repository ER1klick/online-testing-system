package com.university.testing.execution.services;

import com.university.testing.execution.config.RabbitConfig;
import com.university.testing.shared.dtos.ExecutionTaskDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExecutionConsumer {
    private final DockerService dockerService;

    @RabbitListener(queues = RabbitConfig.QUEUE)
    public void receiveTask(ExecutionTaskDto task) {
        log.info("Received task for submission: {}", task.getSubmissionId());
        dockerService.runContainer(task);
    }
}