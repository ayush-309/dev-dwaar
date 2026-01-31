"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, MapPin, Clock, IndianRupee, FileText, Plus, Trash2 } from "lucide-react";

interface TimeSlot {
    startTime: string;
    endTime: string;
}

export default function CreateTemplePage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        location: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        timings: "",
        dailyTicketLimit: 100,
        ticketPrice: 0,
    });

    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
        { startTime: "06:00", endTime: "12:00" },
        { startTime: "16:00", endTime: "21:00" }
    ]);

    // Generate timings string from time slots
    useEffect(() => {
        const timingsString = timeSlots
            .map(slot => `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`)
            .join(', ');
        setFormData(prev => ({ ...prev, timings: timingsString }));
    }, [timeSlots]);

    const formatTime = (time24: string) => {
        const [hours, minutes] = time24.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    const addTimeSlot = () => {
        setTimeSlots([...timeSlots, { startTime: "09:00", endTime: "17:00" }]);
    };

    const removeTimeSlot = (index: number) => {
        if (timeSlots.length > 1) {
            setTimeSlots(timeSlots.filter((_, i) => i !== index));
        }
    };

    const updateTimeSlot = (index: number, field: 'startTime' | 'endTime', value: string) => {
        const newTimeSlots = [...timeSlots];
        newTimeSlots[index][field] = value;
        setTimeSlots(newTimeSlots);
    };

    const validateTimeSlots = () => {
        for (const slot of timeSlots) {
            if (slot.startTime >= slot.endTime) {
                setError("Opening time must be before closing time for all time slots");
                return false;
            }
        }
        return true;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "dailyTicketLimit" || name === "ticketPrice"
                ? parseFloat(value) || 0
                : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validate time slots
        if (!validateTimeSlots()) {
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch("/api/temples", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    timeSlots: timeSlots,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                router.push("/dashboard/temples");
            } else {
                setError(data.error || "Failed to create temple");
            }
        } catch (error) {
            console.error("Error creating temple:", error);
            setError("Failed to create temple");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to temples
                </button>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <Building2 className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Add New Temple
                            </h1>
                            <p className="text-gray-600">Fill in the details below</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Temple Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Temple Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="Enter temple name"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Description *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="Describe the temple, its history, and significance"
                            />
                        </div>

                        {/* Location Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Location *
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="e.g., Old City"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    City *
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="Enter city"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    State *
                                </label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="Enter state"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Pincode *
                                </label>
                                <input
                                    type="text"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                    required
                                    pattern="[0-9]{6}"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="6-digit pincode"
                                />
                            </div>
                        </div>

                        {/* Full Address */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Full Address *
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                rows={2}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="Street address, landmarks, etc."
                            />
                        </div>

                        {/* Time Slots */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Temple Timings *
                            </label>
                            <div className="space-y-4">
                                {timeSlots.map((slot, index) => (
                                    <div key={index} className="flex items-center gap-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                        <div className="flex-1 grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                                    Opening Time
                                                </label>
                                                <input
                                                    type="time"
                                                    value={slot.startTime}
                                                    onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                                    Closing Time
                                                </label>
                                                <input
                                                    type="time"
                                                    value={slot.endTime}
                                                    onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-600 min-w-[120px]">
                                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeTimeSlot(index)}
                                            disabled={timeSlots.length === 1}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Remove time slot"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addTimeSlot}
                                    className="flex items-center gap-2 px-4 py-2 text-orange-600 border border-orange-300 rounded-lg hover:bg-orange-50 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Time Slot
                                </button>
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm font-medium text-gray-700 mb-1">Preview:</p>
                                    <p className="text-sm text-gray-600">{formData.timings || "No time slots defined"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Booking Settings */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Daily Ticket Limit *
                                </label>
                                <input
                                    type="number"
                                    name="dailyTicketLimit"
                                    value={formData.dailyTicketLimit}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="Maximum tickets per day"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <IndianRupee className="w-4 h-4" />
                                    Ticket Price *
                                </label>
                                <input
                                    type="number"
                                    name="ticketPrice"
                                    value={formData.ticketPrice}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="Price per ticket (₹)"
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* Submit Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 text-white py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? "Creating..." : "Create Temple"}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
