import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mx-auto">
                    <ShieldAlert size={40} />
                </div>
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Access Denied</h1>
                <p className="text-gray-600 dark:text-zinc-400 text-lg">
                    You don't have permission to access this page. Please make sure you are logged in with the correct account role.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20"
                >
                    <ArrowLeft size={18} />
                    Go Back Home
                </Link>
            </div>
        </div>
    );
}
