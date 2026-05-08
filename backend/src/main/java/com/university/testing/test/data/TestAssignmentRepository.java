package com.university.testing.test.data;

import com.university.testing.test.models.TestAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface TestAssignmentRepository extends JpaRepository<TestAssignment, UUID> {
    List<TestAssignment> findByStudentGroupId(UUID groupId);
    List<TestAssignment> findByTestId(UUID testId);
}