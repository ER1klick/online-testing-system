package com.university.testing.shared.dtos;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class StudentDto {
    private UUID id;
    private String email;
    private String groupName;
    private String fullName;
}