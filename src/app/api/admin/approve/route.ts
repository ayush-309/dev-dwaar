import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// POST /api/admin/approve - Approve or reject temple board applications
const approveSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    isApproved: z.boolean(),
});

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "SUPERUSER") {
            return NextResponse.json(
                { error: "Unauthorized. Superuser access required." },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { userId, isApproved } = approveSchema.parse(body);

        // Find the user
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        if (user.role !== "TEMPLE_BOARD") {
            return NextResponse.json(
                { error: "Only temple board members require approval" },
                { status: 400 }
            );
        }

        // Update approval status
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { isApproved },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isApproved: true,
                createdAt: true,
            },
        });

        return NextResponse.json({
            message: `User ${isApproved ? "approved" : "rejected"} successfully`,
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error approving user:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.issues },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to approve user" },
            { status: 500 }
        );
    }
}
