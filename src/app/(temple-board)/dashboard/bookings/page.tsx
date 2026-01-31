"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, User, Search, Filter, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface Booking {
    id: string;
    bookingNumber: string;
    visitDate: string;
    ticketCount: number;
    totalAmount: number;
    status: string;
    createdAt: string;
    user: {
        name: string;
        email: string;
    };
    temple: {
        id: string;
        name: string;
        location: string;
    };
    timeSlot: {
        startTime: string;
        endTime: string;
    };
}

export default function BookingsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

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

            fetchBookings();
        }
    }, [status, session, router]);

    useEffect(() => {
        filterBookings();
    }, [searchTerm, statusFilter, bookings]);

    const fetchBookings = async () => {
        try {
            const res = await fetch("/api/bookings?role=temple_board");
            if (res.ok) {
                const data = await res.json();
                setBookings(data.bookings || []);
                setFilteredBookings(data.bookings || []);
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    const filterBookings = () => {
        let result = bookings;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (b) =>
                    b.bookingNumber.toLowerCase().includes(term) ||
                    b.user.name.toLowerCase().includes(term) ||
                    b.user.email.toLowerCase().includes(term) ||
                    b.temple.name.toLowerCase().includes(term)
            );
        }

        if (statusFilter !== "ALL") {
            result = result.filter((b) => b.status === statusFilter);
        }

        setFilteredBookings(result);
    };

    const formatTime = (time24: string) => {
        const [hours, minutes] = time24.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "CONFIRMED":
                return "bg-green-100 text-green-800 border-green-200";
            case "VERIFIED":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "PENDING":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "CANCELLED":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "CONFIRMED":
            case "VERIFIED":
                return <CheckCircle className="w-4 h-4" />;
            case "CANCELLED":
                return <XCircle className="w-4 h-4" />;
            default:
                return <AlertCircle className="w-4 h-4" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading bookings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Bookings</h1>
                <p className="text-gray-600 dark:text-zinc-400 mt-1">
                    Manage bookings across all your temples
                </p>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by booking number, user, or temple..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    >
                        <option value="ALL">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="VERIFIED">Verified</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-800">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{bookings.length}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-800">
                    <p className="text-sm text-gray-500">Confirmed</p>
                    <p className="text-2xl font-bold text-green-600">{bookings.filter(b => b.status === "CONFIRMED").length}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-800">
                    <p className="text-sm text-gray-500">Verified</p>
                    <p className="text-2xl font-bold text-blue-600">{bookings.filter(b => b.status === "VERIFIED").length}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-800">
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{bookings.filter(b => b.status === "PENDING").length}</p>
                </div>
            </div>

            {/* Bookings List */}
            {filteredBookings.length > 0 ? (
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-zinc-800">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Booking</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Temple</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {filteredBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-900 dark:text-white">{booking.bookingNumber}</p>
                                            <p className="text-xs text-gray-500">{booking.ticketCount} ticket(s)</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-gray-900 dark:text-white">{booking.user.name}</p>
                                            <p className="text-xs text-gray-500">{booking.user.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-gray-900 dark:text-white">{booking.temple.name}</p>
                                            <p className="text-xs text-gray-500">{booking.temple.location}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-gray-900 dark:text-white">
                                                {new Date(booking.visitDate).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {booking.timeSlot ? `${formatTime(booking.timeSlot.startTime)} - ${formatTime(booking.timeSlot.endTime)}` : 'N/A'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-900 dark:text-white">₹{booking.totalAmount}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(booking.status)}`}>
                                                {getStatusIcon(booking.status)}
                                                {booking.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-12 text-center">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-700 dark:text-zinc-300 mb-2">
                        No Bookings Found
                    </h2>
                    <p className="text-gray-500 dark:text-zinc-500">
                        {searchTerm || statusFilter !== "ALL"
                            ? "Try adjusting your search or filter criteria"
                            : "Bookings will appear here when users make reservations"}
                    </p>
                </div>
            )}
        </div>
    );
}
