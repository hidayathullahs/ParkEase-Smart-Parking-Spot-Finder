package com.parkease.controller;

import com.parkease.dto.BookingRequest;
import com.parkease.model.Booking;
import com.parkease.model.BookingStatus;
import com.parkease.security.UserDetailsImpl;
import com.parkease.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    @Autowired
    BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UserDetailsImpl user = (UserDetailsImpl) userDetails;
        try {
            return ResponseEntity.ok(bookingService.createBooking(request, user.getId()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/tickets")
    @PreAuthorize("hasAuthority('ROLE_USER') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getActiveTickets(@AuthenticationPrincipal UserDetails userDetails) {
        UserDetailsImpl user = (UserDetailsImpl) userDetails;
        return ResponseEntity.ok(bookingService.getActiveTickets(user.getId()));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAuthority('ROLE_USER') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getActiveBookings(@AuthenticationPrincipal UserDetails userDetails) {
        UserDetailsImpl user = (UserDetailsImpl) userDetails;
        return ResponseEntity.ok(bookingService.getActiveTickets(user.getId()));
    }

    @GetMapping("/history")
    @PreAuthorize("hasAuthority('ROLE_USER') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getBookingHistory(@AuthenticationPrincipal UserDetails userDetails) {
        UserDetailsImpl user = (UserDetailsImpl) userDetails;
        return ResponseEntity.ok(bookingService.getBookingHistory(user.getId()));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAuthority('ROLE_USER') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getMyBookings(@AuthenticationPrincipal UserDetails userDetails) {
        UserDetailsImpl user = (UserDetailsImpl) userDetails;
        return ResponseEntity.ok(bookingService.getMyBookings(user.getId()));
    }

    @GetMapping("/my-bookings")
    @PreAuthorize("hasAuthority('ROLE_USER') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getMyBookingsAlias(@AuthenticationPrincipal UserDetails userDetails) {
        UserDetailsImpl user = (UserDetailsImpl) userDetails;
        return ResponseEntity.ok(bookingService.getMyBookings(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBooking(@PathVariable String id) {
        try {
            return ResponseEntity.ok(bookingService.getBookingById(id));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Cancel Booking
    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('ROLE_USER') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> cancelBooking(@PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UserDetailsImpl user = (UserDetailsImpl) userDetails;
        try {
            Booking cancelled = bookingService.cancelBooking(id, user.getId());
            return ResponseEntity.ok(Map.of("message", "Booking cancelled successfully", "booking", cancelled));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Extend Booking
    @PutMapping("/{id}/extend")
    @PreAuthorize("hasAuthority('ROLE_USER') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> extendBooking(@PathVariable String id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        UserDetailsImpl user = (UserDetailsImpl) userDetails;
        try {
            int extraHours = 1;
            if (body.containsKey("extraHours")) {
                extraHours = Integer.parseInt(body.get("extraHours").toString());
            }
            Booking extended = bookingService.extendBooking(id, extraHours, user.getId());
            return ResponseEntity.ok(Map.of("message", "Booking extended successfully", "booking", extended));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Provider / Admin Check In
    @PutMapping("/{id}/checkin")
    @PreAuthorize("hasAuthority('ROLE_PROVIDER') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> checkIn(@PathVariable String id) {
        try {
            Booking updated = bookingService.checkInBooking(id);
            return ResponseEntity.ok(Map.of("message", "Driver checked in successfully", "booking", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Provider / Admin Check Out
    @PutMapping("/{id}/checkout")
    @PreAuthorize("hasAuthority('ROLE_PROVIDER') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> checkOut(@PathVariable String id) {
        try {
            Booking updated = bookingService.checkOutBooking(id);
            return ResponseEntity.ok(Map.of("message", "Driver checked out successfully", "booking", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Provider Scan API
    @PostMapping("/scan")
    @PreAuthorize("hasAuthority('ROLE_PROVIDER') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> scanBooking(@RequestBody Map<String, String> body) {
        String bookingId = body.get("bookingId");
        try {
            return ResponseEntity.ok(bookingService.scanBooking(bookingId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid Booking ID"));
        }
    }

    @GetMapping("/provider")
    @PreAuthorize("hasAuthority('ROLE_PROVIDER') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getProviderBookings(@AuthenticationPrincipal UserDetails userDetails) {
        UserDetailsImpl user = (UserDetailsImpl) userDetails;
        return ResponseEntity.ok(bookingService.getProviderBookings(user.getId()));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ROLE_PROVIDER') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        BookingStatus status = BookingStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(bookingService.updateStatus(id, status));
    }
}
