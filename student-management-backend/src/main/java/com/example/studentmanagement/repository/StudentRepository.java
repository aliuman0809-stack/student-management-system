package com.example.studentmanagement.repository;

import com.example.studentmanagement.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    List<Student> findByUserId(Long userId);

    // User ke saare students delete karne ke liye naya method
    @Modifying
    @Transactional
    @Query("DELETE FROM Student s WHERE s.userId = :userId")
    void deleteByUserId(Long userId);
}