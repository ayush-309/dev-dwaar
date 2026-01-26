"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, Building2, Edit, Trash2, Users, Calendar } from "lucide-react";

interface Temple {
    id: string;
    name: string;
    location: string;
    city: string;
    state: string;
    dailyTicketLimit: number;
    ticketPrice: number;
    isActive: boolean;
    _count: {
        bookings: number;
    };
}

export default function TemplesManagementPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [temples, setTemples] = useState<Temple[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        if (status === "authenticated") {
            if (session?.user?.role !== "TEMPLE_BOARD") {
                router.push("/unauthorized");
                return;
            }

            if (!session?.user?.isApproved) {
                router.push("/pending-approval");
                return;
            }

            fetchTemples();
        }
    }, [status, session, router]);

    const fetchTemples = async () => {
        try {
            const res = await fetch(`/api/temples?ownerId=${session?.user?.id}`);
            if (res.ok) {
                const data = await res.json();
                setTemples(data.temples || []);
            }
        } catch (error) {
            console.error("Error fetching temples:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (templeId: string) => {
        if (!confirm("Are you sure you want to delete this temple?")) {
            return;
        }

        try {
            const res = await fetch(`/api/temples/${templeId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                fetchTemples();
            } else {
                const error = await res.json();
                alert(error.error || "Failed to delete temple");
            }
        } catch (error) {
            console.error("Error deleting temple:", error);
            alert("Failed to delete temple");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading temples...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            My Temples
                        </h1>
                        <p className="text-gray-600">
                            Manage your temples and view bookings
                        </p>
                    </div>
                    <button
                        onClick={() => router.push("/dashboard/temples/create")}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Temple
                    </button>
                </div>

                {temples.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {temples.map((temple) => (
                            <div
                                key={temple.id}
                                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                                {temple.name}
                                            </h2>
                                            <p className="text-gray-600 text-sm">
                                                {temple.location}, {temple.city}, {temple.state}
                                            </p>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${temple.isActive
                                                    ? "bg-green-100 text-green-800 border border-green-200"
                                                    : "bg-gray-100 text-gray-800 border border-gray-200"
                                                }`}
                                        >
                                            {temple.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="bg-blue-50 rounded-lg p-3">
                                            <p className="text-xs text-gray-600 mb-1">Daily Limit</p>
                                            <p className="text-xl font-bold text-blue-600">
                                                {temple.dailyTicketLimit}
                                            </p>
                                        </div>

                                        <div className="bg-green-50 rounded-lg p-3">
                                            <p className="text-xs text-gray-600 mb-1">Ticket Price</p>
                                            <p className="text-xl font-bold text-green-600">
                                                ₹{temple.ticketPrice}
                                            </p>
                                        </div>

                                        <div className="bg-purple-50 rounded-lg p-3 col-span-2">
                                            <p className="text-xs text-gray-600 mb-1">Total Bookings</p>
                                            <p className="text-xl font-bold text-purple-600">
                                                {temple._count.bookings}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() =>
                                                router.push(`/dashboard/temples/${temple.id}/edit`)
                                            }
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() =>
                                                router.push(`/dashboard/temples/${temple.id}/bookings`)
                                            }
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                        >
                                            <Calendar className="w-4 h-4" />
                                            Bookings
                                        </button>
                                        <button
                                            onClick={() => handleDelete(temple.id)}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="text-6xl mb-4">🛕</div>
                        <h2 className="text-2xl font-bold text-gray-700 mb-2">
                            No temples yet
                        </h2>
                        <p className="text-gray-500 mb-6">
                            Create your first temple to start accepting bookings
                        </p>
                        <button
                            onClick={() => router.push("/dashboard/temples/create")}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Add New Temple
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
