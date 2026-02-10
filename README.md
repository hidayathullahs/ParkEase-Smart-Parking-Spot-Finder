# 🅿️ ParkEase - Smart Parking Management System

![Status](https://img.shields.io/badge/Status-Production%20Ready-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-green)
![Tech](https://img.shields.io/badge/MERN-Stack-black)

**ParkEase** is a production-grade parking management platform engineered to solve the daily frustration of finding parking in crowded urban areas. We connect parking space owners (Providers) directly with drivers through a seamless, real-time application.

The platform features live occupancy tracking, secure digital payments, and a QR-code based check-in system that ensures a frictionless experience from booking to parking.

---

## 🚀 Core Features

### 🚗 For Drivers

* **Smart Discovery**: Instantly find available spots using our interactive map with advanced filters (Cheapest, Closest, Trusted Ratings).
* **Visual Booking Engine**: Select your exact parking bay from a visual grid layout—no more guessing where you'll park.
* **Digital Wallet**: Integrated wallet system for fast, secure payments without needing to enter card details every time.
* **Touchless Access**: Every booking generates a unique encrypted QR code for instant check-in and check-out.
* **Garage Management**: Store multiple vehicle profiles for quick switching between personal and work cars.

### 🏢 For Parking Providers

* **Provider Dashboard**: A powerful command center giving real-time utilization stats, revenue tracking, and active bookings.
* **QR Scanner Integration**: Built-in scanner functionality allows providers or automated kiosks to verify tickets in milliseconds.
* **Dynamic Asset Management**: Easily add, edit, or toggle parking spot availability with photo uploads and custom pricing rules.

### 🛡️ Admin & Security Features

* **Eco-System Oversight**: Admins have full visibility into platform health, user variations, and listing approvals.
* **Verified Listings**: All new parking zones go through an approval workflow to ensure safety and accuracy.
* **Review Locking**: Our "Verified Stay" system ensures only users who have actually parked can leave reviews, eliminating spam.

---

## 🛠️ Technology Architecture

We built ParkEase using a robust, modern MERN architecture focusing on performance and scalability:

* **Frontend**: React (Vite) for blazing fast performance, styled with TailwindCSS for a premium, responsive UI. Animations powered by Framer Motion.
* **Backend**: Node.js & Express.js REST API with comprehensive middleware security (Helmet, CORS).
* **Database**: MySQL for structured data storage.
* **Real-Time**: Socket.io integration for live status updates.
* **Authentication**: Secure JWT (JSON Web Tokens) with HttpOnly cookies and BCrypt password hashing.

---

## ⚡ Getting Started

Follow these steps to set up the project locally.

### 1. Clone the Repository

```bash
git clone https://github.com/hidayathullahs/ParkEase-Smart-Parking-Spot-Finder.git
cd ParkEase-Smart-Parking-Spot-Finder
```

### 2. Backend Configuration

The backend server handles all API requests, authentication, and database connections.

```bash
cd backend
npm install

# Create a .env file in the backend directory with your credentials:
# PORT=5000

# JWT_SECRET=your_secure_secret_key
# GOOGLE_CLIENT_ID=your_google_auth_id

npm run dev
```

### 3. Database Seeding (Recommended for Dev)

We've included a seeder script to instantly populate your database with test users, parking spots, and bookings so you don't start with an empty app.

```bash
# While in the backend directory:
node seed.js
```

* **Admin Account**: `admin@parkease.com` / `adminpassword`
* **Provider Account**: `provider@parkease.com` / `providerpassword`
* **User Account**: `user@parkease.com` / `userpassword`

### 4. Frontend Configuration

The frontend is the React application that users interact with.

```bash
cd ../frontend
npm install
npm run dev
```

### 5. Launch

Open your browser and navigate to:

* **Application**: `http://localhost:5173`
* **Backend API**: `http://localhost:5000`

---

## 📱 User Journey

1. **Search**: User opens the map, sees live prices, and clicks a pin.
2. **Book**: User views the parking lot layout, picks a spot, and pays via Wallet.
3. **Drive**: User navigates to the location.
4. **Scan**: The Provider uses the "Scan" tab to scan the user's ticket.
5. **Park**: The system marks the booking as active.
6. **Leave**: Scanning again ends the session and updates the spot to "Available".

---

## 👥 Authors

* **HIDAYATHULLAH** - *Lead Developer*

---
*ParkEase © 2026. Built for the Future of Urban Mobility.*
