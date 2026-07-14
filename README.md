# 🏥 DocAppoint — Doctor Appointment System

A full-stack, role-based web application where patients can search for doctors and book appointments, doctors can manage their schedules, and admins can control the entire platform.

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14 (App Router) | SSR, SEO, fast navigation |
| Styling | Tailwind CSS + Shadcn UI | Premium, responsive UI |
| Backend | NestJS 10 | Modular REST API architecture |
| Database | MongoDB (Mongoose) | Flexible schema, Atlas cloud |
| Auth | JWT + Passport.js | Secure role-based access control |

## Project Structure

```
├── frontend/          # Next.js application
│   ├── src/
│   │   ├── app/       # App Router pages & layouts
│   │   ├── components/# Reusable UI components
│   │   ├── context/   # Auth context provider
│   │   ├── lib/       # API client, utilities
│   │   └── types/     # TypeScript type definitions
│   └── middleware.ts   # Route protection
│
├── backend/           # NestJS application
│   ├── src/
│   │   ├── auth/      # JWT auth, guards, strategies
│   │   ├── users/     # User management
│   │   ├── common/    # Shared enums & utilities
│   │   └── seeds/     # Database seeders
│   └── .env           # Environment variables
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB instance)

### 1. Backend Setup

```bash
cd backend
npm install
npm run start:dev
```

The API server will start on `http://localhost:3001/api`.

### 2. Seed Admin User (Optional)

```bash
cd backend
npm run seed
```

This creates an admin account:
- **Email**: admin@docapp.com
- **Password**: Admin123!

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:3000`.

## Environment Variables

### Backend (`backend/.env`)

```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
JWT_EXPIRATION=7d
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT |
| GET | `/api/auth/me` | Get current user (protected) |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/change-password` | Change password (protected) |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get profile (protected) |
| PATCH | `/api/users/profile` | Update profile (protected) |

## User Roles

| Role | Access |
|------|--------|
| **Patient** | Book appointments, view doctors, manage profile |
| **Doctor** | Manage schedule, accept/reject appointments, view patients |
| **Admin** | Full platform control, user management, doctor verification |

## Features (Phase 1)

- ✅ JWT Authentication with role-based access control
- ✅ User registration with Patient/Doctor role selection
- ✅ Dynamic profile avatar (image or initial letter)
- ✅ Light/Dark mode toggle
- ✅ Responsive glassmorphism navbar
- ✅ Protected routes with middleware
- ✅ Role-based dashboard with sidebar navigation
- ✅ Premium healthcare-themed UI design

## Phase 2 (Coming Soon)

- 💳 Stripe/Razorpay payment integration
- 📹 Video call module (WebRTC)
- 📧 Automated email notifications
- 🔍 Advanced doctor search & filtering
- 📊 Analytics dashboard

---

Made with ❤️ for better healthcare
