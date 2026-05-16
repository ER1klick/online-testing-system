package com.university.testing.result.controllers;

import com.university.testing.result.services.ResultService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/results")
public class ResultController {

    private final ResultService resultService;

    public ResultController(ResultService resultService) {
        this.resultService = resultService;
    }

    @GetMapping("/test/{testId}")
    public ResponseEntity<?> getResultsByTest(@PathVariable UUID testId) {
        return ResponseEntity.ok(resultService.getResultsForTest(testId));
    }

    @GetMapping("/submission/{submissionId}")
    public ResponseEntity<?> getSubmissionDetails(@PathVariable UUID submissionId) {
        return ResponseEntity.ok(resultService.getSubmissionDetails(submissionId));
    }

    @PutMapping("/answers/{answerId}/score")
    public ResponseEntity<?> updateScore(@PathVariable UUID answerId, @RequestBody java.util.Map<String, Double> payload) {
        resultService.updateAnswerScore(answerId, payload.get("score"));
        return ResponseEntity.ok("Оценка обновлена");
    }
}