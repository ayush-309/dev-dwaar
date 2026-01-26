import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateQRCode } from "@/lib/qr";
import { z } from "zod";

// GET /api/bookings - List bookings (user's own or temple owner's)
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const templeId = searchParams.get("templeId");
        const status = searchParams.get("status");

        let where: any = {};

        // Regular users see only their bookings
        if (session.user.role === "USER") {
            where.userId = session.user.id;
        }

        // Temple board members can filter by their temples
        if (session.user.role === "TEMPLE_BOARD" && templeId) {
            const temple = await prisma.temple.findFirst({
                where: {
                    id: templeId,
                    ownerId: session.user.id,
                },
            });

            if (!temple) {
                return NextResponse.json(
                    { error: "Temple not found or unauthorized" },
                    { status: 403 }
                );
            }

            where.templeId = templeId;
        }

        // Superuser can see all bookings
        if (session.user.role === "SUPERUSER") {
            // No additional filtering needed
        }

        if (status) {
            where.status = status;
        }

        const bookings = await prisma.booking.findMany({
            where,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                temple: {
                    select: {
                        name: true,
                        location: true,
                        city: true,
                    },
                },
                timeSlot: true,
                verifiedBy: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({ bookings });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return NextResponse.json(
            { error: "Failed to fetch bookings" },
            { status: 500 }
        );
    }
}

// POST /api/bookings - Create a new booking
const createBookingSchema = z.object({
    templeId: z.string().min(1, "Temple ID is required"),
    timeSlotId: z.string().min(1, "Time slot is required"),
    visitDate: z.string().datetime("Invalid date format"),
    ticketCount: z.number().int().min(1, "At least 1 ticket required").max(10, "Maximum 10 tickets per booking"),
});

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "USER") {
            return NextResponse.json(
                { error: "Only users can create bookings" },
                { status: 403 }
            );
        }

        const body = await req.json();
        const validatedData = createBookingSchema.parse(body);

        // Fetch temple and time slot
        const temple = await prisma.temple.findUnique({
            where: { id: validatedData.templeId },
            include: { owner: true },
        });

        if (!temple || !temple.isActive) {
            return NextResponse.json(
                { error: "Temple not found or inactive" },
                { status: 404 }
            );
        }

        const timeSlot = await prisma.timeSlot.findUnique({
            where: { id: validatedData.timeSlotId },
        });

        if (!timeSlot || !timeSlot.isActive) {
            return NextResponse.json(
                { error: "Time slot not found or inactive" },
                { status: 404 }
            );
        }

        // Check daily limit
        const visitDate = new Date(validatedData.visitDate);
        const startOfDay = new Date(visitDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(visitDate);
        endOfDay.setHours(23, 59, 59, 999);

        const existingBookingsCount = await prisma.booking.aggregate({
            where: {
                templeId: validatedData.templeId,
                visitDate: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                status: {
                    in: ["PENDING", "CONFIRMED", "VERIFIED"],
                },
            },
            _sum: {
                ticketCount: true,
            },
        });

        const currentBookings = existingBookingsCount._sum.ticketCount || 0;

        if (currentBookings + validatedData.ticketCount > temple.dailyTicketLimit) {
            return NextResponse.json(
                {
                    error: "Daily ticket limit reached",
                    available: temple.dailyTicketLimit - currentBookings,
                    limit: temple.dailyTicketLimit
                },
                { status: 400 }
            );
        }

        // Check time slot capacity
        const slotBookingsCount = await prisma.booking.aggregate({
            where: {
                timeSlotId: validatedData.timeSlotId,
                visitDate: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                status: {
                    in: ["PENDING", "CONFIRMED", "VERIFIED"],
                },
            },
            _sum: {
                ticketCount: true,
            },
        });

        const currentSlotBookings = slotBookingsCount._sum.ticketCount || 0;

        if (currentSlotBookings + validatedData.ticketCount > timeSlot.capacity) {
            return NextResponse.json(
                {
                    error: "Time slot capacity reached",
                    available: timeSlot.capacity - currentSlotBookings,
                    capacity: timeSlot.capacity
                },
                { status: 400 }
            );
        }

        // Generate booking number
        const bookingNumber = `TKT${Date.now()}${Math.floor(Math.random() * 1000)}`;

        // Calculate total amount
        const totalAmount = temple.ticketPrice * validatedData.ticketCount;

        // Get user details
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Generate QR code data
        const qrData = {
            bookingNumber,
            userName: user.name,
            userPhone: user.phone || "N/A",
            templeName: temple.name,
            visitDate: visitDate.toISOString(),
            timeSlot: `${timeSlot.startTime} - ${timeSlot.endTime}`,
            ticketCount: validatedData.ticketCount,
            totalAmount,
        };

        const { qrCodeDataUrl, encryptedData } = await generateQRCode(qrData);

        // Create booking
        const booking = await prisma.booking.create({
            data: {
                bookingNumber,
                userId: session.user.id,
                templeId: validatedData.templeId,
                timeSlotId: validatedData.timeSlotId,
                visitDate,
                ticketCount: validatedData.ticketCount,
                totalAmount,
                status: "CONFIRMED",
                qrCodeData: encryptedData,
                qrCodeUrl: qrCodeDataUrl,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                temple: {
                    select: {
                        name: true,
                        location: true,
                        city: true,
                    },
                },
                timeSlot: true,
            },
        });

        return NextResponse.json({ booking }, { status: 201 });
    } catch (error) {
        console.error("Error creating booking:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.issues },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create booking" },
            { status: 500 }
        );
    }
}
