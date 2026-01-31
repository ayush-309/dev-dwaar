"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Building2,
    LayoutDashboard,
    PlusCircle,
    CalendarCheck,
    QrCode,
    Settings,
    AlertCircle
} from "lucide-react";
import { useSession } from "next-auth/react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { data: session } = useSession();

    const sidebarLinks = [
        { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
        { href: "/dashboard/temples", icon: Building2, label: "My Temples" },
        { href: "/dashboard/bookings", icon: CalendarCheck, label: "Bookings" },
        { href: "/dashboard/verify", icon: QrCode, label: "Verify Tickets" },
        { href: "/dashboard/settings", icon: Settings, label: "Settings" },
    ];

    if (session && !session.user.isApproved) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-20">
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-10 shadow-xl border border-gray-100 dark:border-zinc-800 text-center max-w-2xl mx-auto">
                        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto mb-6">
                            <AlertCircle size={40} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Pending Approval</h1>
                        <p className="text-gray-600 dark:text-zinc-400 text-lg mb-8">
                            Your account as a Temple Board member is currently pending approval by the superuser.
                            Once approved, you'll be able to manage your temples and track bookings.
                        </p>
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-300 text-sm">
                            Please check back later. This usually takes 24-48 hours.
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full md:w-64 flex-shrink-0">
                        <div className="sticky top-24 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-4 shadow-sm">
                            <nav className="space-y-1">
                                {sidebarLinks.map((link) => {
                                    const Icon = link.icon;
                                    const active = pathname === link.href;
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active
                                                    ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20"
                                                    : "text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
                                                }`}
                                        >
                                            <Icon size={20} />
                                            <span className="font-semibold">{link.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
