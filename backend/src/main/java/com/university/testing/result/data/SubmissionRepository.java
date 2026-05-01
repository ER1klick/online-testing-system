package com.university.testing.result.data;

import com.university.testing.result.models.Submission;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;


public interface SubmissionRepository extends JpaRepository<Submission, UUID> {}