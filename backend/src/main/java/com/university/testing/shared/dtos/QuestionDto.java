package com.university.testing.shared.dtos;

import lombok.Data;
import java.util.Map;

@Data
public class QuestionDto {
    private String text;
    private String type;
    private Map<String, Object> content;
}