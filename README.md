# 🅿️ ParkEase - Smart Parking Management System

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.2-brightgreen)]()
[![Java](https://img.shields.io/badge/Java-17-orange)]()
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)]()
[![React](https://img.shields.io/badge/React-19.2.0-blue)]()
[![Vite](https://img.shields.io/badge/Vite-7.3-purple)]()
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)]()
[![Render](https://img.shields.io/badge/Render-Deployed-success)]()

> **A modern full-stack smart parking management solution featuring real-time availability, dynamic pricing, slot booking overlap prevention, QR-based check-in/check-out, booking extensions, wallet integration, notifications, and role-based access.**

### 🌐 Live Production Links
- **Frontend App**: [https://parkease-frontend-ogl9.onrender.com](https://parkease-frontend-ogl9.onrender.com)
- **Backend API**: [https://parkease-backend-tous.onrender.com](https://parkease-backend-tous.onrender.com)
- **API Health**: [https://parkease-backend-tous.onrender.com/health](https://parkease-backend-tous.onrender.com/health)

---

## 🌟 Key Features

### 🚗 For Drivers
- 🗺️ **Interactive Spot Finder** - Search available parking locations via interactive Leaflet map.
- 🔒 **Approved Listings Only** - Only admin-approved parking spots are visible and open for booking.
- ⚡ **Overlap Prevention** - Concurrency and overlap checks ensure slots cannot be double-booked.
- 📱 **QR Tickets & History** - Instant scannable QR ticket generation, ticket countdowns, and full history.
- ⏱️ **Booking Extension** - Extend active bookings with automatic fee computation and conflict checking.
- 🚫 **Instant Cancellation** - Cancel existing reservations easily.
- 💼 **Digital Wallet** - Add funds, withdraw balance, and view transaction history.
- 🔔 **Notifications** - Real-time notification feed and unread counter for bookings and status updates.

### 🏢 For Space Providers
- ➕ **Register Parking Spaces** - Submit parking spots with dimensions, capacity, hourly pricing, and operating hours.
- 📊 **Provider Dashboard** - Overview of listings, active bookings, and total earnings.
- 📷 **QR Scanner (Check-In & Check-Out)** - Scan driver QR codes to check drivers in and out.
- 📋 **Booking List** - View all bookings across owned parking listings.

### 🛡️ For Administrators
- 🚦 **Approval Workflow** - Inspect pending parking listings and approve or reject with feedback reasons.
- 👥 **User Management** - View and manage registered drivers and providers.
- 📈 **System Analytics** - Track total users, active spots, total bookings, and overall system revenue.

---

## 🏗️ Architecture & Technology Stack

### Backend
- **Framework**: Spring Boot 3.2.2 on Java 17
- **Database**: MongoDB Atlas via Spring Data MongoDB
- **Security**: Stateless JWT (`jjwt 0.11.5`) + BCrypt + Spring Security 6
- **Containerization**: Multi-stage Docker build with Eclipse Temurin 17 JRE Alpine
- **Port Binding**: Dynamic Render PORT support (`server.port=${PORT:5002}`) listening on `0.0.0.0`

### Frontend
- **Framework**: React 19 + Vite 7
- **Routing**: React Router 7 with SPA rewrite configuration
- **Styling**: Tailwind CSS + Lucide Icons + Framer Motion
- **Maps**: Leaflet & React-Leaflet
- **Deployment**: Render Static Site (built to `dist/`)

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Java 17+**
- **Node.js 18+**
- **MongoDB** running locally (`mongodb://localhost:27017/parkease_db`) or MongoDB Atlas URI

### 1. Run Backend
```bash
cd backend
./mvnw clean test     # Runs 7 automated unit tests
./mvnw spring-boot:run
```
The backend starts on `http://localhost:5002`.

### 2. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend dev server starts on `http://localhost:5173`.

---

## 🌐 Deploy to Render

ParkEase includes a complete [`render.yaml`](file:///render.yaml) specification:

1. Push your repository to GitHub.
2. In [Render Dashboard](https://dashboard.render.com), select **New +** → **Blueprint**.
3. Link your repository.
4. Provide the `MONGODB_URI` environment variable pointing to your MongoDB Atlas cluster.
5. Render will automatically launch:
   - `parkease-backend`: Docker Web Service
   - `parkease-frontend`: Static Site with SPA rewrites

For step-by-step guidance, refer to [`DEPLOYMENT.md`](file:///DEPLOYMENT.md).

---

## 👥 Default Seed Credentials
Upon startup, `DataInitializer` automatically creates the following default accounts:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@parkease.com` | `admin123` |
| **Provider** | `owner@parkease.com` | `owner123` |
| **Driver** | `user@parkease.com` | `user123` |
