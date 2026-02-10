package com.parkease.controller;

// Trigger IDE re-index
import com.parkease.model.ParkingListing;
import com.parkease.security.UserDetailsImpl;
import com.parkease.service.ParkingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/provider")
@PreAuthorize("hasRole('PROVIDER') or hasRole('ADMIN')")
public class ProviderController {
    @Autowired
    ParkingService parkingService;

    @PostMapping("/listings")
    public ResponseEntity<?> createListing(@RequestBody ParkingListing listing,
            @AuthenticationPrincipal UserDetails userDetails) {
        UserDetailsImpl user = (UserDetailsImpl) userDetails;
        return ResponseEntity.ok(parkingService.createListing(listing, user.getId()));
    }

    @GetMapping("/listings")
    public ResponseEntity<List<ParkingListing>> getMyListings(@AuthenticationPrincipal UserDetails userDetails) {
        UserDetailsImpl user = (UserDetailsImpl) userDetails;
        return ResponseEntity.ok(parkingService.getMyListings(user.getId()));
    }

    @DeleteMapping("/listings/{id}")
    public ResponseEntity<?> deleteListing(@PathVariable String id) {
        parkingService.deleteListing(id);
        return ResponseEntity.ok("Deleted");
    }

    @Autowired
    com.parkease.service.BookingService bookingService;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats(@AuthenticationPrincipal UserDetails userDetails) {
        UserDetailsImpl user = (UserDetailsImpl) userDetails;
        return ResponseEntity.ok(bookingService.getProviderDashboardStats(user.getId()));
    }

    @GetMapping("/bookings")
    public ResponseEntity<?> getProviderBookings(@AuthenticationPrincipal UserDetails userDetails) {
        UserDetailsImpl user = (UserDetailsImpl) userDetails;
        return ResponseEntity.ok(bookingService.getProviderBookings(user.getId()));
    }

    // Note: Scan functionality is related to Bookings, so we might put it in
    // BookingController
    // or here if it is provider-centric.
}
