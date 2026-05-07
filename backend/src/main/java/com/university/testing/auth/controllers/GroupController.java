package com.university.testing.auth.controllers;

import com.university.testing.auth.data.UserRepository;
import com.university.testing.shared.dtos.StudentDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/groups")
@RequiredArgsConstructor
public class GroupController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<String>> getAllGroups() {
        return ResponseEntity.ok(userRepository.findDistinctGroupNames());
    }

    @GetMapping("/{groupName}/students")
    public ResponseEntity<List<StudentDto>> getStudentsByGroup(@PathVariable String groupName) {
        List<StudentDto> students = userRepository.findByGroupName(groupName).stream()
                .map(u -> StudentDto.builder()
                        .id(u.getId())
                        .fullName(u.getFullName())
                        .email(u.getEmail())
                        .groupName(u.getGroupName())
                        .build())
                .toList();
        return ResponseEntity.ok(students);
    }
}