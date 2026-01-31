"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
    CheckCircle2,
    XCircle,
    User,
    MapPin,
    Calendar,
    Ticket,
    AlertCircle,
    RefreshCcw
} from "lucide-react";
import { QRCodeData } from "@/types";

export default function QRScanner() {
    const [scanResult, setScanResult] = useState<QRCodeData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [verifying, setVerifying] = useState(false);
    const [verificationDone, setVerificationDone] = useState(false);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        if (!verificationDone) {
            scannerRef.current = new Html5QrcodeScanner(
                "reader",
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                },
        /* verbose= */ false
            );

            scannerRef.current.render(onScanSuccess, onScanFailure);
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => console.error("Failed to clear scanner", error));
            }
        };
    }, [verificationDone]);

    async function onScanSuccess(decodedText: string) {
        if (verifying || verificationDone) return;

        setVerifying(true);
        try {
            const response = await fetch("/api/bookings/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ qrData: decodedText }),
            });

            const result = await response.json();

            if (result.success) {
                setScanResult(result.data);
                setError(null);
                if (scannerRef.current) {
                    scannerRef.current.clear().catch(error => console.error(error));
                }
                setVerificationDone(true);
            } else {
                setError(result.error || "Invalid or already verified ticket");
            }
        } catch (err) {
            setError("Failed to verify ticket. Please try again.");
        } finally {
            setVerifying(false);
        }
    }

    function onScanFailure(error: string) {
        // Usually we don't need to show errors for every failed frame
        // console.warn(`Code scan error = ${error}`);
    }

    const resetScanner = () => {
        setScanResult(null);
        setError(null);
        setVerificationDone(false);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Verify Tickets</h1>
                <p className="text-gray-600 dark:text-zinc-400 mt-1">
                    Scan visitor QR codes to verify their booking status.
                </p>
            </div>

            <div className="max-w-xl mx-auto">
                {!verificationDone ? (
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-gray-100 dark:border-zinc-800 shadow-xl">
                        <div id="reader" className="overflow-hidden rounded-2xl border-0"></div>

                        {verifying && (
                            <div className="mt-6 flex items-center justify-center gap-3 text-orange-600 font-bold">
                                <RefreshCcw className="animate-spin" />
                                Verifying ticket...
                            </div>
                        )}

                        {error && (
                            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
                                <XCircle className="shrink-0" />
                                <div>
                                    <p className="font-bold">Verification Failed</p>
                                    <p className="text-sm">{error}</p>
                                </div>
                            </div>
                        )}

                        <div className="mt-8 grid grid-cols-2 gap-4 text-center">
                            <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-2xl">
                                <p className="text-2xl font-bold dark:text-white">0</p>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Today Scanned</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-2xl">
                                <p className="text-2xl font-bold dark:text-white">100</p>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Remaining</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-green-200 dark:border-green-900/30 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mx-auto mb-6">
                            <CheckCircle2 size={40} />
                        </div>

                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Ticket Verified!</h2>
                            <p className="text-green-600 dark:text-green-400 font-bold mt-1 uppercase tracking-widest text-sm">
                                Access Granted
                            </p>
                        </div>

                        {scanResult && (
                            <div className="space-y-4 bg-gray-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800">
                                <div className="flex items-center gap-4 border-b border-gray-100 dark:border-zinc-800 pb-4">
                                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold">Visitor Name</p>
                                        <p className="text-lg font-bold dark:text-white">{scanResult.userName}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold flex items-center gap-1 mb-1">
                                            <Calendar size={12} /> Visit Date
                                        </p>
                                        <p className="font-bold dark:text-white">{scanResult.visitDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold flex items-center gap-1 mb-1">
                                            <Ticket size={12} /> Count
                                        </p>
                                        <p className="font-bold dark:text-white">{scanResult.ticketCount} Person(s)</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                                    <p className="text-xs text-gray-500 uppercase font-bold flex items-center gap-1 mb-1">
                                        <MapPin size={12} /> Temple
                                    </p>
                                    <p className="font-bold dark:text-white">{scanResult.templeName}</p>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={resetScanner}
                            className="mt-8 w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-orange-600/20 flex items-center justify-center gap-2"
                        >
                            <RefreshCcw size={20} />
                            Scan Next Ticket
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
