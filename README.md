# Temple Booking System

A web application for managing and booking temple visits. The system supports three distinct user roles — visitors, temple board managers, and a superuser — each with dedicated workflows and access controls.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** MongoDB via Prisma ORM
- **Authentication:** NextAuth.js (credentials-based)
- **Styling:** Tailwind CSS

---

## Roles

| Role | Description |
|---|---|
| `USER` | Visitors who explore temples and make bookings |
| `TEMPLE_BOARD` | Temple managers who register temples and verify bookings |
| `SUPERUSER` | Platform administrator with full access |

Temple board accounts require explicit approval from the superuser before access is granted.

---

## Features

### Authentication
- Credential-based registration and login
- Role selection at registration (Visitor or Temple Board)
- Session management via NextAuth.js
- Pending approval state for temple board accounts

### Visitor (USER)
- Browse and explore all active temples
- Filter temples by city or state
- View temple details including timings, ticket price, images, and address
- Book a temple visit by selecting a date, time slot, and ticket count (1–10 per booking)
- Real-time slot availability displayed during booking
- View full booking history with status tracking
- View QR code for each confirmed booking

### Temple Board (TEMPLE_BOARD)
- Create and manage temple listings with full details (name, description, location, images, timings, pricing)
- Define time slots with configurable capacity per slot
- Set daily ticket limits
- Edit existing temple information
- View all bookings across managed temples
- Filter and search bookings by status, booking number, or visitor name
- Scan visitor QR codes at entry to verify and check in bookings

### Admin (SUPERUSER)
- View platform-wide statistics: total users, temples, bookings, revenue, and pending approvals
- Approve or reject temple board account registrations
- View all users and their roles
- View all recent bookings across the platform

---

## Booking Lifecycle

Bookings move through the following statuses:

```
PENDING -> CONFIRMED -> VERIFIED
                     -> CANCELLED
                     -> EXPIRED
```

- **PENDING:** Booking created, awaiting confirmation
- **CONFIRMED:** Booking confirmed with QR code issued
- **VERIFIED:** Visitor checked in at temple via QR scan
- **CANCELLED:** Booking cancelled
- **EXPIRED:** Booking date passed without verification

---

## QR Code Security

Each confirmed booking generates an encrypted QR code containing the booking ID, booking number, temple ID, visit date, and an HMAC-SHA256 signature. The payload is encrypted using AES-256-GCM before encoding. Temple board members scan these codes using the built-in QR scanner to verify entry. Tampered or invalid codes are rejected at the point of verification.

---

## Data Models

- **User** — credentials, role, and approval status
- **Temple** — name, description, location, images, pricing, and daily ticket limit
- **TimeSlot** — bookable time windows per temple with per-slot capacity
- **Booking** — visit record with status, ticket count, amount, and QR code reference
