package com.university.testing.result.models;

import com.university.testing.test.models.Question;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "answers")
@Getter @Setter
@Builder
@NoArgsConstructor @AllArgsConstructor
public class Answer {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id")
    private Submission submission;

    @OnDelete(action = OnDeleteAction.SET_NULL)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id")
    private Question question;

    @Column(columnDefinition = "TEXT")
    private String studentAnswer;

    private Double score;

    public UUID getQuestionId() { return question.getId(); }
    public Object getType() { return question.getType(); }
    public String getContent() { return studentAnswer; }
    public Double getPoints() { return score; }
}