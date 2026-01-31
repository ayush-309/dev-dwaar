"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User, Mail, Phone, Bell, Shield, Save, Eye, EyeOff } from "lucide-react";

export default function SettingsPage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [notifications, setNotifications] = useState({
        emailBookings: true,
        emailVerifications: true,
        emailReports: false,
    });

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

            // Initialize form with session data
            setFormData((prev) => ({
                ...prev,
                name: session.user.name || "",
                email: session.user.email || "",
                phone: "",
            }));
        }
    }, [status, session, router]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            // In a real app, this would call an API to update the user profile
            // For now, we'll just simulate a success
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setMessage({ type: "success", text: "Profile updated successfully!" });
        } catch (error) {
            setMessage({ type: "error", text: "Failed to update profile" });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: "error", text: "New passwords do not match" });
            setLoading(false);
            return;
        }

        if (formData.newPassword.length < 6) {
            setMessage({ type: "error", text: "Password must be at least 6 characters" });
            setLoading(false);
            return;
        }

        try {
            // In a real app, this would call an API to update the password
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setMessage({ type: "success", text: "Password updated successfully!" });
            setFormData((prev) => ({
                ...prev,
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            }));
        } catch (error) {
            setMessage({ type: "error", text: "Failed to update password" });
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <p className="text-gray-600 dark:text-zinc-400 mt-1">
                    Manage your account settings and preferences
                </p>
            </div>

            {/* Message */}
            {message.text && (
                <div
                    className={`p-4 rounded-xl ${
                        message.type === "success"
                            ? "bg-green-50 border border-green-200 text-green-700"
                            : "bg-red-50 border border-red-200 text-red-700"
                    }`}
                >
                    {message.text}
                </div>
            )}

            {/* Profile Settings */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                        <User className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Information</h2>
                        <p className="text-sm text-gray-500">Update your personal details</p>
                    </div>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-800 text-gray-500 cursor-not-allowed outline-none"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                                Phone Number
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                    placeholder="+91 XXXXX XXXXX"
                                />
                            </div>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </form>
            </div>

            {/* Password Settings */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                        <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Change Password</h2>
                        <p className="text-sm text-gray-500">Update your password for security</p>
                    </div>
                </div>

                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                                Current Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.currentPassword}
                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                                New Password
                            </label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                                Confirm New Password
                            </label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            {showPassword ? "Hide" : "Show"} passwords
                        </button>
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !formData.currentPassword || !formData.newPassword}
                        className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50"
                    >
                        <Shield className="w-4 h-4" />
                        {loading ? "Updating..." : "Update Password"}
                    </button>
                </form>
            </div>

            {/* Notification Settings */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                        <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h2>
                        <p className="text-sm text-gray-500">Manage your notification preferences</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl cursor-pointer">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">New Bookings</p>
                            <p className="text-sm text-gray-500">Get notified when someone books at your temple</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={notifications.emailBookings}
                            onChange={(e) => setNotifications({ ...notifications, emailBookings: e.target.checked })}
                            className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                        />
                    </label>
                    <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl cursor-pointer">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Ticket Verifications</p>
                            <p className="text-sm text-gray-500">Get notified when tickets are verified</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={notifications.emailVerifications}
                            onChange={(e) => setNotifications({ ...notifications, emailVerifications: e.target.checked })}
                            className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                        />
                    </label>
                    <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl cursor-pointer">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Weekly Reports</p>
                            <p className="text-sm text-gray-500">Receive weekly summary reports via email</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={notifications.emailReports}
                            onChange={(e) => setNotifications({ ...notifications, emailReports: e.target.checked })}
                            className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                        />
                    </label>
                </div>
            </div>
        </div>
    );
}
