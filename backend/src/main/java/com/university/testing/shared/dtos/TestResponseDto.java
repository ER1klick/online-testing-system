package com.university.testing.shared.dtos;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class TestResponseDto {
    private UUID id;
    private String title;
    private String description;
    private boolean isPublished;
    private List<QuestionDto> questions;
}