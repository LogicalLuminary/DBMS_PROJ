package com.example.backend.controller;

import com.example.backend.entity.Student;
import com.example.backend.service.StudentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "http://localhost:5173")
public class StudentController {

    private final StudentService service;

    public StudentController(StudentService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Student>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{Student_id}")
    public ResponseEntity<Student> getById(@PathVariable Integer Student_id) {
        return ResponseEntity.ok(service.getById(Student_id));
    }
    
    @PostMapping
    public ResponseEntity<Student> create(@RequestBody Student entity) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(entity));
    }

    @PutMapping("/{Student_id}")
    public ResponseEntity<Student> update(
            @PathVariable Integer Student_id,
            @RequestBody Student entity) {
        return ResponseEntity.ok(service.update(Student_id, entity));
    }

    @DeleteMapping("/{Student_id}")
    public ResponseEntity<Void> delete(@PathVariable Integer Student_id) {
        service.delete(Student_id);
        return ResponseEntity.noContent().build();
    }
}
