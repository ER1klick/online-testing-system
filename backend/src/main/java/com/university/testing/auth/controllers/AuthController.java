package com.university.testing.auth.controllers;

import com.university.testing.auth.data.UserRepository;
import com.university.testing.auth.services.AuthService;
import com.university.testing.shared.dtos.LoginRequest;
import com.university.testing.shared.models.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        User user = authService.authenticate(request);

        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                user.getEmail(),
                null,
                List.of(() -> "ROLE_" + user.getRole().name())
        );
        SecurityContextHolder.getContext().setAuthentication(authToken);

        HttpSession session = httpRequest.getSession(true);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, SecurityContextHolder.getContext());

        return ResponseEntity.ok("Successful authorization. Session created.");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.ok(Map.of("role", "GUEST"));
        }

        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(Map.of(
                "email", user.getEmail(),
                "role", user.getRole().name(),
                "fullName", user.getFullName() != null ? user.getFullName() : ""
        ));
    }
}