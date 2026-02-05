package com.parkease.config;

import com.parkease.model.Role;
import com.parkease.model.User;
import com.parkease.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    UserRepository userRepository;

    @Autowired
    com.parkease.repository.ParkingListingRepository parkingListingRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedUser("admin@gmail.com", "admin123", "Admin User", Role.ADMIN);
        User provider = seedUser("provider@gmail.com", "provider123", "Provider User", Role.PROVIDER);
        seedUser("user@gmail.com", "user123", "Normal User", Role.USER);

        if (provider != null) {
            seedParkings(provider);
        }
    }

    private User seedUser(String email, String password, String name, Role role) {
        if (!userRepository.existsByEmail(email)) {
            User user = new User();
            user.setEmail(email);
            user.setName(name);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(role);
            return userRepository.save(user);
        }
        return userRepository.findByEmail(email).orElse(null);
    }

    private void seedParkings(User provider) {
        if (parkingListingRepository.count() == 0) {
            // Bengaluru Center approx 12.9716, 77.5946
            createListing(provider, "Mall Parking", "Covered parking near city mall", 12.9716, 77.5946, 50.0);
            createListing(provider, "Metro Station Spot", "Open parking next to metro", 12.9780, 77.5700, 30.0);
            createListing(provider, "Market Complex", "Secure gated parking", 12.9500, 77.6000, 40.0);
            createListing(provider, "Tech Park Visitor", "Visitor parking slots", 12.9352, 77.6245, 60.0);
            createListing(provider, "Indiranagar Spot", "Residential driveway", 12.9719, 77.6412, 25.0);
            System.out.println("Seeded parking listings");
        }
    }

    private void createListing(User provider, String title, String desc, double lat, double lng, double rate) {
        com.parkease.model.ParkingListing p = new com.parkease.model.ParkingListing();
        p.setProviderId(provider);
        p.setTitle(title);
        p.setDescription(desc);
        p.setAddressLine("Sample Address, Bengaluru");
        p.setCity("Bengaluru");
        p.setLocation(new com.parkease.model.ParkingListing.Location(lat, lng));
        p.setPricing(new com.parkease.model.ParkingListing.Pricing());
        p.getPricing().setHourlyRate(rate);
        p.setStatus(com.parkease.model.ListingStatus.APPROVED);
        p.setImages(java.util.Arrays.asList(
                "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80"));
        p.setApproxTotalCars(10);

        p.setVehicleCapacity(new com.parkease.model.ParkingListing.VehicleCapacity());
        p.getVehicleCapacity().setCar4Seater(5);
        p.getVehicleCapacity().setTwoWheeler(10);

        parkingListingRepository.save(p);
    }
}
