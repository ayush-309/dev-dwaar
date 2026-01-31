import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
    Users,
    Ticket,
    TrendingUp,
    Calendar,
    Building2,
    CheckCircle2,
    Clock
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) return null;

    // Fetch stats (mocking for now to avoid Prisma crashes if DB not ready)
    let stats = {
        totalTemples: 0,
        activeBookings: 0,
        todayBookings: 0,
        revenue: 0
    };

    try {
        const templeCount = await prisma.temple.count({
            where: { ownerId: session.user.id }
        });

        const bookings = await prisma.booking.findMany({
            where: {
                temple: { ownerId: session.user.id }
            },
            include: { temple: true }
        });

        stats = {
            totalTemples: templeCount,
            activeBookings: bookings.length,
            todayBookings: bookings.filter(b => {
                const today = new Date();
                const visitDate = new Date(b.visitDate);
                return visitDate.toDateString() === today.toDateString();
            }).length,
            revenue: bookings.reduce((acc, b) => acc + b.totalAmount, 0)
        };
    } catch (e) {
        console.error("Dashboard stats fetch failed:", e);
    }

    const statCards = [
        { label: "Total Temples", value: stats.totalTemples, icon: Building2, color: "bg-orange-500" },
        { label: "Total Bookings", value: stats.activeBookings, icon: Ticket, color: "bg-orange-500" },
        { label: "Bookings Today", value: stats.todayBookings, icon: Calendar, color: "bg-emerald-500" },
        { label: "Total Revenue", value: `₹${stats.revenue}`, icon: TrendingUp, color: "bg-amber-500" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
                <p className="text-gray-600 dark:text-zinc-400 mt-1">
                    Welcome back, {session.user.name}. Here's what's happening today.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center gap-4">
                                <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center text-white`}>
                                    <Icon size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold dark:text-white">Recent Activities</h2>
                        <button className="text-orange-600 dark:text-orange-400 text-sm font-semibold">View All</button>
                    </div>

                    <div className="space-y-6">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800">
                                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
                                    <CheckCircle2 size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold dark:text-white">Ticket #TBK-X82{i} Verified</p>
                                    <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1">Verified at Mahadev Temple • 2 mins ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold dark:text-white">Quick Actions</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/dashboard/verify" className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors text-left group">
                            <QrCode className="mb-3 group-hover:scale-110 transition-transform" />
                            <p className="font-bold">Scan Ticket</p>
                            <p className="text-xs opacity-80 mt-1">Verify visitors quickly</p>
                        </Link>
                        <Link href="/dashboard/temples/create" className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors text-left group">
                            <PlusCircle className="mb-3 group-hover:scale-110 transition-transform" />
                            <p className="font-bold">Add Temple</p>
                            <p className="text-xs opacity-80 mt-1">List a new temple</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PlusCircle(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v8" />
            <path d="M8 12h8" />
        </svg>
    );
}

function QrCode(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="5" height="5" x="3" y="3" rx="1" />
            <rect width="5" height="5" x="16" y="3" rx="1" />
            <rect width="5" height="5" x="3" y="16" rx="1" />
            <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
            <path d="M21 21v.01" />
            <path d="M12 7v3a2 2 0 0 1-2 2H7" />
            <path d="M3 12h.01" />
            <path d="M12 3h.01" />
            <path d="M12 16v.01" />
            <path d="M16 12h1" />
            <path d="M21 12v.01" />
            <path d="M12 21v.01" />
        </svg>
    );
}
