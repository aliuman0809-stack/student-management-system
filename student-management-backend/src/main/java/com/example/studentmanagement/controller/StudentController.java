package com.example.studentmanagement.controller;

import com.example.studentmanagement.entity.Student;
import com.example.studentmanagement.service.StudentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "http://localhost:5173")
public class StudentController {

    private final StudentService studentService;


    // ==========================================
    // CONSTRUCTOR
    // ==========================================

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }


    // ==========================================
    // CREATE STUDENT
    // POST /api/students
    // ==========================================

    @PostMapping
    public ResponseEntity<Student> createStudent(
            @RequestBody Student student
    ) {

        Student savedStudent =
                studentService.createStudent(student);

        return new ResponseEntity<>(
                savedStudent,
                HttpStatus.CREATED
        );
    }


    // ==========================================
    // GET ALL STUDENTS
    // GET /api/students
    // ==========================================

    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents() {

        List<Student> students =
                studentService.getAllStudents();

        return ResponseEntity.ok(students);
    }


    // ==========================================
    // GET STUDENT BY ID
    // GET /api/students/{id}
    // ==========================================

    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(
            @PathVariable Long id
    ) {

        Student student =
                studentService.getStudentById(id);

        return ResponseEntity.ok(student);
    }


    // ==========================================
    // UPDATE STUDENT
    // PUT /api/students/{id}
    // ==========================================

    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(
            @PathVariable Long id,
            @RequestBody Student student
    ) {

        Student updatedStudent =
                studentService.updateStudent(id, student);

        return ResponseEntity.ok(updatedStudent);
    }


    // ==========================================
    // DELETE STUDENT
    // DELETE /api/students/{id}
    // ==========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteStudent(
            @PathVariable Long id
    ) {

        studentService.deleteStudent(id);

        return ResponseEntity.ok(
                "Student deleted successfully"
        );
    }
}