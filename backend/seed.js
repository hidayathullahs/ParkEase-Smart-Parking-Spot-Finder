const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Parking = require('./models/Parking'); // Not used in this specific seed but good to have
const ParkingListing = require('./models/ParkingListing');

dotenv.config();

const seedData = async () => {
    try {
        await connectDB();
        console.log("DB Connected. Clearing old data...");

        // clean
        await User.deleteMany({});
        await ParkingListing.deleteMany({});

        // 1. Create ADMIN
        const adminUser = await User.create({
            name: "Super Admin",
            email: "admin@parkease.com",
            password: "adminpassword", // Pre-save hook will hash
            role: "ADMIN"
        });
        console.log("✅ Admin Created: admin@parkease.com / adminpassword");

        // 2. Create PROVIDER
        const providerUser = await User.create({
            name: "John Provider",
            email: "provider@parkease.com",
            password: "providerpassword",
            role: "PROVIDER",
            phone: "9876543210"
        });
        console.log("✅ Provider Created: provider@parkease.com / providerpassword");

        // 3. Create DRIVER
        const driverUser = await User.create({
            name: "Alice Driver",
            email: "user@parkease.com",
            password: "userpassword",
            role: "USER",
            phone: "1234567890",
            licensePlate: "KA-01-AB-1234",
            vehicles: [
                { plate: "KA-01-AB-1234", model: "Swift", type: "FOUR_SEATER", isDefault: true },
                { plate: "KA-05-XY-9999", model: "KTM Duke", type: "BIKE", isDefault: false }
            ]
        });
        console.log("✅ Driver Created: user@parkease.com / userpassword");

        // 4. Create Sample APPROVED Parking Listing
        await ParkingListing.create({
            providerId: providerUser._id,
            title: "MALL ON STRIP",
            description: "Safe and secure parking near the mall.",
            ownershipRelation: "OWNED",
            addressLine: "123 Mall Road",
            city: "Bangalore",
            pincode: "560001",
            location: { lat: 12.9716, lng: 77.5946 }, // Bangalore coords
            availableFrom: "08:00",
            availableTo: "22:00",
            dimensions: { length: 50, width: 50, totalArea: 2500 },
            approxTotalCars: 100,
            vehicleCapacity: { twoWheeler: 50, fourWheeler: 50, car4Seater: 30, car6Seater: 10, suv: 10 },
            pricing: { hourlyRate: 50, bikeRate: 20 },
            status: "APPROVED",
            approvedBy: adminUser._id,
            approvedAt: new Date(),
            images: ["https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?q=80&w=1000&auto=format&fit=crop"]
        });
        console.log("✅ Sample Managed Parking Created (Approved)");

        console.log("\nSEEDING COMPLETE! Press Ctrl+C to exit.");
        process.exit();

    } catch (error) {
        console.error("Error seeding:", error);
        process.exit(1);
    }
};

seedData();
