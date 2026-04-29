package com.university.testing.test.controllers;

import com.university.testing.shared.dtos.TestCreateDto;
import com.university.testing.shared.dtos.TestResponseDto;
import com.university.testing.test.models.Test;
import com.university.testing.test.services.TestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/tests")
@RequiredArgsConstructor
public class TestController {
    private final TestService testService;

    @PostMapping
    public ResponseEntity<TestResponseDto> createTest(@RequestBody TestCreateDto testDto) {
        return ResponseEntity.ok(testService.createTest(testDto));
    }

    @GetMapping
    public List<Test> getAllTests() {
        return testService.getAllTests();
    }
}