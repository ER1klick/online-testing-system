package com.university.testing.test.data;

import com.university.testing.test.models.Test;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface TestRepository extends JpaRepository<Test, UUID> {

    @Query("SELECT DISTINCT t FROM Test t LEFT JOIN t.coAuthors c WHERE t.author.id = :userId OR c.id = :userId")
    List<Test> findAvailableForTeacher(@Param("userId") UUID userId);
}