package com.university.testing.auth.data;

import com.university.testing.shared.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    @Query("SELECT DISTINCT g.name FROM Group g")
    List<String> findDistinctGroupNames();

    List<User> findByStudentGroupName(String name);
}