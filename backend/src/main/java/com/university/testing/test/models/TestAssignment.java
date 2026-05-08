package com.university.testing.test.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "test_assignments")
@Getter @Setter
@Builder
@NoArgsConstructor @AllArgsConstructor
public class TestAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_id", nullable = false)
    private Test test;

    @ElementCollection
    @CollectionTable(name = "assignment_students", joinColumns = @JoinColumn(name = "assignment_id"))
    @Column(name = "student_id")
    private List<UUID> studentIds;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;
}