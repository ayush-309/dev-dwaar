import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/admin/stats - Get system statistics (SUPERUSER only)
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "SUPERUSER") {
            return NextResponse.json(
                { error: "Unauthorized. Superuser access required." },
                { status: 403 }
            );
        }

        // Get counts
        const [
            totalUsers,
            totalTemples,
            totalBookings,
            pendingApprovals,
            activeTemples,
            verifiedBookings,
            recentBookings,
            recentUsers,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.temple.count(),
            prisma.booking.count(),
            prisma.user.count({
                where: {
                    role: "TEMPLE_BOARD",
                    isApproved: false,
                },
            }),
            prisma.temple.count({
                where: { isActive: true },
            }),
            prisma.booking.count({
                where: { status: "VERIFIED" },
            }),
            prisma.booking.findMany({
                take: 10,
                orderBy: { createdAt: "desc" },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                    temple: {
                        select: {
                            name: true,
                        },
                    },
                },
            }),
            prisma.user.findMany({
                take: 10,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isApproved: true,
                    createdAt: true,
                },
            }),
        ]);

        // Get revenue (if applicable)
        const revenue = await prisma.booking.aggregate({
            _sum: {
                totalAmount: true,
            },
            where: {
                status: {
                    in: ["CONFIRMED", "VERIFIED"],
                },
            },
        });

        // Get bookings by status
        const bookingsByStatus = await prisma.booking.groupBy({
            by: ["status"],
            _count: {
                status: true,
            },
        });

        // Get users by role
        const usersByRole = await prisma.user.groupBy({
            by: ["role"],
            _count: {
                role: true,
            },
        });

        return NextResponse.json({
            stats: {
                totalUsers,
                totalTemples,
                totalBookings,
                pendingApprovals,
                activeTemples,
                verifiedBookings,
                totalRevenue: revenue._sum.totalAmount || 0,
            },
            bookingsByStatus: bookingsByStatus.map(item => ({
                status: item.status,
                count: item._count.status,
            })),
            usersByRole: usersByRole.map(item => ({
                role: item.role,
                count: item._count.role,
            })),
            recentBookings,
            recentUsers,
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch statistics" },
            { status: 500 }
        );
    }
}
