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
                    ? "bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 border border-yellow-200"
                    : "text-gray-600 hover:bg-yellow-50 hover:text-yellow-700"
                }`}
        >
            <Icon size={18} />
            <span className="font-medium">{children}</span>
        </Link>
    );

    return (
        <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-yellow-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform">
                                <Building2 size={24} />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-yellow-600">
                                Dev Dwaar
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
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
                                    <UserIcon size={16} className="text-orange-600" />
                                    <span className="text-sm font-medium text-gray-700">
                                        {session.user.name.split(' ')[0]}
                                    </span>
                                </div>
                                <button
                                    onClick={() => signOut({ callbackUrl: "/login" })}
                                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                                    title="Sign Out"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/login"
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-600"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 rounded-xl transition-all shadow-lg shadow-orange-500/30"
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
                            className="p-2 rounded-lg text-gray-600 hover:bg-yellow-50"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-b border-yellow-200 animate-in slide-in-from-top duration-200">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <Link
                            href="/"
                            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-yellow-50 hover:text-orange-600"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Explore Temples
                        </Link>
                        {session ? (
                            <>
                                <Link
                                    href={session.user.role === "USER" ? "/my-bookings" : session.user.role === "TEMPLE_BOARD" ? "/dashboard" : "/admin"}
                                    className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-yellow-50 hover:text-orange-600"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {session.user.role === "USER" ? "My Bookings" : "Dashboard"}
                                </Link>
                                <button
                                    onClick={() => signOut()}
                                    className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col gap-2 pt-2 border-t border-yellow-200">
                                <Link
                                    href="/login"
                                    className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-orange-600"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/register"
                                    className="block px-3 py-2 rounded-lg text-base font-medium text-white bg-gradient-to-r from-orange-500 to-yellow-500"
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
