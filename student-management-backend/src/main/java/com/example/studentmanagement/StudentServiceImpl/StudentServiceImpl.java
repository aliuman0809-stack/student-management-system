package com.example.studentmanagement.service;

import com.example.studentmanagement.entity.Student;
import com.example.studentmanagement.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;


    // ==========================================
    // CONSTRUCTOR
    // ==========================================

    public StudentServiceImpl(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }


    // ==========================================
    // CREATE STUDENT
    // ==========================================

    @Override
    public Student createStudent(Student student) {

        return studentRepository.save(student);
    }


    // ==========================================
    // GET ALL STUDENTS
    // ==========================================

    @Override
    public List<Student> getAllStudents() {

        return studentRepository.findAll();
    }


    // ==========================================
    // GET STUDENT BY ID
    // ==========================================

    @Override
    public Student getStudentById(Long id) {

        return studentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Student not found with id: " + id
                        )
                );
    }


    // ==========================================
    // UPDATE STUDENT
    // ==========================================

    @Override
    public Student updateStudent(Long id, Student student) {

        Student existingStudent = studentRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Student not found with id: " + id
                        )
                );


        existingStudent.setName(student.getName());

        existingStudent.setEmail(student.getEmail());

        existingStudent.setPhone(student.getPhone());

        existingStudent.setAge(student.getAge());

        existingStudent.setCourse(student.getCourse());


        return studentRepository.save(existingStudent);
    }


    // ==========================================
    // DELETE STUDENT
    // ==========================================

    @Override
    public void deleteStudent(Long id) {

        if (!studentRepository.existsById(id)) {

            throw new RuntimeException(
                    "Student not found with id: " + id
            );
        }

        studentRepository.deleteById(id);
    }
}