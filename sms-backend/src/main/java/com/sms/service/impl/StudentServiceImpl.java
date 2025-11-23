package com.sms.service.impl;

import com.sms.dto.StudentDto;
import com.sms.model.Student;
import com.sms.repository.StudentRepository;
import com.sms.service.StudentService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentServiceImpl implements StudentService {

    @Autowired
    private StudentRepository repository;

    private StudentDto mapToDto(Student student) {
        StudentDto dto = new StudentDto();
        dto.setId(student.getId());
        dto.setName(student.getName());
        dto.setEmail(student.getEmail());
        dto.setPhone(student.getPhone());
        dto.setDepartment(student.getDepartment());
        dto.setGender(student.getGender());
        dto.setDateOfBirth(student.getDateOfBirth());
        return dto;
    }

    private Student mapToEntity(StudentDto dto, Student student) {
        student.setName(dto.getName());
        student.setEmail(dto.getEmail());
        student.setPhone(dto.getPhone());
        student.setDepartment(dto.getDepartment());
        student.setGender(dto.getGender());
        student.setDateOfBirth(dto.getDateOfBirth());
        return student;
    }

    @Override
    public StudentDto createStudent(StudentDto dto) {
        Student student = mapToEntity(dto, new Student());
        return mapToDto(repository.save(student));
    }

    @Override
    public StudentDto updateStudent(Long id, StudentDto dto) {
        Student existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        mapToEntity(dto, existing);
        return mapToDto(repository.save(existing));
    }

    @Override
    public Student getStudent(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    @Override
    public void deleteStudent(Long id) {
        repository.deleteById(id);
    }

    @Override
    public Page<StudentDto> getStudents(int page, int size, String sortBy, String sortDir, String keyword) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Student> pageResult;
        if (keyword != null && !keyword.isEmpty()) {
            pageResult = repository.findByNameContainingOrEmailContaining(keyword, keyword, pageable);
        } else {
            pageResult = repository.findAll(pageable);
        }

        List<StudentDto> dtos = pageResult.getContent()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, pageResult.getTotalElements());
    }
}
