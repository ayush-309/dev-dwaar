"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { MapPin, Clock, IndianRupee, Calendar, Users, ArrowLeft, CheckCircle } from "lucide-react";
import Image from "next/image";

interface Temple {
    id: string;
    name: string;
    description: string;
    location: string;
    city: string;
    state: string;
    address: string;
    timings: string;
    dailyTicketLimit: number;
    ticketPrice: number;
    images: string[];
    timeSlots: TimeSlot[];
}

interface TimeSlot {
    id: string;
    startTime: string;
    endTime: string;
    capacity: number;
    isActive: boolean;
}

export default function BookingPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const templeId = params.id as string;

    const [temple, setTemple] = useState<Temple | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [visitDate, setVisitDate] = useState("");
    const [selectedSlot, setSelectedSlot] = useState("");
    const [ticketCount, setTicketCount] = useState(1);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        if (status === "authenticated") {
            fetchTempleDetails();
        }
    }, [status, templeId]);

    const fetchTempleDetails = async () => {
        try {
            const res = await fetch(`/api/temples/${templeId}`);
            if (res.ok) {
                const data = await res.json();
                setTemple(data.temple);
            } else {
                setError("Temple not found");
            }
        } catch (error) {
            console.error("Error fetching temple:", error);
            setError("Failed to load temple details");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        if (!visitDate || !selectedSlot) {
            setError("Please select a date and time slot");
            setSubmitting(false);
            return;
        }

        try {
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    templeId,
                    timeSlotId: selectedSlot,
                    visitDate: new Date(visitDate).toISOString(),
                    ticketCount,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    router.push("/my-bookings");
                }, 2000);
            } else {
                setError(data.error || "Failed to create booking");
            }
        } catch (error) {
            console.error("Error creating booking:", error);
            setError("Failed to create booking");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading temple details...</p>
                </div>
            </div>
        );
    }

    if (!temple) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Temple not found</h1>
                    <button
                        onClick={() => router.push("/explore")}
                        className="text-orange-600 hover:text-orange-700"
                    >
                        Return to explore
                    </button>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Booking Confirmed!
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Your temple visit has been successfully booked. Redirecting to your bookings...
                    </p>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                </div>
            </div>
        );
    }

    // Get minimum date (today)
    const today = new Date().toISOString().split("T")[0];

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to temples
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Temple Details */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="relative h-64 bg-gradient-to-r from-orange-400 to-red-400">
                            {temple.images.length > 0 ? (
                                <Image
                                    src={temple.images[0]}
                                    alt={temple.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-white text-8xl">
                                    🛕
                                </div>
                            )}
                        </div>

                        <div className="p-6">
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                {temple.name}
                            </h1>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-start gap-3 text-gray-600">
                                    <MapPin className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium">{temple.location}</p>
                                        <p className="text-sm">{temple.address}</p>
                                        <p className="text-sm">{temple.city}, {temple.state}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-gray-600">
                                    <Clock className="w-5 h-5 text-orange-600" />
                                    <span>{temple.timings}</span>
                                </div>

                                <div className="flex items-center gap-3 text-gray-900 font-semibold text-lg">
                                    <IndianRupee className="w-5 h-5 text-orange-600" />
                                    <span>₹{temple.ticketPrice} per person</span>
                                </div>
                            </div>

                            <p className="text-gray-600">{temple.description}</p>
                        </div>
                    </div>

                    {/* Booking Form */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Book Your Visit
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Visit Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-orange-600" />
                                    Visit Date
                                </label>
                                <input
                                    type="date"
                                    min={today}
                                    value={visitDate}
                                    onChange={(e) => setVisitDate(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>

                            {/* Time Slot */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-orange-600" />
                                    Time Slot
                                </label>
                                <select
                                    value={selectedSlot}
                                    onChange={(e) => setSelectedSlot(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    <option value="">Select a time slot</option>
                                    {temple.timeSlots.filter(slot => slot.isActive).map((slot) => (
                                        <option key={slot.id} value={slot.id}>
                                            {slot.startTime} - {slot.endTime} (Capacity: {slot.capacity})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Ticket Count */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-orange-600" />
                                    Number of Tickets
                                </label>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setTicketCount(prev => Math.max(1, prev - 1))}
                                        disabled={ticketCount <= 1}
                                        className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed text-gray-700 rounded-lg font-bold text-xl transition-colors"
                                    >
                                        -
                                    </button>
                                    <div className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-center font-semibold text-xl bg-white">
                                        {ticketCount}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setTicketCount(prev => Math.min(10, prev + 1))}
                                        disabled={ticketCount >= 10}
                                        className="w-12 h-12 flex items-center justify-center bg-orange-600 hover:bg-orange-700 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-bold text-xl transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Maximum 10 tickets per booking</p>
                            </div>

                            {/* Total Amount */}
                            <div className="bg-orange-50 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-700 font-medium">Total Amount:</span>
                                    <span className="text-2xl font-bold text-orange-600">
                                        ₹{(temple.ticketPrice * ticketCount).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 rounded-lg font-bold text-lg hover:from-orange-700 hover:to-red-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {submitting ? "Processing..." : "Confirm Booking"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
