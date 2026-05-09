package com.university.testing.test.models;

import com.university.testing.shared.models.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "tests")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Test {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String title;
    private String description;
    private boolean isPublished;

    @OneToMany(mappedBy = "test", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Question> questions = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private User author;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "test_coauthors",
            joinColumns = @JoinColumn(name = "test_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @Builder.Default
    private List<User> coAuthors = new ArrayList<>();
}