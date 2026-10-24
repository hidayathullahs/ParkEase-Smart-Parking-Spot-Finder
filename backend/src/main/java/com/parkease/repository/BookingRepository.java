package com.parkease.repository;

import com.parkease.model.Booking;
import com.parkease.model.BookingStatus;
import com.parkease.model.ParkingListing;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    Optional<Booking> findByBookingId(String bookingId);

    @Query("{ $or: [ { 'userId.$id': ?0 }, { 'userId': ?0 } ] }")
    List<Booking> findByUserId(String userId);

    @Query("{ $or: [ { 'userId.$id': ?0 }, { 'userId': ?0 } ] }")
    List<Booking> findByUserIdId(String userId);

    @Query("{ $or: [ { 'parkingId.$id': ?0 }, { 'parkingId': ?0 } ] }")
    List<Booking> findByParkingIdId(String parkingId);

    List<Booking> findByStatus(BookingStatus status);

    // Find bookings for a parking space that overlap with a given time range
    // existing.startTime < newEndTime AND existing.endTime > newStartTime
    // status != CANCELLED
    @Query("{ $and: [ " +
            "  { $or: [ { 'parkingId.$id': ?0 }, { 'parkingId': ?0 } ] }, " +
            "  { 'startTime': { $lt: ?1 } }, " +
            "  { 'endTime': { $gt: ?2 } }, " +
            "  { 'status': { $ne: ?3 } } " +
            "] }")
    List<Booking> findByParkingIdIdAndStartTimeLessThanAndEndTimeGreaterThanAndStatusNot(
            String parkingId, Date endTime, Date startTime, BookingStatus status);

    List<Booking> findByStatusAndEndTimeBefore(BookingStatus status, Date date);

    // Find bookings for a list of parkings
    List<Booking> findByParkingIdIn(List<ParkingListing> parkings);

    @Query("{ $or: [ { 'parkingId.$id': { $in: ?0 } }, { 'parkingId': { $in: ?0 } } ] }")
    List<Booking> findByParkingIds(List<String> parkingIds);
}
