package com.parkease.repository;

import com.parkease.model.ListingStatus;
import com.parkease.model.ParkingListing;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParkingListingRepository extends MongoRepository<ParkingListing, String> {
    List<ParkingListing> findByStatus(ListingStatus status);
    List<ParkingListing> findByProviderIdId(String providerId);
}
