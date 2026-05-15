package com.university.testing.test.controllers;

import com.university.testing.shared.dtos.TestCreateDto;
import com.university.testing.shared.dtos.TestResponseDto;
import com.university.testing.test.data.TestAssignmentRepository;
import com.university.testing.test.data.TestRepository;
import com.university.testing.test.models.Test;
import com.university.testing.test.models.TestAssignment;
import com.university.testing.test.services.TestService;
import com.university.testing.auth.data.GroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tests")
@RequiredArgsConstructor
public class TestController {

    private final TestService testService;
    private final TestRepository testRepository;
    private final TestAssignmentRepository assignmentRepository;
    private final GroupRepository groupRepository;

    @PostMapping("/create")
    public ResponseEntity<TestResponseDto> createEmptyTest() {
        return ResponseEntity.ok(testService.createEmptyTest());
    }

    @GetMapping
    public ResponseEntity<List<TestResponseDto>> getAllTests() {
        return ResponseEntity.ok(testService.getAllTests());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TestResponseDto> getTest(@PathVariable UUID id) {
        return ResponseEntity.ok(testService.getTestById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TestResponseDto> updateTest(@PathVariable UUID id, @RequestBody TestCreateDto testDto) {
        return ResponseEntity.ok(testService.updateTest(id, testDto));
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<?> assignTest(@PathVariable UUID id, @RequestBody Map<String, Object> payload) {
        Test test = testRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Test not found"));

        List<String> studentIdStrings = (List<String>) payload.get("studentIds");
        List<UUID> studentIds = studentIdStrings.stream().map(UUID::fromString).toList();

        TestAssignment assignment = TestAssignment.builder()
                .test(test)
                .studentIds(studentIds)
                .startTime(LocalDateTime.parse(payload.get("startTime").toString()))
                .endTime(LocalDateTime.parse(payload.get("endTime").toString()))
                .build();

        assignmentRepository.save(assignment);
        return ResponseEntity.ok("Тест успешно назначен " + studentIds.size() + " студентам!");
    }

    @GetMapping("/my")
    public ResponseEntity<List<TestResponseDto>> getMyTests() {
        return ResponseEntity.ok(testService.getTestsForStudent());
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<UUID> startTest(@PathVariable UUID id) {
        return ResponseEntity.ok(testService.startTest(id));
    }

    @PostMapping("/{id}/submit-final")
    public ResponseEntity<?> submitTest(@PathVariable UUID id, @RequestBody java.util.Map<String, Object> submissionData) {
        return ResponseEntity.ok(testService.submitTest(id, submissionData));
    }
}