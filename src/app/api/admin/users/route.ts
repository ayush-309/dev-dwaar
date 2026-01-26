import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/admin/users - List all users (SUPERUSER only)
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "SUPERUSER") {
            return NextResponse.json(
                { error: "Unauthorized. Superuser access required." },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(req.url);
        const role = searchParams.get("role");
        const isApproved = searchParams.get("isApproved");

        const where: any = {};

        if (role) {
            where.role = role;
        }

        if (isApproved !== null && isApproved !== undefined) {
            where.isApproved = isApproved === "true";
        }

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                isApproved: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        temples: true,
                        bookings: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}
