package com.university.testing.execution.controllers;

import com.university.testing.execution.services.ExecutionProducer;
import com.university.testing.shared.dtos.ExecutionTaskDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/execution")
@RequiredArgsConstructor
public class ExecutionController {

    private final ExecutionProducer executionProducer;

    @PostMapping("/test")
    public ResponseEntity<String> testExecution(@RequestBody ExecutionTaskDto task) {
        executionProducer.sendTask(
                task.getCode(),
                task.getLanguage(),
                task.getSubmissionId(),
                task.getQuestionId()
        );

        return ResponseEntity.ok("Задача отправлена в очередь RabbitMQ!");
    }
}