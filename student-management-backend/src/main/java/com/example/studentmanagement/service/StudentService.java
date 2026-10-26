package com.example.studentmanagement.service;

import com.example.studentmanagement.entity.Student;
import java.util.List;

public interface StudentService {
    Student createStudent(Student student);
    List<Student> getAllStudents(); // (Purana, ab use nahi hoga par rehne dein)
    List<Student> getStudentsByUserId(Long userId); // Naya method
    Student getStudentById(Long id);
    Student updateStudent(Long id, Student student);
    void deleteStudent(Long id);
}