# 🅿️ ParkEase - Smart Parking Management System

[![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red)]()
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.2-brightgreen)]()
[![React](https://img.shields.io/badge/React-19.2.0-blue)]()
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-blue)]()

> **A modern, full-stack parking management solution with real-time availability, integrated payments, and QR-based check-in.**

---

## 🌟 Features

### For Drivers (Users)

- 🗺️ **Interactive Map Search** - Find available parking spots on an interactive Leaflet map
- 🎯 **Smart Filtering** - Filter by price, distance, EV charging availability
- 💳 **Seamless Booking** - One-click booking with integrated payment modal
- 📱 **QR Ticket Generation** - Instant downloadable QR code tickets after booking
- ⭐ **Favorites** - Save frequently used parking spots  
- 🔔 **Real-Time Notifications** - Toast alerts for all actions
- 💼 **Wallet Integration** - Manage wallet balance and transactions  

### For Providers

- ➕ **Add Parking Listings** - Create new parking spots with details
- 📊 **Dashboard Analytics** - View bookings, revenue, and statistics
- 🔍 **QR Scanner** - Scan booking QR codes for check-in
- 📈 **Booking Management** - Track all bookings in real-time
- ✅ **Status Updates** - Update parking availability and booking status

### For Admins  

- 🛡️ **Approval Workflow** - Review and approve new parking listings
- 🚦 **Status Management** - Control (approve/reject) parking spot listings
- 👥 **User Management** - Manage drivers and providers
- 📊 **System Analytics** - Comprehensive charts and statistics

---

## 🏗️ Tech Stack

### Frontend

- **React 19.2** - Modern UI with Hooks and Context API
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Leaflet & React-Leaflet** - Interactive maps
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time updates
- **QRCode.React** - QR code generation
- **Recharts** - Beautiful charts for analytics

### Backend

- **Spring Boot 3.2.2** - Robust Java framework
- **Spring Security** - JWT-based authentication
- **MySQL** - Relational database
- **Maven** - Dependency management
- **Hibernate / JPA** - ORM framework
- **WebSocket** - Real-time communication
- **JWT (io.jsonwebtoken)** - Secure token generation

### DevOps & Deployment

- **Docker** - Containerization (config included)
- **Render** - Cloud deployment (render.yaml included)
- **Git** - Version control

---

## 🚀 Quick Start

### Prerequisites

- **Java 17+** (for backend)
- **Node.js 18+** (for frontend)
- **MySQL Server** (local or managed)
- **Maven** (for backend build)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/parkease.git
cd parkease
```

### 2️⃣ Backend Setup

```bash
cd backend

# Configure application.properties
# Update the following in src/main/resources/application.properties:
# - spring.datasource.url=jdbc:mysql://localhost:3306/parkease_db
# - spring.datasource.username=root
# - spring.datasource.password=your_password
# - jwt.secret=your_secret_key

# Build and run
mvn clean install
mvn spring-boot:run
```

Backend will start on **<http://localhost:5002>**

### 3️⃣ Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables (Development)
# Create .env file:
VITE_API_URL=http://localhost:5002/api

# Run development server
npm run dev
```

### Configure Environment Variables (Production)

```env
# Backend
DB_URL=jdbc:mysql://your_production_mysql_host:3306/parkease_db
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
JWT_SECRET=your_strong_secret_key
JWT_EXPIRATION=86400000

# Frontend
VITE_API_URL=https://your-backend-url.com/api
```

Frontend will start on **<http://localhost:5173>**

---

## 📂 Project Structure

```

parkease/
├── backend/                 # Spring Boot backend
│   ├── src/main/java/
│   │   └── com/parkease/
│   │       ├── controller/  # REST API endpoints
│   │       ├── model/       # JPA Entities
│   │       ├── service/     # Business logic
│   │       ├── security/    # JWT & Spring Security config
│   │       ├── dto/         # Data transfer objects
│   │       └── repository/  # Spring Data JPA repositories
│   └── src/main/resources/
│       └── application.properties
│
├── frontend/                # React frontend
│   ├── src/
│   │   ├── pages/           # Main app pages
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React Context providers
│   │   ├── dashboards/      # Role-specific dashboards
│   │   └── styles/          # CSS and Tailwind config
│   └── public/
│
├── docker-compose.yml       # Docker setup
├── render.yaml              # Render deployment config
└── README.md                # You are here!

```

---

## 🔑 Demo Credentials

Use these credentials to test the application:

| Role | Email | Password | Features |
|------|-------|----------|----------|
| **Admin** | `admin@parkease.com` | `admin123` | Approve listings, Manage users |
| **Provider** | `owner@parkease.com` | `owner123` | Add parking, Scan QR, View Revenue |
| **Driver** | `user@parkease.com` | `user123` | Book spots, Pay, Withdrawal |
