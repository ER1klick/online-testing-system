package com.university.testing.shared.dtos;

import lombok.Data;
import java.util.List;

@Data
public class TestCreateDto {
    private String title;
    private String description;
    private List<QuestionDto> questions;
}