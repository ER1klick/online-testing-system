package com.university.testing.execution.controllers;

import com.university.testing.execution.services.ExecutionProducer;
import com.university.testing.execution.services.KubernetesService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired
    private KubernetesService kubernetesService;

    @PostMapping("/test-k8s")
    public ResponseEntity<String> testK8s() {
        try {
            kubernetesService.runJob("print('Hello from K8s!')", "python");
            return ResponseEntity.ok("Job успешно отправлена в Kubernetes!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Ошибка K8s: " + e.getMessage());
        }
    }
}