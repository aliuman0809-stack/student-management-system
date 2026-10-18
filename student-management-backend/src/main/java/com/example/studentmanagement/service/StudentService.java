package com.example.studentmanagement.service;

import com.example.studentmanagement.entity.Student;

import java.util.List;

public interface StudentService {

    // Create
    Student createStudent(Student student);


    // Read All
    List<Student> getAllStudents();


    // Read One
    Student getStudentById(Long id);


    // Update
    Student updateStudent(Long id, Student student);


    // Delete
    void deleteStudent(Long id);
}