package com.university.testing.test.services;

import com.university.testing.shared.dtos.QuestionDto;
import com.university.testing.shared.dtos.TestCreateDto;
import com.university.testing.shared.dtos.TestResponseDto;
import com.university.testing.test.data.TestRepository;
import com.university.testing.test.models.Question;
import com.university.testing.test.models.Test;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TestService {
    private final TestRepository testRepository;

    @Transactional
    public TestResponseDto createTest(TestCreateDto dto) {
        Test test = Test.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .isPublished(false)
                .build();

        List<Question> questions = dto.getQuestions().stream().map(qDto ->
                Question.builder()
                        .text(qDto.getText())
                        .type(qDto.getType())
                        .content(qDto.getContent())
                        .sectionTitle(qDto.getSectionTitle()) // Сохраняем раздел
                        .test(test)
                        .build()
        ).toList();

        test.setQuestions(questions);
        Test savedTest = testRepository.save(test);

        return getTestById(savedTest.getId());
    }

    @Transactional(readOnly = true)
    public List<TestResponseDto> getAllTests() {
        return testRepository.findAll().stream().map(test ->
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

        List<QuestionDto> questionDtos = test.getQuestions().stream().map(q -> {
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

    @Transactional
    public TestResponseDto createEmptyTest() {
        Test test = Test.builder()
                .title("Новый тест")
                .description("Описание")
                .isPublished(false)
                .build();
        Test savedTest = testRepository.save(test);
        return getTestById(savedTest.getId());
    }
}