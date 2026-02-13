package com.parkease.service;

import com.parkease.dto.BookingRequest;
import com.parkease.model.*;
import com.parkease.repository.BookingRepository;
import com.parkease.repository.ParkingListingRepository;
import com.parkease.repository.UserRepository;
import com.parkease.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class BookingService {
    @Autowired
    BookingRepository bookingRepository;

    @Autowired
    ParkingListingRepository parkingListingRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    TransactionRepository transactionRepository;

    public Booking createBooking(BookingRequest request, String userId) {
        // 1. Check Parking exists
        ParkingListing parking = parkingListingRepository.findById(request.getParkingId())
                .orElseThrow(() -> new RuntimeException("Parking not found"));

        // 2. Overlap Check
        // logic: invalid if existing.start < req.end AND existing.end > req.start
        List<Booking> overlapping = bookingRepository
                .findByParkingIdIdAndStartTimeLessThanAndEndTimeGreaterThanAndStatusNot(
                        parking.getId(),
                        request.getEndTime(),
                        request.getStartTime(),
                        BookingStatus.CANCELLED // Ignore cancelled
                );

        // Refine Overlap Check: We need to check Capacity!
        // The simple overlap above implies capacity is 1. If capacity > 1, we count
        // overlaps.
        // For simplicity now, let's assume if there are overlapping bookings >= total
        // spots, we block.
        // We need to know specific vehicle capacity.

        int capacity = getCapacityForType(parking, request.getVehicleType());
        if (overlapping.size() >= capacity) {
            throw new RuntimeException("No slots available for this time range.");
        }

        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = new Booking();
        booking.setUserId(user);
        booking.setParkingId(parking);
        booking.setVehicleType(request.getVehicleType());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setTotalHours(request.getTotalHours());
        booking.setTotalAmount(request.getTotalAmount());

        booking.setBookingId(UUID.randomUUID().toString().substring(0, 8).toUpperCase()); // Short ID
        booking.setQrCodeDataUrl("QR_CODE_DATA_PLACEHOLDER"); // In real app, generate QR image data URL

        booking.setStatus(BookingStatus.BOOKED);

        Booking savedBooking = bookingRepository.save(booking);

        // 3. Create Transaction (Mock Payment)
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setBooking(savedBooking);
        transaction.setAmount(request.getTotalAmount());
        transaction.setPaymentMethod("CARD"); // Default for now
        transaction.setStatus("SUCCESS");
        transaction.setTransactionReference("TXN-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase());
        transaction.setTimestamp(new Date());

        transactionRepository.save(transaction);

        return savedBooking;
    }

    private int getCapacityForType(ParkingListing parking, VehicleType type) {
        switch (type) {
            case TWO_WHEELER:
                return parking.getVehicleCapacity().getTwoWheeler();
            case FOUR_SEATER:
                return parking.getVehicleCapacity().getCar4Seater();
            case SIX_SEATER:
                return parking.getVehicleCapacity().getCar6Seater();
            case SUV:
                return parking.getVehicleCapacity().getSuv();
            default:
                return parking.getApproxTotalCars();
        }
    }

    public List<Booking> getMyBookings(String userId) {
        return bookingRepository.findByUserIdId(userId);
    }

    public List<Booking> getProviderBookings(String providerId) {
        List<ParkingListing> listings = parkingListingRepository.findByProviderIdId(providerId);
        return bookingRepository.findByParkingIdIn(listings);
    }

    public Booking getBookingById(String id) {
        return bookingRepository.findById(id).orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    // Provider Actions
    public Booking scanBooking(String bookingId) {
        // Can be ID or short bookingId
        Booking booking = bookingRepository.findByBookingId(bookingId)
                .orElse(bookingRepository.findById(bookingId)
                        .orElseThrow(() -> new RuntimeException("Booking not found")));

        return booking;
    }

    public Booking updateStatus(String id, BookingStatus status) {
        Booking booking = getBookingById(id);
        booking.setStatus(status);
        return bookingRepository.save(booking);
    }

    // Scheduler: Expire bookings
    @Scheduled(fixedRate = 60000) // Every minute
    public void expireBookings() {
        Date now = new Date();
        // Find BOOKED bookings where endTime < now
        List<Booking> expired = bookingRepository.findByStatusAndEndTimeBefore(BookingStatus.BOOKED, now);
        for (Booking b : expired) {
            b.setStatus(BookingStatus.EXPIRED);
            bookingRepository.save(b);
        }
    }

    public java.util.Map<String, Object> getProviderDashboardStats(String providerId) {
        List<ParkingListing> listings = parkingListingRepository.findByProviderIdId(providerId);
        List<Booking> bookings = bookingRepository.findByParkingIdIn(listings);

        double totalEarnings = bookings.stream()
                .mapToDouble(Booking::getTotalAmount)
                .sum();

        long activeBookings = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.BOOKED)
                .count();

        return java.util.Map.of(
                "totalSpots", listings.size(),
                "activeBookings", activeBookings,
                "totalEarnings", totalEarnings);
    }
}
