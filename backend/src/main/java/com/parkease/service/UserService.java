package com.parkease.service;

import com.parkease.model.ParkingListing;
import com.parkease.model.User;
import com.parkease.repository.ParkingListingRepository;
import com.parkease.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    @Autowired
    UserRepository userRepository;
    
    @Autowired
    ParkingListingRepository parkingListingRepository;

    public User getUserById(String id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateProfile(String id, User updatedPool) {
        User user = getUserById(id);
        
        if (updatedPool.getName() != null) user.setName(updatedPool.getName());
        if (updatedPool.getPhone() != null) user.setPhone(updatedPool.getPhone());
        if (updatedPool.getLicensePlate() != null) user.setLicensePlate(updatedPool.getLicensePlate());
        if (updatedPool.getVehicles() != null) user.setVehicles(updatedPool.getVehicles());
        if (updatedPool.getPhoto() != null) user.setPhoto(updatedPool.getPhoto());
        
        return userRepository.save(user);
    }

    public User toggleFavorite(String userId, String parkingId) {
        User user = getUserById(userId);
        
        Optional<ParkingListing> parkingOpt = parkingListingRepository.findById(parkingId);
        if (parkingOpt.isEmpty()) {
            throw new RuntimeException("Parking not found");
        }
        ParkingListing parking = parkingOpt.get();

        boolean exists = user.getFavorites().stream().anyMatch(p -> p.getId().equals(parkingId));
        
        if (exists) {
            user.getFavorites().removeIf(p -> p.getId().equals(parkingId));
        } else {
            user.getFavorites().add(parking);
        }
        
        return userRepository.save(user);
    }
}
