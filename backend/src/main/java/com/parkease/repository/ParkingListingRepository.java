package com.parkease.repository;

import com.parkease.model.ListingStatus;
import com.parkease.model.ParkingListing;
import com.parkease.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParkingListingRepository extends MongoRepository<ParkingListing, String> {
    List<ParkingListing> findByStatus(ListingStatus status);

    @Query("{ $or: [ { 'providerId.$id': ?0 }, { 'providerId': ?0 } ] }")
    List<ParkingListing> findByProviderIdId(String providerId);

    List<ParkingListing> findByProviderId(User provider);

    boolean existsByTitle(String title);
}
