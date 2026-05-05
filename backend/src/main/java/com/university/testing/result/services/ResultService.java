package com.university.testing.result.services;

import com.university.testing.result.data.AnswerRepository;
import com.university.testing.result.data.SubmissionRepository;
import com.university.testing.result.models.Answer;
import com.university.testing.result.models.Submission;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResultService {
    private final AnswerRepository answerRepository;
    private final SubmissionRepository submissionRepository;

    public void saveResult(UUID submissionId, UUID questionId, String output) {
        log.info("Saving result for submissionId: {}", submissionId);

        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        Answer answer = Answer.builder()
                .submission(submission)
                .studentAnswer(output)
                .score(output.contains("Hello") ? 1.0 : 0.0)
                .build();

        answerRepository.save(answer);
        log.info("Result saved successfully!");
    }
}