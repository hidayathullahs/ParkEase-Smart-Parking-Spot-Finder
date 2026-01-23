package com.parkease.controller;

import com.parkease.model.ParkingListing;
import com.parkease.service.ParkingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/parkings")
public class ParkingController {
    @Autowired
    ParkingService parkingService;

    @GetMapping
    public ResponseEntity<List<ParkingListing>> getAllApprovedParkings() {
        return ResponseEntity.ok(parkingService.getApprovedListings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getParkingById(@PathVariable String id) {
        ParkingListing listing = parkingService.getListingById(id);
        if (listing != null && listing.getStatus().name().equals("APPROVED")) {
             return ResponseEntity.ok(listing);
        }
        return ResponseEntity.notFound().build();
    }
}
