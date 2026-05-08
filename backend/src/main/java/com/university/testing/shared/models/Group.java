package com.university.testing.shared.models;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "student_groups")
@Getter @Setter
@Builder
@NoArgsConstructor @AllArgsConstructor
public class Group {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String name;

    @ToString.Exclude
    @OneToMany(mappedBy = "studentGroup")
    private List<User> students;
}