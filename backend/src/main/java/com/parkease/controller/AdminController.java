package com.parkease.controller;

import com.parkease.repository.UserRepository;
import com.parkease.security.UserDetailsImpl;
import com.parkease.service.ParkingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    @Autowired
    ParkingService parkingService;
    
    @Autowired
    UserRepository userRepository; // Direct repo for simple user management

    @GetMapping("/listings/pending")
    public ResponseEntity<?> getAllListings() {
        // In real app, might want filter. For now returning all so admin can see PENDING
        return ResponseEntity.ok(parkingService.getAllListings());
    }

    @PutMapping("/listings/{id}/approve")
    public ResponseEntity<?> approveListing(@PathVariable String id, @AuthenticationPrincipal UserDetails userDetails) {
        UserDetailsImpl admin = (UserDetailsImpl) userDetails;
        return ResponseEntity.ok(parkingService.approveListing(id, admin.getId()));
    }

    @PutMapping("/listings/{id}/reject")
    public ResponseEntity<?> rejectListing(@PathVariable String id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(parkingService.rejectListing(id, body.get("reason")));
    }
    
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }
    
    // Stats endpoint - can be added later
}
