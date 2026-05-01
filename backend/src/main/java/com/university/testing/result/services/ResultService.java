package com.university.testing.result.services;

import com.university.testing.result.data.AnswerRepository;
import com.university.testing.result.data.SubmissionRepository;
import com.university.testing.result.models.Answer;
import com.university.testing.result.models.Submission;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResultService {
    private final AnswerRepository answerRepository;
    private final SubmissionRepository submissionRepository;

    public void saveResult(UUID submissionId, UUID questionId, String output) {
        System.out.println("Пытаюсь сохранить результат для submissionId: " + submissionId);

        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        Answer answer = Answer.builder()
                .submission(submission)
                .studentAnswer(output)
                .score(output.contains("Hello") ? 1.0 : 0.0)
                .build();

        answerRepository.save(answer);
        System.out.println("Результат успешно сохранен в БД!");
    }
}