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

        Answer answer = answerRepository.findBySubmissionIdAndQuestionId(submissionId, questionId)
                .orElseThrow(() -> new RuntimeException("Answer not found"));

        answer.setStudentAnswer(output);
        answerRepository.save(answer);

        log.info("Result saved successfully!");
    }

    @Transactional
    public void updateAnswerScore(UUID answerId, Double newScore) {
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new RuntimeException("Answer not found"));

        answer.setScore(newScore);
        answerRepository.save(answer);

        Submission submission = answer.getSubmission();
        List<Answer> allAnswers = answerRepository.findBySubmissionId(submission.getId());
        double totalScore = allAnswers.stream()
                .mapToDouble(a -> a.getScore() != null ? a.getScore() : 0.0)
                .sum();

        submission.setFinalScore(totalScore);
        submissionRepository.save(submission);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getResultsForTest(UUID testId) {
        List<Submission> submissions = submissionRepository.findByTestIdWithStudent(testId);

        List<Map<String, Object>> result = new ArrayList<>();
        for (Submission sub : submissions) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", sub.getId());
            map.put("score", sub.getFinalScore() != null ? sub.getFinalScore() : 0.0);

            double maxScore = 0.0;
            if (sub.getTest() != null && sub.getTest().getQuestions() != null) {
                maxScore = sub.getTest().getQuestions().stream().mapToDouble(q -> {
                    if (q.getContent() != null && q.getContent().containsKey("points")) {
                        return Double.parseDouble(q.getContent().get("points").toString());
                    }
                    return 1.0;
                }).sum();
            }
            map.put("maxScore", maxScore);

            List<Answer> subAnswers = answerRepository.findBySubmissionId(sub.getId());
            boolean isChecked = true;
            for (Answer a : subAnswers) {
                if (a.getScore() == null) {
                    isChecked = false;
                    break;
                }
            }
            map.put("isChecked", isChecked);

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

            ansMap.put("answerId", ans.getId());

            if (ans.getQuestion() != null) {
                ansMap.put("questionText", ans.getQuestion().getText());
                ansMap.put("type", ans.getQuestion().getType());
                if (ans.getQuestion().getContent() != null) {
                    ansMap.put("options", ans.getQuestion().getContent().get("options"));
                    ansMap.put("correct", ans.getQuestion().getContent().get("correct"));
                }

                double maxPoints = 1.0;
                if (ans.getQuestion().getContent() != null && ans.getQuestion().getContent().containsKey("points")) {
                    maxPoints = Double.parseDouble(ans.getQuestion().getContent().get("points").toString());
                }
                ansMap.put("maxPoints", maxPoints);
            } else {
                ansMap.put("questionText", "Вопрос удален");
                ansMap.put("type", "UNKNOWN");
                ansMap.put("maxPoints", 1.0);
            }

            ansMap.put("content", ans.getStudentAnswer());
            ansMap.put("isCorrect", ans.getScore() != null && ans.getScore() > 0);
            ansMap.put("points", ans.getScore() != null ? ans.getScore() : 0.0);

            if (ans.getQuestion() != null && "CODE".equals(ans.getQuestion().getType().toString())) {
                String lang = ans.getQuestion().getContent() != null && ans.getQuestion().getContent().containsKey("language")
                        ? ans.getQuestion().getContent().get("language").toString()
                        : "python";
                ansMap.put("language", lang);
            }

            answersList.add(ansMap);
        }
        map.put("answers", answersList);

        return map;
    }
}