package com.parkease.service;

import com.parkease.dto.BookingRequest;
import com.parkease.model.*;
import com.parkease.repository.BookingRepository;
import com.parkease.repository.ParkingListingRepository;
import com.parkease.repository.TransactionRepository;
import com.parkease.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private ParkingListingRepository parkingListingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private BookingService bookingService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreateBooking_SuccessWithApprovedListing() {
        String parkingId = "park-123";
        String userId = "user-123";

        ParkingListing listing = new ParkingListing();
        listing.setId(parkingId);
        listing.setTitle("Downtown Spot");
        listing.setStatus(ListingStatus.APPROVED);

        ParkingListing.VehicleCapacity capacity = new ParkingListing.VehicleCapacity();
        capacity.setFourWheeler(5);
        capacity.setCar4Seater(5);
        listing.setVehicleCapacity(capacity);

        ParkingListing.Pricing pricing = new ParkingListing.Pricing();
        pricing.setHourlyRate(50.0);
        listing.setPricing(pricing);

        User user = new User();
        user.setId(userId);
        user.setName("John Doe");

        BookingRequest request = new BookingRequest();
        request.setParkingId(parkingId);
        request.setVehicleType(VehicleType.FOUR_SEATER);
        request.setStartTime(new Date());
        request.setEndTime(new Date(System.currentTimeMillis() + 7200000L));
        request.setTotalHours(2.0);
        request.setTotalAmount(100.0);

        when(parkingListingRepository.findById(parkingId)).thenReturn(Optional.of(listing));
        when(bookingRepository.findByParkingIdIdAndStartTimeLessThanAndEndTimeGreaterThanAndStatusNot(
                eq(parkingId), any(Date.class), any(Date.class), eq(BookingStatus.CANCELLED)
        )).thenReturn(List.of());
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> {
            Booking b = i.getArgument(0);
            b.setId("booking-xyz");
            return b;
        });

        Booking result = bookingService.createBooking(request, userId);

        assertNotNull(result);
        assertEquals(BookingStatus.BOOKED, result.getStatus());
        assertEquals(100.0, result.getTotalAmount());
        assertNotNull(result.getQrCodeDataUrl());
        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    @Test
    void testCreateBooking_FailsWhenListingNotApproved() {
        String parkingId = "park-unapproved";
        String userId = "user-123";

        ParkingListing listing = new ParkingListing();
        listing.setId(parkingId);
        listing.setTitle("Pending Spot");
        listing.setStatus(ListingStatus.PENDING); // Not APPROVED

        BookingRequest request = new BookingRequest();
        request.setParkingId(parkingId);
        request.setVehicleType(VehicleType.FOUR_SEATER);

        when(parkingListingRepository.findById(parkingId)).thenReturn(Optional.of(listing));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                bookingService.createBooking(request, userId)
        );
        assertTrue(ex.getMessage().contains("not approved"));
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void testCreateBooking_FailsOnOverlapCapacityExceeded() {
        String parkingId = "park-full";
        String userId = "user-123";

        ParkingListing listing = new ParkingListing();
        listing.setId(parkingId);
        listing.setStatus(ListingStatus.APPROVED);

        ParkingListing.VehicleCapacity capacity = new ParkingListing.VehicleCapacity();
        capacity.setFourWheeler(1);
        capacity.setCar4Seater(1);
        listing.setVehicleCapacity(capacity);

        Booking existing = new Booking();
        existing.setId("existing-1");

        BookingRequest request = new BookingRequest();
        request.setParkingId(parkingId);
        request.setVehicleType(VehicleType.FOUR_SEATER);
        request.setStartTime(new Date());
        request.setEndTime(new Date(System.currentTimeMillis() + 3600000L));

        when(parkingListingRepository.findById(parkingId)).thenReturn(Optional.of(listing));
        when(bookingRepository.findByParkingIdIdAndStartTimeLessThanAndEndTimeGreaterThanAndStatusNot(
                eq(parkingId), any(Date.class), any(Date.class), eq(BookingStatus.CANCELLED)
        )).thenReturn(List.of(existing));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                bookingService.createBooking(request, userId)
        );
        assertTrue(ex.getMessage().contains("No slots available"));
    }

    @Test
    void testCheckInAndCheckOut() {
        Booking booking = new Booking();
        booking.setId("b-1");
        booking.setBookingId("PE-1001");
        booking.setStatus(BookingStatus.BOOKED);

        when(bookingRepository.findById("b-1")).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        Booking checkedIn = bookingService.checkInBooking("b-1");
        assertEquals(BookingStatus.CHECKED_IN, checkedIn.getStatus());

        Booking checkedOut = bookingService.checkOutBooking("b-1");
        assertEquals(BookingStatus.CHECKED_OUT, checkedOut.getStatus());
    }

    @Test
    void testExtendBooking() {
        ParkingListing listing = new ParkingListing();
        listing.setId("p-1");
        ParkingListing.Pricing pricing = new ParkingListing.Pricing();
        pricing.setHourlyRate(40.0);
        listing.setPricing(pricing);
        listing.setApproxTotalCars(10);

        Booking booking = new Booking();
        booking.setId("b-1");
        booking.setParkingId(listing);
        booking.setTotalHours(2.0);
        booking.setTotalAmount(80.0);
        booking.setEndTime(new Date());

        when(bookingRepository.findById("b-1")).thenReturn(Optional.of(booking));
        when(bookingRepository.findByParkingIdIdAndStartTimeLessThanAndEndTimeGreaterThanAndStatusNot(
                any(), any(), any(), any()
        )).thenReturn(List.of());
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        Booking extended = bookingService.extendBooking("b-1", 2, "user-123");
        assertEquals(4.0, extended.getTotalHours());
        assertEquals(160.0, extended.getTotalAmount());
    }
}
