package com.university.testing.auth.controllers;

import com.university.testing.auth.data.UserRepository;
import com.university.testing.shared.dtos.StudentDto;
import com.university.testing.shared.models.User;
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
        List<User> users = userRepository.findByStudentGroupName(groupName);

        List<StudentDto> students = users.stream()
                .map(u -> StudentDto.builder()
                        .id(u.getId())
                        .email(u.getEmail())
                        .fullName(u.getFullName())
                        .groupName(u.getStudentGroup() != null ? u.getStudentGroup().getName() : null)
                        .build())
                .toList();

        return ResponseEntity.ok(students);
    }
}