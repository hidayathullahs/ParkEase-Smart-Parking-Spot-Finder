package com.parkease.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "parking_listings")
public class ParkingListing {
    @Id
    private String id;

    @DBRef
    private User providerId; // Reference to User

    private String title;
    private String description;

    private OwnershipRelation ownershipRelation;

    private String addressLine;
    private String city;
    private String pincode;

    private Location location;

    private String availableFrom;
    private String availableTo;

    private Dimensions dimensions;

    private int approxTotalCars;

    private VehicleCapacity vehicleCapacity;

    private Pricing pricing;

    private List<String> images;

    private ListingStatus status = ListingStatus.PENDING;
    private String rejectionReason = "";

    @DBRef
    private User approvedBy;
    private Date approvedAt;

    private Date createdAt = new Date();
    private Date updatedAt = new Date();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Location {
        private double lat;
        private double lng;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Dimensions {
        private double length;
        private double width;
        private double totalArea;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VehicleCapacity {
        private int twoWheeler = 0;
        private int fourWheeler = 0;
        private int car4Seater = 0;
        private int car6Seater = 0;
        private int suv = 0;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Pricing {
        private double hourlyRate;
    }
}
