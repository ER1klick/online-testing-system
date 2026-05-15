package com.university.testing.shared.dtos;

import lombok.Data;
import java.util.Map;
import java.util.UUID;
@Data
public class QuestionDto {
    private UUID id;
    private String text;
    private String type;
    private Map<String, Object> content;
    private String sectionTitle;
}