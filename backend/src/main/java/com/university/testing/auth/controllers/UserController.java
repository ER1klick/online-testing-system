package com.university.testing.auth.controllers;

import com.university.testing.auth.data.UserRepository;
import com.university.testing.shared.dtos.TeacherCreateDto;
import com.university.testing.shared.models.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/teacher")
    public ResponseEntity<String> addTeacher(@RequestBody TeacherCreateDto dto) {
        String email = dto.getEmployeeId() + "@edu.rut-miit.ru";

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body("Преподаватель с таким табельным номером уже существует");
        }

        User teacher = User.builder()
                .email(email)
                .fullName(dto.getFullName())
                .password(passwordEncoder.encode("password"+dto.getEmployeeId()))
                .role(User.Role.TEACHER)
                .build();

        userRepository.save(teacher);
        return ResponseEntity.ok("Преподаватель успешно добавлен");
    }
}