const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
// ParkingListing is the model name in your codebase, NOT ParkingZone
const ParkingListing = require('../models/ParkingListing');
const connectDB = require('../config/db');

dotenv.config();

const seedData = async () => {
    await connectDB();

    try {
        console.log('Clearing old data...');
        await User.deleteMany();
        await ParkingListing.deleteMany();

        console.log('Creating users...');

        // 1. Create a "Driver" User (User Role)
        const user = await User.create({
            name: 'John Driver',
            email: 'user@test.com',
            password: 'password123',
            role: 'USER',
            walletBalance: 50,
            transactions: [
                { type: 'credit', amount: 50, desc: 'Welcome Bonus', date: new Date() }
            ]
        });

        // 2. Create a "Space Owner" User (Provider Role)
        const owner = await User.create({
            name: 'Priya Owner',
            email: 'owner@test.com',
            password: 'password123',
            role: 'PROVIDER',
            phone: '9876543210'
        });

        // 3. Create an "Admin" User (Admin Role)
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@test.com',
            password: 'password123',
            role: 'ADMIN'
        });

        console.log('Creating parking listings...');

        // Bangalore Locations
        const bangaloreSpots = [
            {
                title: 'MG Road Premium Parking',
                description: 'Secure basement parking near Metro Station.',
                addressLine: 'Rex Towers, MG Road',
                city: 'Bangalore',
                pincode: '560001',
                location: { lat: 12.9716, lng: 77.5946 },
                pricing: { hourlyRate: 50 },
                availableFrom: "08:00",
                availableTo: "22:00",
                ownershipRelation: "SELF",
                dimensions: { length: 20, width: 30, totalArea: 600 },
                approxTotalCars: 40,
                vehicleCapacity: { car4Seater: 30, twoWheeler: 20 },
                images: ['https://images.unsplash.com/photo-1470224114654-ee47329603f7?auto=format&fit=crop&q=80&w=1000'],
                status: 'APPROVED',
                approvedBy: admin._id,
                approvedAt: new Date(),
                providerId: owner._id
            },
            {
                title: 'Indiranagar High Street',
                description: 'Open lot parking behind 12th Main heavy shopping area.',
                addressLine: '12th Main, Indiranagar',
                city: 'Bangalore',
                pincode: '560038',
                location: { lat: 12.9719, lng: 77.6412 },
                pricing: { hourlyRate: 80 },
                availableFrom: "10:00",
                availableTo: "23:00",
                ownershipRelation: "SELF",
                dimensions: { length: 15, width: 20, totalArea: 300 },
                approxTotalCars: 20,
                vehicleCapacity: { car4Seater: 15, suv: 5 },
                images: ['https://images.unsplash.com/photo-1506521781263-d586e9781085?auto=format&fit=crop&q=80&w=1000'],
                status: 'APPROVED',
                approvedBy: admin._id,
                approvedAt: new Date(),
                providerId: owner._id
            },
            {
                title: 'Koramangala Tech Park',
                description: 'Covered parking with EV charging stations.',
                addressLine: '80 Feet Road, Koramangala',
                city: 'Bangalore',
                pincode: '560095',
                location: { lat: 12.9352, lng: 77.6245 },
                pricing: { hourlyRate: 40 },
                availableFrom: "00:00",
                availableTo: "23:59", // 24/7
                ownershipRelation: "SELF",
                dimensions: { length: 50, width: 50, totalArea: 2500 },
                approxTotalCars: 150,
                vehicleCapacity: { car4Seater: 100, bike: 50 },
                images: ['https://images.unsplash.com/photo-1590674899505-1c5c41951f89?auto=format&fit=crop&q=80&w=1000'],
                status: 'APPROVED',
                approvedBy: admin._id,
                approvedAt: new Date(),
                providerId: owner._id
            },
            {
                title: 'Mall of Asia Valet',
                description: 'Premium valet parking service.',
                addressLine: 'Bellary Road, Hebbal',
                city: 'Bangalore',
                pincode: '560024',
                location: { lat: 13.0500, lng: 77.5900 }, // Approx Hebbal
                pricing: { hourlyRate: 100 },
                availableFrom: "09:00",
                availableTo: "01:00",
                ownershipRelation: "SELF",
                dimensions: { length: 40, width: 40, totalArea: 1600 },
                approxTotalCars: 80,
                vehicleCapacity: { suv: 30, car4Seater: 50 },
                images: ['https://images.unsplash.com/photo-1588064643233-49210b27b82e?auto=format&fit=crop&q=80&w=1000'],
                status: 'APPROVED',
                approvedBy: admin._id,
                approvedAt: new Date(),
                providerId: owner._id
            },
            {
                title: 'Whitefield IT Zone',
                description: 'Secure office parking for visitors.',
                addressLine: 'ITPL Main Road',
                city: 'Bangalore',
                pincode: '560066',
                location: { lat: 12.9863, lng: 77.7373 },
                pricing: { hourlyRate: 30 },
                availableFrom: "07:00",
                availableTo: "22:00",
                ownershipRelation: "SELF",
                dimensions: { length: 60, width: 40, totalArea: 2400 },
                approxTotalCars: 120,
                vehicleCapacity: { car4Seater: 80, twoWheeler: 40 },
                images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000'],
                status: 'APPROVED',
                approvedBy: admin._id,
                approvedAt: new Date(),
                providerId: owner._id
            }
        ];

        await ParkingListing.insertMany(bangaloreSpots);

        console.log('✅ Data Imported Successfully!');
        console.log('Created Users:');
        console.log('1. User: user@test.com / password123');
        console.log('2. Owner: owner@test.com / password123');
        console.log('3. Admin: admin@test.com / password123');

        process.exit();
    } catch (error) {
        console.error(`❌ Error with seed: ${error}`);
        process.exit(1);
    }
};

seedData();
