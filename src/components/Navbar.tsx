"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
    Building2,
    User as UserIcon,
    LogOut,
    Calendar,
    LayoutDashboard,
    ShieldCheck,
    Search,
    Menu,
    X
} from "lucide-react";
import { useState } from "react";

export default function Navbar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isActive = (path: string) => pathname === path;

    const NavLink = ({ href, children, icon: Icon }: { href: string, children: React.ReactNode, icon: any }) => (
        <Link
            href={href}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${isActive(href)
                    ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                    : "text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
                }`}
        >
            <Icon size={18} />
            <span className="font-medium">{children}</span>
        </Link>
    );

    return (
        <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                                <Building2 size={24} />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                                TempleBook
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-2">
                        <NavLink href="/" icon={Search}>Explore</NavLink>

                        {session?.user.role === "USER" && (
                            <NavLink href="/my-bookings" icon={Calendar}>My Bookings</NavLink>
                        )}

                        {session?.user.role === "TEMPLE_BOARD" && (
                            <NavLink href="/dashboard" icon={LayoutDashboard}>Manage</NavLink>
                        )}

                        {session?.user.role === "SUPERUSER" && (
                            <NavLink href="/admin" icon={ShieldCheck}>Admin</NavLink>
                        )}

                        <div className="h-6 w-px bg-gray-200 dark:bg-zinc-800 mx-2" />

                        {session ? (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                                    <UserIcon size={16} className="text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                                        {session.user.name.split(' ')[0]}
                                    </span>
                                </div>
                                <button
                                    onClick={() => signOut({ callbackUrl: "/login" })}
                                    className="p-2 text-gray-500 hover:text-red-600 dark:text-zinc-500 dark:hover:text-red-400 transition-colors"
                                    title="Sign Out"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/login"
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-lg text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 animate-in slide-in-from-top duration-200">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <Link
                            href="/"
                            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Explore Temples
                        </Link>
                        {session ? (
                            <>
                                <Link
                                    href={session.user.role === "USER" ? "/my-bookings" : session.user.role === "TEMPLE_BOARD" ? "/dashboard" : "/admin"}
                                    className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {session.user.role === "USER" ? "My Bookings" : "Dashboard"}
                                </Link>
                                <button
                                    onClick={() => signOut()}
                                    className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
                                <Link
                                    href="/login"
                                    className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-zinc-300"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/register"
                                    className="block px-3 py-2 rounded-lg text-base font-medium text-white bg-indigo-600"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
