package com.university.testing.test.data;

import com.university.testing.test.models.Test;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface TestRepository extends JpaRepository<Test, UUID> {
}