"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Building2, MapPin, Clock, IndianRupee, Plus, Trash2, Save } from "lucide-react";

interface TimeSlot {
    id?: string;
    startTime: string;
    endTime: string;
    capacity: number;
    isActive?: boolean;
}

interface Temple {
    id: string;
    name: string;
    description: string;
    location: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    timings: string;
    dailyTicketLimit: number;
    ticketPrice: number;
    isActive: boolean;
    timeSlots: TimeSlot[];
}

export default function EditTemplePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const templeId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

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
        isActive: true,
    });

    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

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

            fetchTemple();
        }
    }, [status, session, router, templeId]);

    // Generate timings string from time slots
    useEffect(() => {
        const timingsString = timeSlots
            .map(slot => `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`)
            .join(', ');
        setFormData(prev => ({ ...prev, timings: timingsString }));
    }, [timeSlots]);

    const fetchTemple = async () => {
        try {
            const res = await fetch(`/api/temples/${templeId}`);
            if (res.ok) {
                const data = await res.json();
                const temple: Temple = data.temple;
                
                setFormData({
                    name: temple.name,
                    description: temple.description,
                    location: temple.location,
                    address: temple.address,
                    city: temple.city,
                    state: temple.state,
                    pincode: temple.pincode,
                    timings: temple.timings,
                    dailyTicketLimit: temple.dailyTicketLimit,
                    ticketPrice: temple.ticketPrice,
                    isActive: temple.isActive,
                });

                if (temple.timeSlots && temple.timeSlots.length > 0) {
                    setTimeSlots(temple.timeSlots.map(slot => ({
                        id: slot.id,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        capacity: slot.capacity,
                        isActive: slot.isActive,
                    })));
                } else {
                    setTimeSlots([{ startTime: "06:00", endTime: "12:00", capacity: 50 }]);
                }
            } else {
                setError("Temple not found");
            }
        } catch (error) {
            console.error("Error fetching temple:", error);
            setError("Failed to load temple");
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (time24: string) => {
        const [hours, minutes] = time24.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    const addTimeSlot = () => {
        setTimeSlots([...timeSlots, { startTime: "09:00", endTime: "17:00", capacity: 50 }]);
    };

    const removeTimeSlot = (index: number) => {
        if (timeSlots.length > 1) {
            setTimeSlots(timeSlots.filter((_, i) => i !== index));
        }
    };

    const updateTimeSlot = (index: number, field: keyof TimeSlot, value: string | number) => {
        const newTimeSlots = [...timeSlots];
        (newTimeSlots[index] as any)[field] = value;
        setTimeSlots(newTimeSlots);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" 
                ? (e.target as HTMLInputElement).checked
                : name === "dailyTicketLimit" || name === "ticketPrice"
                    ? parseFloat(value) || 0
                    : value,
        }));
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!validateTimeSlots()) {
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch(`/api/temples/${templeId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    timeSlots: timeSlots,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess("Temple updated successfully!");
                setTimeout(() => {
                    router.push("/dashboard/temples");
                }, 1500);
            } else {
                setError(data.error || "Failed to update temple");
            }
        } catch (error) {
            console.error("Error updating temple:", error);
            setError("Failed to update temple");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading temple...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to temples
            </button>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <Building2 className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Edit Temple
                        </h1>
                        <p className="text-gray-600 dark:text-zinc-400">Update temple details</p>
                    </div>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                        {success}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Temple Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                            Temple Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-zinc-800"
                            placeholder="Enter temple name"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                            Description *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-zinc-800"
                            placeholder="Describe the temple"
                        />
                    </div>

                    {/* Location Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                                Location *
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-zinc-800"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                                City *
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-zinc-800"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                                State *
                            </label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-zinc-800"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                                Full Address *
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                rows={2}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-zinc-800"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                                Pincode *
                            </label>
                            <input
                                type="text"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleChange}
                                required
                                pattern="[0-9]{6}"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-zinc-800"
                                placeholder="6-digit pincode"
                            />
                        </div>
                    </div>

                    {/* Time Slots */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Temple Timings *
                        </label>
                        <div className="space-y-4">
                            {timeSlots.map((slot, index) => (
                                <div key={index} className="flex items-center gap-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/30 rounded-lg">
                                    <div className="flex-1 grid grid-cols-3 gap-4">
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
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Capacity
                                            </label>
                                            <input
                                                type="number"
                                                value={slot.capacity}
                                                onChange={(e) => updateTimeSlot(index, 'capacity', parseInt(e.target.value) || 0)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                min="1"
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
                        </div>
                    </div>

                    {/* Booking Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                                Daily Ticket Limit *
                            </label>
                            <input
                                type="number"
                                name="dailyTicketLimit"
                                value={formData.dailyTicketLimit}
                                onChange={handleChange}
                                required
                                min="1"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-zinc-800"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
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
                                className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-zinc-800"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                                Status
                            </label>
                            <select
                                name="isActive"
                                value={formData.isActive ? "true" : "false"}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-zinc-800"
                            >
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-4 h-4" />
                            {submitting ? "Saving..." : "Save Changes"}
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
    );
}
