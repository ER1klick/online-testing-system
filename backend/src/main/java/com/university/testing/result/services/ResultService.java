package com.university.testing.result.services;

import com.university.testing.result.data.AnswerRepository;
import com.university.testing.result.data.SubmissionRepository;
import com.university.testing.result.models.Answer;
import com.university.testing.result.models.Submission;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

    public List<Map<String, Object>> getResultsForTest(UUID testId) {
        List<Submission> submissions = submissionRepository.findByTestIdWithStudent(testId);

        List<Map<String, Object>> result = new ArrayList<>();
        for (Submission sub : submissions) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", sub.getId());
            map.put("score", sub.getFinalScore() != null ? sub.getFinalScore() : 0.0);
            map.put("maxScore", 100);
            map.put("submittedAt", sub.getSubmittedAt());
            map.put("groupName", sub.getGroupName() != null ? sub.getGroupName() : "—");

            if (sub.getStudent() != null) {
                map.put("studentName", sub.getStudent().getFullName());
                String email = sub.getStudent().getEmail();
                map.put("studentCardNumber", (email != null && email.contains("@")) ? email.split("@")[0] : "—");
            }
            result.add(map);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSubmissionDetails(UUID submissionId) {
        Submission sub = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        Map<String, Object> map = new HashMap<>();
        map.put("id", sub.getId());
        map.put("score", sub.getFinalScore() != null ? sub.getFinalScore() : 0.0);
        map.put("groupName", sub.getGroupName() != null ? sub.getGroupName() : "—");

        if (sub.getStudent() != null) {
            map.put("studentName", sub.getStudent().getFullName());
        } else {
            map.put("studentName", "Удаленный пользователь");
        }

        List<Answer> answers = answerRepository.findBySubmissionId(submissionId);
        List<Map<String, Object>> answersList = new ArrayList<>();

        for (Answer ans : answers) {
            Map<String, Object> ansMap = new HashMap<>();

            if (ans.getQuestion() != null) {
                ansMap.put("questionText", ans.getQuestion().getText());
                ansMap.put("type", ans.getQuestion().getType());
            } else {
                ansMap.put("questionText", "Вопрос удален");
                ansMap.put("type", "UNKNOWN");
            }

            ansMap.put("content", ans.getStudentAnswer());
            ansMap.put("isCorrect", ans.getScore() != null && ans.getScore() > 0);
            ansMap.put("points", ans.getScore() != null ? ans.getScore() : 0.0);

            if (ans.getQuestion() != null && "CODE".equals(ans.getQuestion().getType().toString())) {
                ansMap.put("language", "python");
            }

            answersList.add(ansMap);
        }
        map.put("answers", answersList);

        return map;
    }
}