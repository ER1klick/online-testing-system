package com.university.testing.test.services;

import com.university.testing.shared.dtos.TestCreateDto;
import com.university.testing.shared.dtos.TestResponseDto;
import com.university.testing.test.data.TestRepository;
import com.university.testing.test.models.Test;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TestService {
    private final TestRepository testRepository;

    public TestResponseDto createTest(TestCreateDto dto) {
        // Логика маппинга, которую мы писали ранее
        Test test = Test.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .isPublished(false)
                .build();

        Test savedTest = testRepository.save(test);

        return TestResponseDto.builder()
                .id(savedTest.getId())
                .title(savedTest.getTitle())
                .description(savedTest.getDescription())
                .isPublished(savedTest.isPublished())
                .build();
    }

    public List<Test> getAllTests() {
        return testRepository.findAll();
    }
}