import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// GET /api/temples/[id] - Get temple by ID
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const temple = await prisma.temple.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                timeSlots: {
                    where: { isActive: true },
                    orderBy: { startTime: "asc" },
                },
                _count: {
                    select: {
                        bookings: true,
                    },
                },
            },
        });

        if (!temple) {
            return NextResponse.json(
                { error: "Temple not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ temple });
    } catch (error) {
        console.error("Error fetching temple:", error);
        return NextResponse.json(
            { error: "Failed to fetch temple" },
            { status: 500 }
        );
    }
}

// PUT /api/temples/[id] - Update temple (owner only)
const updateTempleSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().min(10).optional(),
    location: z.string().min(1).optional(),
    address: z.string().min(1).optional(),
    city: z.string().min(1).optional(),
    state: z.string().min(1).optional(),
    pincode: z.string().regex(/^\d{6}$/).optional(),
    images: z.array(z.string().url()).optional(),
    timings: z.string().min(1).optional(),
    dailyTicketLimit: z.number().int().min(1).optional(),
    ticketPrice: z.number().min(0).optional(),
    isActive: z.boolean().optional(),
});

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "TEMPLE_BOARD") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        // Check if temple exists and user is the owner
        const temple = await prisma.temple.findUnique({
            where: { id },
        });

        if (!temple) {
            return NextResponse.json(
                { error: "Temple not found" },
                { status: 404 }
            );
        }

        if (temple.ownerId !== session.user.id) {
            return NextResponse.json(
                { error: "You can only update your own temples" },
                { status: 403 }
            );
        }

        const body = await req.json();
        const validatedData = updateTempleSchema.parse(body);

        const updatedTemple = await prisma.temple.update({
            where: { id },
            data: validatedData,
            include: {
                owner: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json({ temple: updatedTemple });
    } catch (error) {
        console.error("Error updating temple:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.issues },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to update temple" },
            { status: 500 }
        );
    }
}

// DELETE /api/temples/[id] - Delete temple (owner only)
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "TEMPLE_BOARD") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        const temple = await prisma.temple.findUnique({
            where: { id },
        });

        if (!temple) {
            return NextResponse.json(
                { error: "Temple not found" },
                { status: 404 }
            );
        }

        if (temple.ownerId !== session.user.id) {
            return NextResponse.json(
                { error: "You can only delete your own temples" },
                { status: 403 }
            );
        }

        // Soft delete by setting isActive to false
        await prisma.temple.update({
            where: { id },
            data: { isActive: false },
        });

        return NextResponse.json({ message: "Temple deleted successfully" });
    } catch (error) {
        console.error("Error deleting temple:", error);
        return NextResponse.json(
            { error: "Failed to delete temple" },
            { status: 500 }
        );
    }
}
