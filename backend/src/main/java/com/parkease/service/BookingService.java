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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class BookingService {
    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);

    @Autowired
    BookingRepository bookingRepository;

    @Autowired
    ParkingListingRepository parkingListingRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    TransactionRepository transactionRepository;

    @Autowired(required = false)
    NotificationService notificationService;

    public Booking createBooking(BookingRequest request, String userId) {
        // 1. Check Parking exists and is approved
        ParkingListing parking = parkingListingRepository.findById(request.getParkingId())
                .orElseThrow(() -> new RuntimeException("Parking not found"));

        if (parking.getStatus() != ListingStatus.APPROVED) {
            throw new RuntimeException("This parking listing is not approved for booking.");
        }

        // 2. Overlap Check
        // logic: invalid if existing.start < req.end AND existing.end > req.start
        List<Booking> overlapping = bookingRepository
                .findByParkingIdIdAndStartTimeLessThanAndEndTimeGreaterThanAndStatusNot(
                        parking.getId(),
                        request.getEndTime(),
                        request.getStartTime(),
                        BookingStatus.CANCELLED // Ignore cancelled
                );

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

        String shortId = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        booking.setBookingId(shortId);
        booking.setQrCodeDataUrl("https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=" + shortId);
        booking.setStatus(BookingStatus.BOOKED);

        Booking savedBooking = bookingRepository.save(booking);
        logger.info("Created booking {} for user {}", savedBooking.getBookingId(), user.getId());

        // 3. Create Transaction (Mock Payment)
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setBooking(savedBooking);
        transaction.setAmount(request.getTotalAmount());
        transaction.setPaymentMethod("CARD");
        transaction.setStatus("SUCCESS");
        transaction.setTransactionReference("TXN-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase());
        transaction.setTimestamp(new Date());

        transactionRepository.save(transaction);

        // 4. Send Notification
        if (notificationService != null) {
            try {
                notificationService.createNotification(user.getId(), "Booking Confirmed",
                        "Your booking " + shortId + " for " + parking.getTitle() + " has been confirmed!");
            } catch (Exception e) {
                logger.warn("Could not send booking notification: {}", e.getMessage());
            }
        }

        return savedBooking;
    }

    private int getCapacityForType(ParkingListing parking, VehicleType type) {
        if (parking.getVehicleCapacity() == null) {
            return parking.getApproxTotalCars() > 0 ? parking.getApproxTotalCars() : 10;
        }
        if (type == VehicleType.TWO_WHEELER) {
            return parking.getVehicleCapacity().getTwoWheeler();
        } else if (type == VehicleType.FOUR_SEATER) {
            return parking.getVehicleCapacity().getCar4Seater() > 0 ? parking.getVehicleCapacity().getCar4Seater() : parking.getVehicleCapacity().getFourWheeler();
        } else if (type == VehicleType.SIX_SEATER) {
            return parking.getVehicleCapacity().getCar6Seater();
        } else if (type == VehicleType.SUV) {
            return parking.getVehicleCapacity().getSuv();
        } else {
            return parking.getApproxTotalCars() > 0 ? parking.getApproxTotalCars() : 10;
        }
    }

    public List<Booking> getMyBookings(String userId) {
        return bookingRepository.findByUserId(userId);
    }

    public List<Booking> getActiveTickets(String userId) {
        List<Booking> all = bookingRepository.findByUserId(userId);
        Date now = new Date();
        return all.stream()
                .filter(b -> b.getStatus() == BookingStatus.BOOKED || b.getStatus() == BookingStatus.CHECKED_IN)
                .filter(b -> b.getStatus() == BookingStatus.CHECKED_IN || (b.getEndTime() != null && b.getEndTime().after(now)))
                .sorted((a, b) -> {
                    if (a.getStartTime() == null || b.getStartTime() == null) return 0;
                    return a.getStartTime().compareTo(b.getStartTime());
                })
                .toList();
    }

    public List<Booking> getBookingHistory(String userId) {
        List<Booking> all = bookingRepository.findByUserId(userId);
        Date now = new Date();
        return all.stream()
                .filter(b -> b.getStatus() == BookingStatus.CHECKED_OUT ||
                             b.getStatus() == BookingStatus.CANCELLED ||
                             b.getStatus() == BookingStatus.EXPIRED ||
                             (b.getStatus() != BookingStatus.CHECKED_IN && b.getEndTime() != null && b.getEndTime().before(now)))
                .sorted((a, b) -> {
                    Date dateA = a.getCreatedAt() != null ? a.getCreatedAt() : a.getStartTime();
                    Date dateB = b.getCreatedAt() != null ? b.getCreatedAt() : b.getStartTime();
                    if (dateA == null || dateB == null) return 0;
                    return dateB.compareTo(dateA);
                })
                .toList();
    }

    public List<Booking> getProviderBookings(String providerId) {
        List<ParkingListing> listings = parkingListingRepository.findByProviderIdId(providerId);
        if (listings.isEmpty()) {
            return List.of();
        }
        return bookingRepository.findByParkingIdIn(listings);
    }

    public Booking getBookingById(String id) {
        return bookingRepository.findById(id)
                .or(() -> bookingRepository.findByBookingId(id))
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    // Provider Actions
    public Booking scanBooking(String bookingId) {
        return bookingRepository.findByBookingId(bookingId)
                .or(() -> bookingRepository.findById(bookingId))
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    public Booking checkInBooking(String id) {
        Booking booking = getBookingById(id);
        booking.setStatus(BookingStatus.CHECKED_IN);
        Booking updated = bookingRepository.save(booking);

        if (notificationService != null && booking.getUserId() != null) {
            try {
                notificationService.createNotification(booking.getUserId().getId(), "Checked In",
                        "You have successfully checked in for booking " + booking.getBookingId());
            } catch (Exception ignored) {}
        }
        return updated;
    }

    public Booking checkOutBooking(String id) {
        Booking booking = getBookingById(id);
        booking.setStatus(BookingStatus.CHECKED_OUT);
        Booking updated = bookingRepository.save(booking);

        if (notificationService != null && booking.getUserId() != null) {
            try {
                notificationService.createNotification(booking.getUserId().getId(), "Checked Out",
                        "You have checked out of parking " + (booking.getParkingId() != null ? booking.getParkingId().getTitle() : ""));
            } catch (Exception ignored) {}
        }
        return updated;
    }

    public Booking cancelBooking(String id, String userId) {
        Booking booking = getBookingById(id);
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking is already cancelled");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        Booking updated = bookingRepository.save(booking);

        if (notificationService != null && booking.getUserId() != null) {
            try {
                notificationService.createNotification(booking.getUserId().getId(), "Booking Cancelled",
                        "Booking " + booking.getBookingId() + " has been cancelled.");
            } catch (Exception ignored) {}
        }
        return updated;
    }

    public Booking extendBooking(String id, int extraHours, String userId) {
        if (extraHours <= 0) {
            throw new RuntimeException("Extra hours must be greater than 0");
        }
        Booking booking = getBookingById(id);
        ParkingListing parking = booking.getParkingId();
        final String targetBookingId = booking.getId();

        Date oldEnd = booking.getEndTime() != null ? booking.getEndTime() : new Date();
        Date newEnd = new Date(oldEnd.getTime() + (long) extraHours * 3600000L);

        // Check for overlap in extended period
        if (parking != null && parking.getId() != null) {
            List<Booking> overlapping = bookingRepository
                    .findByParkingIdIdAndStartTimeLessThanAndEndTimeGreaterThanAndStatusNot(
                            parking.getId(),
                            newEnd,
                            oldEnd,
                            BookingStatus.CANCELLED
                    );
            // Filter out current booking
            long otherOverlapCount = overlapping.stream()
                    .filter(b -> targetBookingId != null && !targetBookingId.equals(b.getId()))
                    .count();

            int capacity = getCapacityForType(parking, booking.getVehicleType());
            if (otherOverlapCount >= capacity) {
                throw new RuntimeException("Cannot extend: no slots available during extended duration.");
            }
        }

        booking.setEndTime(newEnd);
        booking.setTotalHours(booking.getTotalHours() + extraHours);

        double rate = (parking != null && parking.getPricing() != null) ? parking.getPricing().getHourlyRate() : 50.0;
        double addedAmount = rate * extraHours;
        booking.setTotalAmount(booking.getTotalAmount() + addedAmount);

        Booking updated = bookingRepository.save(booking);

        if (notificationService != null && booking.getUserId() != null) {
            try {
                notificationService.createNotification(booking.getUserId().getId(), "Booking Extended",
                        "Booking " + booking.getBookingId() + " extended by " + extraHours + "h. New end time: " + newEnd);
            } catch (Exception ignored) {}
        }
        return updated;
    }

    public Booking updateStatus(String id, BookingStatus status) {
        Booking booking = getBookingById(id);
        booking.setStatus(status);
        return bookingRepository.save(booking);
    }

    // Scheduler: Expire bookings
    @Scheduled(fixedRate = 60000)
    public void expireBookings() {
        Date now = new Date();
        List<Booking> expired = bookingRepository.findByStatusAndEndTimeBefore(BookingStatus.BOOKED, now);
        for (Booking b : expired) {
            b.setStatus(BookingStatus.EXPIRED);
            bookingRepository.save(b);
        }
    }

    public java.util.Map<String, Object> getProviderDashboardStats(String providerId) {
        List<ParkingListing> listings = parkingListingRepository.findByProviderIdId(providerId);
        List<Booking> bookings = listings.isEmpty() ? List.of() : bookingRepository.findByParkingIdIn(listings);

        double totalEarnings = bookings.stream()
                .mapToDouble(Booking::getTotalAmount)
                .sum();

        long activeBookings = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.BOOKED || b.getStatus() == BookingStatus.CHECKED_IN)
                .count();

        return java.util.Map.of(
                "totalSpots", listings.size(),
                "activeBookings", activeBookings,
                "totalEarnings", totalEarnings);
    }
}
