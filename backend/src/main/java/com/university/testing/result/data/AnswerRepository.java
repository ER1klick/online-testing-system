package com.university.testing.result.data;

import com.university.testing.result.models.Answer;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnswerRepository extends JpaRepository<Answer, UUID> {
    List<Answer> findBySubmissionId(UUID submissionId);

    Optional<Answer> findBySubmissionIdAndQuestionId(UUID submissionId, UUID questionId);
}