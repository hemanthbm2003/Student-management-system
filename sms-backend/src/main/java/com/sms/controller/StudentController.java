package com.sms.controller;

import com.sms.dto.StudentDto;
import com.sms.service.StudentService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired
    private StudentService service;

    // Create
    @PostMapping
    public ResponseEntity<StudentDto> createStudent(@RequestBody StudentDto dto) {
        return ResponseEntity.ok(service.createStudent(dto));
    }

    // Update
    @PutMapping("/{id}")
    public ResponseEntity<StudentDto> updateStudent(
            @PathVariable Long id,
            @RequestBody StudentDto dto) {
        return ResponseEntity.ok(service.updateStudent(id, dto));
    }

    // Get one
    @GetMapping("/{id}")
    public ResponseEntity<StudentDto> getStudent(@PathVariable Long id) {
        return ResponseEntity.ok(
                service.getStudents(0, 1, "id", "asc", null)
                        .stream()
                        .filter(s -> s.getId().equals(id))
                        .findFirst()
                        .orElseThrow()
        );
    }

    // Get paginated list
    @GetMapping
    public ResponseEntity<Page<StudentDto>> getStudents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String keyword
    ) {
        return ResponseEntity.ok(
                service.getStudents(page, size, sortBy, sortDir, keyword)
        );
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteStudent(@PathVariable Long id) {
        service.deleteStudent(id);
        return ResponseEntity.ok("Student deleted!");
    }
}
