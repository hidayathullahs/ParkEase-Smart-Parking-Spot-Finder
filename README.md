# 🅿️ ParkEase - Smart Parking Management System

![Status](https://img.shields.io/badge/Status-Development-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-green)
![Tech](https://img.shields.io/badge/MERN-Stack-black)

**ParkEase** is a premium, real-time parking management platform designed to solve the urban parking crisis. It connects parking providers with drivers through a seamless, automated experience featuring live occupancy tracking, QR code check-ins, and secure digital payments.

---

## 🚀 Key Features

### 🚗 For Drivers
- **Smart Discovery**: Find parking spots with filters (Cheapest, Closest, Trusted).
- **Visual Booking**: Interactive slots grid logic.
- **Premium Payment**: Simulated secure payment gateway with realistic transaction flow.
- **Instant Access**: QR Code based tickets for touchless entry/exit.
- **My Garage**: Quick-select saved vehicles for faster booking.

### 🏢 For Parking Providers
- **Provider Dashboard**: Real-time stats on earnings, active cars, and utilization.
- **QR Scanner**: Built-in scanner to check-in/check-out vehicles instantly.
- **Listing Management**: Add and manage parking spots with images and pricing.

### 🛡️ For Admins
- **Live Monitoring**: Track total live occupancy across the platform.
- **Approval Workflow**: Verify and approve new parking listings.
- **User Management**: Oversee all users and bookings.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite), TailwindCSS, Framer Motion, Lucide Icons, Recharts.
- **Backend**: Node.js, Express, MongoDB (Mongoose).
- **Authentication**: JWT & BCrypt.
- **Real-time / Media**: Socket.io (ready), Cloudinary (ready), html5-qrcode.

---

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/parkease.git
cd parkease
```

### 2. Backend Setup
```bash
cd backend
npm install
# Create .env file
echo "PORT=5000" > .env
echo "MONGO_URI=mongodb://localhost:27017/parkease" >> .env
echo "JWT_SECRET=your_super_secret_key" >> .env
npm run dev
```

### 3. Database Seeding (Optional)
To populate the database with a default Admin, Provider, Driver, and Approved Listing:
```bash
cd backend
node seed.js
# Credentials:
# Admin: admin@parkease.com / adminpassword
# Provider: provider@parkease.com / providerpassword
# Driver: user@parkease.com / userpassword
```

### 4. Frontend Setup
```bash
cd frontend
npm install
# Create .env
cp .env.example .env
npm run dev
```

### 4. Access the App
- **User App**: `http://localhost:5173`
- **API Server**: `http://localhost:5000`

---

## 📱 User Flows

### Booking Flow
1. **Search**: User finds a spot on the map.
2. **Book**: Selects time -> "Pay & Book" (Simulated Payment).
3. **Ticket**: Receives a QR Code ticket.

### Check-in Flow
1. **Drive**: User arrives at location.
2. **Scan**: Provider scans user's QR code.
3. **Park**: System marks booking as `CHECKED_IN`.

---

## 🔐 Security Features
- **Review Lock**: Users can only review a parking spot *after* completing a booking.
- **Role-Based Access**: Strict separation between User, Provider, and Admin routes.
- **JWT Auth**: Secure stateless authentication.

---

## 👥 Contributors
- **Frontend Lead**: [Your Name]
- **Backend Lead**: [Your Name]

---
*Built with ❤️ for Smart Cities.*
