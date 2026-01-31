"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Users,
    Building2,
    Ticket,
    DollarSign,
    CheckCircle,
    Clock,
    TrendingUp,
    AlertCircle
} from "lucide-react";

interface Stats {
    totalUsers: number;
    totalTemples: number;
    totalBookings: number;
    pendingApprovals: number;
    activeTemples: number;
    verifiedBookings: number;
    totalRevenue: number;
}

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    isApproved: boolean;
    createdAt: string;
}

interface Booking {
    id: string;
    bookingNumber: string;
    user: {
        name: string;
        email: string;
    };
    temple: {
        name: string;
    };
    visitDate: string;
    status: string;
    totalAmount: number;
}

export default function SuperuserDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState<Stats | null>(null);
    const [pendingUsers, setPendingUsers] = useState<User[]>([]);
    const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        if (status === "authenticated" && session?.user?.role !== "SUPERUSER") {
            router.push("/unauthorized");
            return;
        }

        if (status === "authenticated") {
            fetchData();
        }
    }, [status, session, router]);

    const fetchData = async () => {
        try {
            const [statsRes, usersRes] = await Promise.all([
                fetch("/api/admin/stats"),
                fetch("/api/admin/users?role=TEMPLE_BOARD&isApproved=false"),
            ]);

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData.stats);
                setRecentBookings(statsData.recentBookings || []);
            }

            if (usersRes.ok) {
                const usersData = await usersRes.json();
                setPendingUsers(usersData.users || []);
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (userId: string, isApproved: boolean) => {
        try {
            const res = await fetch("/api/admin/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, isApproved }),
            });

            if (res.ok) {
                // Refresh data
                fetchData();
            } else {
                const error = await res.json();
                alert(error.error || "Failed to process approval");
            }
        } catch (error) {
            console.error("Error approving user:", error);
            alert("Failed to process approval");
        }
    };

    if (loading || status === "loading") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Superuser Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Welcome back, {session?.user?.name}! Here's your system overview.
                    </p>
                </div>

                {/* Stats Grid */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            icon={<Users className="w-6 h-6" />}
                            label="Total Users"
                            value={stats.totalUsers}
                            color="orange"
                        />
                        <StatCard
                            icon={<Building2 className="w-6 h-6" />}
                            label="Active Temples"
                            value={`${stats.activeTemples} / ${stats.totalTemples}`}
                            color="green"
                        />
                        <StatCard
                            icon={<Ticket className="w-6 h-6" />}
                            label="Total Bookings"
                            value={stats.totalBookings}
                            subValue={`${stats.verifiedBookings} verified`}
                            color="amber"
                        />
                        <StatCard
                            icon={<DollarSign className="w-6 h-6" />}
                            label="Total Revenue"
                            value={`₹${stats.totalRevenue.toLocaleString()}`}
                            color="orange"
                        />
                    </div>
                )}

                {/* Pending Approvals */}
                {pendingUsers.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-yellow-200">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="w-6 h-6 text-yellow-600" />
                            <h2 className="text-2xl font-bold text-gray-900">
                                Pending Temple Board Approvals ({pendingUsers.length})
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {pendingUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200"
                                >
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                                        <p className="text-sm text-gray-600">{user.email}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Registered: {new Date(user.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleApproval(user.id, true)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleApproval(user.id, false)}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Bookings */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-orange-600" />
                        Recent Bookings
                    </h2>

                    {recentBookings.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Booking #
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Temple
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Visit Date
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {recentBookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {booking.bookingNumber}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {booking.user.name}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {booking.temple.name}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {new Date(booking.visitDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                                ₹{booking.totalAmount}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No recent bookings</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, subValue, color }: { 
    icon: React.ReactNode; 
    label: string; 
    value: string | number; 
    subValue?: string; 
    color: "blue" | "green" | "purple" | "orange";
}) {
    const colorClasses = {
        orange: "bg-orange-500",
        green: "bg-green-500",
        amber: "bg-amber-500",
        orange: "bg-orange-500",
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${colorClasses[color]} text-white`}>
                    {icon}
                </div>
                <div>
                    <p className="text-sm text-gray-600 font-medium">{label}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
                </div>
            </div>
        </div>
    );
}

function getStatusColor(status: string) {
    switch (status) {
        case "VERIFIED":
            return "bg-green-100 text-green-800";
        case "CONFIRMED":
            return "bg-orange-100 text-orange-800";
        case "PENDING":
            return "bg-yellow-100 text-yellow-800";
        case "CANCELLED":
            return "bg-red-100 text-red-800";
        case "EXPIRED":
            return "bg-gray-100 text-gray-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
}
