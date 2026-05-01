package com.university.testing.shared.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExecutionTaskDto {
    private UUID submissionId;
    private UUID questionId;
    private String code;
    private String language;
}