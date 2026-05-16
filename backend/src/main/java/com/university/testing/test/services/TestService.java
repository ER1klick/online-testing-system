package com.university.testing.test.services;

import com.university.testing.auth.data.UserRepository;
import com.university.testing.execution.services.ExecutionProducer;
import com.university.testing.result.data.AnswerRepository;
import com.university.testing.result.data.SubmissionRepository;
import com.university.testing.result.models.Answer;
import com.university.testing.result.models.Submission;
import com.university.testing.shared.dtos.ExecutionTaskDto;
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
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TestService {
    private final TestRepository testRepository;
    private final UserRepository userRepository;
    private final TestAssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final AnswerRepository answerRepository;
    private final ExecutionProducer executionProducer;

    private User getCurrentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new RuntimeException("Not authenticated");
        return userRepository.findByEmail(auth.getName())
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
        User currentUser = getCurrentUser();

        Test test = testRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Test not found"));

        List<QuestionDto> questionDtos = (test.getQuestions() == null) ? List.of() :
                test.getQuestions().stream().map(q -> {
                    QuestionDto dto = new QuestionDto();
                    dto.setId(q.getId());
                    dto.setText(q.getText());
                    dto.setType(q.getType());
                    dto.setSectionTitle(q.getSectionTitle());

                    Map<String, Object> content = q.getContent();
                    if (currentUser.getRole() == User.Role.STUDENT && content != null) {
                        Map<String, Object> filteredContent = new java.util.HashMap<>(content);
                        filteredContent.remove("correct");
                        dto.setContent(filteredContent);
                    } else {
                        dto.setContent(content);
                    }

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
                .finalScore(0.0)
                .build();

        return submissionRepository.save(submission).getId();
    }

    @Transactional
    @SuppressWarnings("unchecked")
    public UUID submitTest(UUID testId, Map<String, Object> submissionData) {
        User student = getCurrentUser();
        Test test = testRepository.findById(testId).orElseThrow();

        Submission submission = Submission.builder()
                .student(student)
                .test(test)
                .submittedAt(LocalDateTime.now())
                .groupName(student.getStudentGroup() != null ? student.getStudentGroup().getName() : "External")
                .finalScore(0.0)
                .build();

        final Submission savedSubmission = submissionRepository.save(submission);
        Map<String, Object> answersMap = (Map<String, Object>) submissionData.get("answers");

        double[] totalTheoryScore = {0.0};

        if (answersMap != null) {
            answersMap.forEach((qIdStr, studentAns) -> {
                UUID qId = UUID.fromString(qIdStr);
                Question question = test.getQuestions().stream()
                        .filter(q -> q.getId().equals(qId))
                        .findFirst().orElseThrow();

                Answer answer = Answer.builder()
                        .submission(savedSubmission)
                        .question(question)
                        .studentAnswer(studentAns.toString())
                        .score(null)
                        .build();

                double maxPoints = 1.0;
                if (question.getContent() != null && question.getContent().containsKey("points")) {
                    maxPoints = Double.parseDouble(question.getContent().get("points").toString());
                }

                if ("CODE".equals(question.getType())) {
                    String lang = (question.getContent() != null && question.getContent().containsKey("language"))
                            ? question.getContent().get("language").toString()
                            : "python";

                    executionProducer.sendTask(ExecutionTaskDto.builder()
                            .submissionId(savedSubmission.getId())
                            .questionId(qId)
                            .code(studentAns.toString())
                            .language(lang)
                            .build());
                } else if ("TEXT".equals(question.getType())) {
                    answer.setScore(null);
                } else {
                    double score = 0.0;
                    if (question.getContent() != null && question.getContent().containsKey("correct")) {
                        List<?> correctList = (List<?>) question.getContent().get("correct");

                        if ("SINGLE_CHOICE".equals(question.getType())) {
                            if (!correctList.isEmpty() && String.valueOf(correctList.get(0)).equals(String.valueOf(studentAns))) {
                                score = maxPoints;
                            }
                        } else if ("MULTIPLE_CHOICE".equals(question.getType()) && studentAns instanceof List) {
                            List<String> sList = ((List<?>) studentAns).stream().map(String::valueOf).sorted().toList();
                            List<String> cList = correctList.stream().map(String::valueOf).sorted().toList();
                            if (sList.equals(cList)) score = maxPoints;
                        }
                    }
                    answer.setScore(score);
                    totalTheoryScore[0] += score;
                }
                answerRepository.save(answer);
            });
        }

        savedSubmission.setFinalScore(totalTheoryScore[0]);
        submissionRepository.save(savedSubmission);

        return savedSubmission.getId();
    }
}