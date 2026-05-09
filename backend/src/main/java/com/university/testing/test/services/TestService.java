package com.university.testing.test.services;

import com.university.testing.auth.data.UserRepository;
import com.university.testing.result.data.SubmissionRepository;
import com.university.testing.result.models.Submission;
import com.university.testing.shared.dtos.QuestionDto;
import com.university.testing.shared.dtos.TestCreateDto;
import com.university.testing.shared.dtos.TestResponseDto;
import com.university.testing.shared.models.User;
import com.university.testing.test.data.TestAssignmentRepository;
import com.university.testing.test.data.TestRepository;
import com.university.testing.test.models.Question;
import com.university.testing.test.models.Test;
import com.university.testing.test.models.TestAssignment;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TestService {
    private final TestRepository testRepository;
    private final UserRepository userRepository;
    private final TestAssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public TestResponseDto createEmptyTest() {
        User currentUser = getCurrentUser();
        Test test = Test.builder()
                .title("New Test")
                .description("Description")
                .isPublished(false)
                .author(currentUser)
                .build();
        Test savedTest = testRepository.save(test);
        return getTestById(savedTest.getId());
    }

    @Transactional(readOnly = true)
    public List<TestResponseDto> getAllTests() {
        User currentUser = getCurrentUser();
        List<Test> tests;

        if (currentUser.getRole() == User.Role.ADMIN) {
            tests = testRepository.findAll();
        } else {
            tests = testRepository.findAvailableForTeacher(currentUser.getId());
        }

        return tests.stream().map(test ->
                TestResponseDto.builder()
                        .id(test.getId())
                        .title(test.getTitle())
                        .description(test.getDescription())
                        .isPublished(test.isPublished())
                        .questions(List.of())
                        .build()
        ).toList();
    }

    @Transactional(readOnly = true)
    public TestResponseDto getTestById(UUID id) {
        Test test = testRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Test not found"));

        List<QuestionDto> questionDtos = (test.getQuestions() == null) ? List.of() :
                test.getQuestions().stream().map(q -> {
                    QuestionDto dto = new QuestionDto();
                    dto.setText(q.getText());
                    dto.setType(q.getType());
                    dto.setContent(q.getContent());
                    dto.setSectionTitle(q.getSectionTitle());
                    return dto;
                }).toList();

        return TestResponseDto.builder()
                .id(test.getId())
                .title(test.getTitle())
                .description(test.getDescription())
                .isPublished(test.isPublished())
                .questions(questionDtos)
                .build();
    }

    @Transactional
    public TestResponseDto updateTest(UUID id, TestCreateDto dto) {
        Test test = testRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Test not found"));

        test.setTitle(dto.getTitle());
        test.setDescription(dto.getDescription());
        test.getQuestions().clear();
        testRepository.saveAndFlush(test);

        List<Question> newQuestions = dto.getQuestions().stream()
                .filter(java.util.Objects::nonNull)
                .map(qDto -> Question.builder()
                        .text(qDto.getText())
                        .type(qDto.getType())
                        .content(qDto.getContent())
                        .sectionTitle(qDto.getSectionTitle())
                        .test(test)
                        .build()
                ).toList();

        test.getQuestions().addAll(newQuestions);
        testRepository.save(test);
        return getTestById(id);
    }

    @Transactional(readOnly = true)
    public List<TestResponseDto> getTestsForStudent() {
        UUID studentId = getCurrentUser().getId();
        List<TestAssignment> assignments = assignmentRepository.findByStudentIdsContaining(studentId);

        return assignments.stream()
                .map(TestAssignment::getTest)
                .map(test -> TestResponseDto.builder()
                        .id(test.getId())
                        .title(test.getTitle())
                        .description(test.getDescription())
                        .build())
                .toList();
    }

    @Transactional
    public UUID startTest(UUID testId) {
        User student = getCurrentUser();
        Test test = testRepository.findById(testId).orElseThrow();

        Submission submission = Submission.builder()
                .student(student)
                .test(test)
                .submittedAt(LocalDateTime.now())
                .groupName(student.getStudentGroup() != null ? student.getStudentGroup().getName() : "External")
                .build();

        return submissionRepository.save(submission).getId();
    }
}