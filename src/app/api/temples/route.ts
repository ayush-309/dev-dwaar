import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// GET /api/temples - List all temples (public or filtered by owner)
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const { searchParams } = new URL(req.url);
        const city = searchParams.get("city");
        const state = searchParams.get("state");
        const ownerId = searchParams.get("ownerId");

        const where: any = { isActive: true };

        if (city) where.city = city;
        if (state) where.state = state;

        // If temple board user, filter by their temples
        if (ownerId && session?.user?.role === "TEMPLE_BOARD") {
            where.ownerId = ownerId;
        }

        const temples = await prisma.temple.findMany({
            where,
            include: {
                owner: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                timeSlots: {
                    where: { isActive: true },
                    orderBy: { startTime: 'asc' },
                },
                _count: {
                    select: {
                        bookings: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({ temples });
    } catch (error) {
        console.error("Error fetching temples:", error);
        return NextResponse.json(
            { error: "Failed to fetch temples" },
            { status: 500 }
        );
    }
}

// POST /api/temples - Create a new temple (TEMPLE_BOARD only)
const timeSlotSchema = z.object({
    startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
});

const createTempleSchema = z.object({
    name: z.string().min(1, "Temple name is required"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    location: z.string().min(1, "Location is required"),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    pincode: z.string().regex(/^\d{6}$/, "Invalid pincode"),
    images: z.array(z.string().url()).optional(),
    timings: z.string().min(1, "Timings are required"),
    timeSlots: z.array(timeSlotSchema).min(1, "At least one time slot is required"),
    dailyTicketLimit: z.number().int().min(1, "Daily ticket limit must be at least 1"),
    ticketPrice: z.number().min(0, "Ticket price cannot be negative"),
});

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "TEMPLE_BOARD") {
            return NextResponse.json(
                { error: "Unauthorized. Only temple board members can create temples." },
                { status: 403 }
            );
        }

        if (!session.user.isApproved) {
            return NextResponse.json(
                { error: "Your account is pending approval from superuser." },
                { status: 403 }
            );
        }

        const body = await req.json();
        const validatedData = createTempleSchema.parse(body);

        // Validate time slots logic
        for (const slot of validatedData.timeSlots) {
            if (slot.startTime >= slot.endTime) {
                return NextResponse.json(
                    { error: "Opening time must be before closing time for all time slots" },
                    { status: 400 }
                );
            }
        }

        // Create temple and time slots in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create the temple
            const temple = await tx.temple.create({
                data: {
                    name: validatedData.name,
                    description: validatedData.description,
                    location: validatedData.location,
                    address: validatedData.address,
                    city: validatedData.city,
                    state: validatedData.state,
                    pincode: validatedData.pincode,
                    images: validatedData.images || [],
                    timings: validatedData.timings,
                    dailyTicketLimit: validatedData.dailyTicketLimit,
                    ticketPrice: validatedData.ticketPrice,
                    ownerId: session.user.id,
                },
            });

            // Create the time slots
            const timeSlots = await tx.timeSlot.createMany({
                data: validatedData.timeSlots.map(slot => ({
                    templeId: temple.id,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    capacity: Math.ceil(validatedData.dailyTicketLimit / validatedData.timeSlots.length),
                })),
            });

            return { temple, timeSlots };
        });

        // Fetch the complete temple with time slots and owner info
        const completeTemple = await prisma.temple.findUnique({
            where: { id: result.temple.id },
            include: {
                owner: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                timeSlots: {
                    where: { isActive: true },
                    orderBy: { startTime: 'asc' },
                },
            },
        });

        return NextResponse.json({ temple: completeTemple }, { status: 201 });
    } catch (error) {
        console.error("Error creating temple:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.issues },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create temple" },
            { status: 500 }
        );
    }
}
