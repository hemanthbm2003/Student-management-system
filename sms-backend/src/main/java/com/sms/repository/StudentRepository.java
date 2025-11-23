package com.sms.repository;

import com.sms.model.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Long> {

    Page<Student> findByNameContainingOrEmailContaining(
            String name,
            String email,
            Pageable pageable
    );
}
