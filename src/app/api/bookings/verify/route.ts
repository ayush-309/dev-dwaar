import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { verifyQRCode } from "@/lib/qr";
import { z } from "zod";

// POST /api/bookings/verify - Verify QR code (TEMPLE_BOARD only)
const verifySchema = z.object({
    qrCodeData: z.string().min(1, "QR code data is required"),
});

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "TEMPLE_BOARD") {
            return NextResponse.json(
                { error: "Only temple board members can verify bookings" },
                { status: 403 }
            );
        }

        if (!session.user.isApproved) {
            return NextResponse.json(
                { error: "Your account is pending approval" },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { qrCodeData } = verifySchema.parse(body);

        // Decrypt and verify QR code
        const qrPayload = verifyQRCode(qrCodeData);

        if (!qrPayload) {
            return NextResponse.json(
                { error: "Invalid or tampered QR code" },
                { status: 400 }
            );
        }

        // Find booking by booking number
        const booking = await prisma.booking.findUnique({
            where: { bookingNumber: qrPayload.bookingNumber },
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
                        id: true,
                        name: true,
                        location: true,
                        ownerId: true,
                    },
                },
                timeSlot: true,
            },
        });

        if (!booking) {
            return NextResponse.json(
                { error: "Booking not found" },
                { status: 404 }
            );
        }

        // Verify that the temple board member owns this temple
        if (booking.temple.ownerId !== session.user.id) {
            return NextResponse.json(
                { error: "You can only verify bookings for your own temples" },
                { status: 403 }
            );
        }

        // Check if already verified
        if (booking.status === "VERIFIED") {
            return NextResponse.json(
                {
                    message: "Booking already verified",
                    booking,
                    verifiedAt: booking.verifiedAt,
                },
                { status: 200 }
            );
        }

        // Check if booking is cancelled or expired
        if (booking.status === "CANCELLED" || booking.status === "EXPIRED") {
            return NextResponse.json(
                { error: `Booking is ${booking.status.toLowerCase()}` },
                { status: 400 }
            );
        }

        // Update booking status to verified
        const updatedBooking = await prisma.booking.update({
            where: { id: booking.id },
            data: {
                status: "VERIFIED",
                verifiedAt: new Date(),
                verifiedById: session.user.id,
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
                    },
                },
                timeSlot: true,
                verifiedBy: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        return NextResponse.json({
            message: "Booking verified successfully",
            booking: updatedBooking,
        });
    } catch (error) {
        console.error("Error verifying booking:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.issues },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to verify booking" },
            { status: 500 }
        );
    }
}
