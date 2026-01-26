"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Clock, IndianRupee, Download, QrCode } from "lucide-react";
import Image from "next/image";

interface Booking {
    id: string;
    bookingNumber: string;
    temple: {
        name: string;
        location: string;
        city: string;
    };
    user: {
        name: string;
        email: string;
        phone: string;
    };
    timeSlot: {
        startTime: string;
        endTime: string;
    };
    visitDate: string;
    ticketCount: number;
    totalAmount: number;
    status: string;
    qrCodeUrl: string;
    verifiedAt?: string;
    verifiedBy?: {
        name: string;
    };
    createdAt: string;
}

export default function MyBookingsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        if (status === "authenticated") {
            fetchBookings();
        }
    }, [status, router]);

    const fetchBookings = async () => {
        try {
            const res = await fetch("/api/bookings");
            if (res.ok) {
                const data = await res.json();
                setBookings(data.bookings || []);
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    const downloadQR = (booking: Booking) => {
        const link = document.createElement("a");
        link.href = booking.qrCodeUrl;
        link.download = `ticket-${booking.bookingNumber}.png`;
        link.click();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your bookings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">My Bookings</h1>

                {bookings.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        {bookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                            >
                                <div className="md:flex">
                                    {/* Left Section - Booking Details */}
                                    <div className="flex-1 p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                                    {booking.temple.name}
                                                </h2>
                                                <p className="text-sm text-gray-500">
                                                    Booking #{booking.bookingNumber}
                                                </p>
                                            </div>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                                                    booking.status
                                                )}`}
                                            >
                                                {booking.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <MapPin className="w-4 h-4 text-purple-600" />
                                                <span className="text-sm">
                                                    {booking.temple.location}, {booking.temple.city}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Calendar className="w-4 h-4 text-purple-600" />
                                                <span className="text-sm">
                                                    {new Date(booking.visitDate).toLocaleDateString("en-IN", {
                                                        weekday: "short",
                                                        year: "numeric",
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Clock className="w-4 h-4 text-purple-600" />
                                                <span className="text-sm">
                                                    {booking.timeSlot.startTime} - {booking.timeSlot.endTime}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 text-gray-600">
                                                <IndianRupee className="w-4 h-4 text-purple-600" />
                                                <span className="text-sm font-semibold">
                                                    ₹{booking.totalAmount} ({booking.ticketCount} tickets)
                                                </span>
                                            </div>
                                        </div>

                                        {booking.verifiedAt && (
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                                                <p className="text-sm text-green-800">
                                                    ✓ Verified on{" "}
                                                    {new Date(booking.verifiedAt).toLocaleString("en-IN")}
                                                    {booking.verifiedBy && ` by ${booking.verifiedBy.name}`}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setSelectedBooking(booking)}
                                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                            >
                                                <QrCode className="w-4 h-4" />
                                                View QR Code
                                            </button>
                                            <button
                                                onClick={() => downloadQR(booking)}
                                                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                            >
                                                <Download className="w-4 h-4" />
                                                Download
                                            </button>
                                        </div>
                                    </div>

                                    {/* Right Section - QR Code Preview */}
                                    <div className="md:w-64 bg-gradient-to-br from-purple-100 to-pink-100 p-6 flex items-center justify-center">
                                        {booking.qrCodeUrl && (
                                            <div className="bg-white p-3 rounded-lg shadow-lg">
                                                <Image
                                                    src={booking.qrCodeUrl}
                                                    alt="QR Code"
                                                    width={150}
                                                    height={150}
                                                    className="w-full h-auto"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="text-6xl mb-4">📅</div>
                        <h2 className="text-2xl font-bold text-gray-700 mb-2">
                            No bookings yet
                        </h2>
                        <p className="text-gray-500 mb-6">
                            Start exploring temples and make your first booking
                        </p>
                        <button
                            onClick={() => router.push("/explore")}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
                        >
                            Explore Temples
                        </button>
                    </div>
                )}
            </div>

            {/* QR Code Modal */}
            {selectedBooking && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                    onClick={() => setSelectedBooking(null)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                            Your Ticket QR Code
                        </h3>

                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mb-4">
                            <div className="bg-white p-4 rounded-lg inline-block mx-auto">
                                {selectedBooking.qrCodeUrl && (
                                    <Image
                                        src={selectedBooking.qrCodeUrl}
                                        alt="QR Code"
                                        width={300}
                                        height={300}
                                        className="w-full h-auto"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="space-y-2 mb-6">
                            <p className="text-center text-sm text-gray-600">
                                <strong>Temple:</strong> {selectedBooking.temple.name}
                            </p>
                            <p className="text-center text-sm text-gray-600">
                                <strong>Visit Date:</strong>{" "}
                                {new Date(selectedBooking.visitDate).toLocaleDateString()}
                            </p>
                            <p className="text-center text-sm text-gray-600">
                                <strong>Booking #:</strong> {selectedBooking.bookingNumber}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => downloadQR(selectedBooking)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </button>
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function getStatusBadgeColor(status: string) {
    switch (status) {
        case "VERIFIED":
            return "bg-green-100 text-green-800 border border-green-200";
        case "CONFIRMED":
            return "bg-blue-100 text-blue-800 border border-blue-200";
        case "PENDING":
            return "bg-yellow-100 text-yellow-800 border border-yellow-200";
        case "CANCELLED":
            return "bg-red-100 text-red-800 border border-red-200";
        case "EXPIRED":
            return "bg-gray-100 text-gray-800 border border-gray-200";
        default:
            return "bg-gray-100 text-gray-800 border border-gray-200";
    }
}
