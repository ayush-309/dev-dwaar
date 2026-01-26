import { Role, BookingStatus } from "@prisma/client";

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      isApproved: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
    isApproved: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    role: Role;
    isApproved: boolean;
  }
}

// QR Code Data structure
export interface QRCodeData {
  bookingId: string;
  bookingNumber: string;
  userName: string;
  userPhone: string;
  templeName: string;
  templeId: string;
  visitDate: string;
  timeSlot: string;
  ticketCount: number;
  signature: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Temple with owner info
export interface TempleWithOwner {
  id: string;
  name: string;
  description: string;
  location: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  images: string[];
  timings: string;
  dailyTicketLimit: number;
  ticketPrice: number;
  isActive: boolean;
  createdAt: Date;
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

// Booking with relations
export interface BookingWithRelations {
  id: string;
  bookingNumber: string;
  visitDate: Date;
  ticketCount: number;
  totalAmount: number;
  status: BookingStatus;
  qrCodeUrl?: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  temple: {
    id: string;
    name: string;
    location: string;
  };
  timeSlot: {
    id: string;
    startTime: string;
    endTime: string;
  };
  verifiedBy?: {
    id: string;
    name: string;
  } | null;
  verifiedAt?: Date | null;
}

// Dashboard stats
export interface DashboardStats {
  totalUsers: number;
  totalTemples: number;
  totalBookings: number;
  pendingApprovals: number;
  todayBookings: number;
  revenue: number;
}

// Time slot availability
export interface TimeSlotAvailability {
  id: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  available: number;
}
