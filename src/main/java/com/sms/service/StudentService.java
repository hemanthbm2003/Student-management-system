package com.sms.service;

import com.sms.dto.StudentDto;
import com.sms.model.Student;
import org.springframework.data.domain.Page;

public interface StudentService {

    StudentDto createStudent(StudentDto studentDto);

    StudentDto updateStudent(Long id, StudentDto studentDto);

    Student getStudent(Long id);

    void deleteStudent(Long id);

    Page<StudentDto> getStudents(int page, int size, String sortBy, String sortDir, String keyword);
}
