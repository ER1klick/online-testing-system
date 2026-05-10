package com.university.testing.result.data;

import com.university.testing.result.models.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, UUID> {

    @Query("SELECT s FROM Submission s JOIN FETCH s.student WHERE s.test.id = :testId")
    List<Submission> findByTestIdWithStudent(@Param("testId") UUID testId);
}