package com.parkease.dto;

import com.parkease.model.VehicleType;
import lombok.Data;
import java.util.Date;

@Data
public class BookingRequest {
    private String parkingId;
    private VehicleType vehicleType;
    private Date startTime;
    private Date endTime;
    private double totalHours;
    private double totalAmount;
}
