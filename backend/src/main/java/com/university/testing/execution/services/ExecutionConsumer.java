package com.university.testing.execution.services;

import com.university.testing.execution.config.RabbitConfig;
import com.university.testing.result.services.ResultService;
import com.university.testing.shared.dtos.ExecutionTaskDto;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ExecutionConsumer {
    private final DockerService dockerService;
    private final ResultService resultService;

    @RabbitListener(queues = RabbitConfig.EXECUTION_QUEUE)
    public void receiveTask(ExecutionTaskDto task) {
        String output = dockerService.runCode(task.getCode(), task.getLanguage());

        resultService.saveResult(task.getSubmissionId(), task.getQuestionId(), output);
    }

}