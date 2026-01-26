"use client";

import Navbar from "@/components/Navbar";
import { Clock, RefreshCcw, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function PendingApprovalPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 py-24 text-center">
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 shadow-2xl border border-white dark:border-zinc-800 relative overflow-hidden">
                    {/* Decorative background element */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />

                    <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto mb-8 animate-pulse">
                        <Clock size={48} />
                    </div>

                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6">Verification in Progress</h1>

                    <p className="text-gray-600 dark:text-zinc-400 text-xl leading-relaxed mb-10 max-w-xl mx-auto">
                        Your Temple Board account application has been received and is being reviewed by our administration team.
                        We'll notify you via email once your account is activated.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-600/20"
                        >
                            <RefreshCcw size={20} />
                            Check Status
                        </button>
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 font-bold rounded-2xl border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all shadow-sm"
                        >
                            <LogOut size={20} />
                            Sign Out
                        </button>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-100 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <p className="text-sm font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-tighter mb-1">Step 1</p>
                            <p className="font-semibold text-green-600 dark:text-green-500">Registration Done</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-tighter mb-1">Step 2</p>
                            <p className="font-semibold text-amber-600 dark:text-amber-500">Admin Review</p>
                        </div>
                        <div className="text-center opacity-40">
                            <p className="text-sm font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-tighter mb-1">Step 3</p>
                            <p className="font-semibold">Full Access</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
