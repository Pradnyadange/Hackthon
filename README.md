# EduMatrix AI — Intelligent School Operations & Smart Timetable Platform

[![GitHub Repository](https://img.shields.io/badge/GitHub-Pradnyadange%2FHackthon-blue?logo=github)](https://github.com/Pradnyadange/Hackthon)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

> **Hackathon Final Polish Release**  
> An intelligent, production-grade, full-stack School Operations Management Platform. Powered by an **AI Document Reader OCR Pipeline**, **Smart Constraint-Based Timetable Generator**, and **Proactive Action Required Monitoring Engine**.

---

## 🔗 Repository & Published Links

- **GitHub Repository**: [https://github.com/Pradnyadange/Hackthon](https://github.com/Pradnyadange/Hackthon)
- **Live Local Application**: `http://localhost:3000`
- **Interactive Swagger API Docs**: `http://localhost:5000/api/docs`

---

## 🌟 Key Modules & Features

### 1. 📄 AI Document Reader & OCR Pipeline
- **Physical Paper Form Digitization**: Upload paper admission forms, teacher registrations, or attendance physical sheets.
- **End-to-End Processing Pipeline**:  
  `📄 Physical Form` → `📤 Upload` → `⚡ AI / OCR Engine` → `📋 Structured Data` → `💾 Database`.
- **Desktop Split-Screen Verification**: Left column displays physical document scan preview; right column renders editable extracted fields with **OCR Confidence** scores (e.g. `97%`).
- **Database Insertion**: Admin verification step converts parsed fields into permanent database records upon approval.

### 2. 🗓️ Smart Constraint-Based Timetable Generator
- **Deterministic Constraint Satisfaction Engine**: Evaluates 6 operational dimensions:
  1. Teacher Availability Schedules
  2. Teacher Double-Booking Avoidance
  3. Classroom Double-Booking Avoidance
  4. Class Schedule Collision Prevention
  5. Weekly Subject Period Quota Fulfillment
  6. Room Seating Capacity Compliance vs Class Size
- **Real-Time Cross-Class Conflict Validation**: Automatically flags double-booking collisions across all classes in the database with red warning banners (`TIMETABLE CONFLICTS DETECTED`).
- **1-Click Optimization**: The constraint solver relocates conflicting classes into valid slots, restoring status to **`0 Conflicts (Optimized)`** in emerald green.

### 3. 🚨 Proactive Action Required Dashboard Feed
- Real-time alert engine monitoring system metrics:
  - 🔴 **Teacher Conflicts**: Cross-class double-booking collisions (`Resolve →`).
  - 🟠 **Low Attendance Warnings**: Student attendance falling below 75% threshold (`Review →`).
  - 🟡 **Documents Pending Verification**: OCR paper forms awaiting administrator review (`Verify Documents →`).
  - 🔵 **Staff Shortages**: Department subject allocation deficits (`View Staffing →`).

### 4. 📋 Attendance & Auto-RFID Simulation
- Daily class attendance matrix with instant status toggles (Present, Absent, Late, Excused).
- RFID card scan simulation endpoint (`POST /api/attendance/rfid-scan`).

### 5. 🔐 Role-Based Access Control (RBAC) & Security Hardening
- Enforced on both frontend UI and Express server routes for `SUPER_ADMIN`, `SCHOOL_ADMIN`, and `TEACHER`.
- HTTP Security Headers (CSP, Frameguard, XSS filter), Rate Limiting, Input Sanitization, and Error Stack Masking.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Lucide Icons, Custom Light Theme CSS Design Tokens.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, JWT Authentication, Multer file upload handler, Swagger UI Express.
- **Database**: PostgreSQL / SQLite (`dev.db`).
- **Containerization**: Docker Compose (`docker-compose.yml`).

---

## 🔑 Demo Login Credentials

You can use the built-in quick sign-in buttons on the login screen or enter the credentials below:

| Role | Email | Password | Access Capabilities |
| --- | --- | --- | --- |
| **School Admin** | `schooladmin@school.com` | `admin123` | Full administrative operations across all modules |
| **Super Admin** | `admin@school.com` | `admin123` | System settings, user management, & global permissions |
| **Teacher** | `teacher@school.com` | `teacher123` | Timetable schedule view, class rosters, & daily attendance |

---

## 🚀 Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
npx prisma db push
npm run prisma:seed
npm run dev
```

The Express API server will start on `http://localhost:5000`.  
Swagger documentation is available at `http://localhost:5000/api/docs`.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The React Vite application will launch on `http://localhost:3000`.

---

## 📄 API Endpoints Overview

Explore all REST endpoints via Swagger UI at: **`http://localhost:5000/api/docs`**

- `POST /api/auth/login` — Authenticate user credentials and receive JWT.
- `GET /api/timetable` — Retrieve class timetable and run global cross-class conflict validation.
- `POST /api/timetable/generate` — Execute constraint satisfaction scheduling.
- `POST /api/documents/upload` — Upload paper document scan & parse with AI OCR.
- `POST /api/documents/:id/approve` — Approve document and persist record to database.
- `POST /api/attendance/rfid-scan` — Simulate RFID card auto-attendance scan.

---

## 🌐 Published Repository

- **GitHub Project URL**: [https://github.com/Pradnyadange/Hackthon](https://github.com/Pradnyadange/Hackthon)
