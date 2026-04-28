package com.university.testing;

import com.university.testing.auth.data.UserRepository;
import com.university.testing.shared.models.User;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class TestingApplication {

	public static void main(String[] args) {
		SpringApplication.run(TestingApplication.class, args);
	}

	@Bean
	CommandLineRunner init(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			if (userRepository.findByEmail("admin@test.com").isEmpty()) {
				userRepository.save(User.builder()
						.email("admin@test.com")
						.password(passwordEncoder.encode("admin123"))
						.role(User.Role.ADMIN)
						.build());
			}
		};
	}
}
