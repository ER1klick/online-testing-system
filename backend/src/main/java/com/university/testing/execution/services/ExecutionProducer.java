package com.university.testing.execution.services;

import com.university.testing.execution.config.RabbitConfig;
import com.university.testing.shared.dtos.ExecutionTaskDto; // Убедитесь, что импорт есть
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExecutionProducer {
    private final RabbitTemplate rabbitTemplate;

    public void sendTask(String code, String language, UUID submissionId, UUID questionId) {
        ExecutionTaskDto task = ExecutionTaskDto.builder()
                .code(code)
                .language(language)
                .submissionId(submissionId)
                .questionId(questionId)
                .build();

        rabbitTemplate.convertAndSend(RabbitConfig.EXECUTION_QUEUE, task);
    }
}