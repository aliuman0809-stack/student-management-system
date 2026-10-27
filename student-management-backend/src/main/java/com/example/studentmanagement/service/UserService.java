package com.example.studentmanagement.service;

import com.example.studentmanagement.repository.StudentRepository;
import com.example.studentmanagement.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;

    public UserService(UserRepository userRepository, StudentRepository studentRepository) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
    }

    @Transactional
    public void deleteUserAndData(Long userId) {
        // Pehle us user ke saare students delete karein
        studentRepository.deleteByUserId(userId);
        // Phir user ko delete karein
        userRepository.deleteById(userId);
    }
}