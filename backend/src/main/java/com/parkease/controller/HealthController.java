package com.parkease.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/")
    public ResponseEntity<?> home() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "ParkEase Backend",
                "timestamp", System.currentTimeMillis()
        ));
    }

    @GetMapping({"/health", "/api/health"})
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "message", "ParkEase API is operational"
        ));
    }
}
