package com.parkease.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String password;

    private String resetPasswordToken;
    private Date resetPasswordExpire;

    private Role role = Role.USER;

    @Indexed(unique = true, sparse = true)
    private String googleId;

    private String phone = "";
    private String licensePlate = "";

    private List<UserVehicle> vehicles = new ArrayList<>();

    private double walletBalance = 0.0;

    private String photo = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

    @DBRef
    private List<ParkingListing> favorites = new ArrayList<>();

    private List<Transaction> transactions = new ArrayList<>();

    private Date createdAt = new Date();
    private Date updatedAt = new Date();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserVehicle {
        private String plate;
        private String model;
        private VehicleType type = VehicleType.FOUR_SEATER;
        private boolean isDefault = false;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Transaction {
        private String type; // credit, debit
        private double amount;
        private Date date = new Date();
        private String desc;
    }
}
