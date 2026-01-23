package com.parkease.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookings")
public class Booking {
    @Id
    private String id;

    @Indexed(unique = true)
    private String bookingId; // Human readable or short ID

    @DBRef
    private User userId;

    @DBRef
    private ParkingListing parkingId;

    private VehicleType vehicleType;

    private Date startTime;
    private Date endTime;

    private double totalHours;
    private double totalAmount;

    private BookingStatus status = BookingStatus.BOOKED;

    private String qrCodeDataUrl;

    private Date createdAt = new Date();
    private Date updatedAt = new Date();
}
