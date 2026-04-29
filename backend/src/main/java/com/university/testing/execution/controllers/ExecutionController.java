package com.university.testing.execution.controllers;

import com.university.testing.execution.services.ExecutionProducer;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/execution")
@RequiredArgsConstructor
public class ExecutionController {

    private final ExecutionProducer executionProducer;

    @PostMapping("/test")
    public ResponseEntity<String> testExecution() {
        //имитация кода
        String code = "print('Hello from Docker!')";
        String language = "python";

        executionProducer.sendTask(code, language);

        return ResponseEntity.ok("Задача отправлена в очередь RabbitMQ!");
    }
}