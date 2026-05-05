package com.university.testing.config;

import com.university.testing.result.data.SubmissionRepository;
import com.university.testing.result.models.Submission;
import com.university.testing.shared.models.User;
import com.university.testing.test.data.TestRepository;
import com.university.testing.test.models.Test;
import com.university.testing.auth.data.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UserRepository userRepo, TestRepository testRepo, SubmissionRepository subRepo, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepo.findByEmail("admin2@test.com").isEmpty()) {
                User admin = userRepo.save(User.builder().email("admin2@test.com").password(passwordEncoder.encode("admin123")).role(User.Role.ADMIN).build());
                Test test = testRepo.save(Test.builder().title("Sample Test").description("Description").isPublished(true).build());
                Submission sub = subRepo.save(Submission.builder().student(admin).test(test).submittedAt(LocalDateTime.now()).build());

                log.info("--- TEST DATA INITIALIZED ---");
                log.info("Submission ID: {}", sub.getId());
            } else {
                log.info("Test data already exists. Skipping initialization.");
            }
        };
    }
}