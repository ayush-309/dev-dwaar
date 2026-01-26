"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Clock, IndianRupee, Ticket } from "lucide-react";
import Image from "next/image";

interface Temple {
    id: string;
    name: string;
    description: string;
    location: string;
    city: string;
    state: string;
    timings: string;
    dailyTicketLimit: number;
    ticketPrice: number;
    images: string[];
    _count: {
        bookings: number;
    };
}

export default function ExplorePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [temples, setTemples] = useState<Temple[]>([]);
    const [filteredTemples, setFilteredTemples] = useState<Temple[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCity, setSelectedCity] = useState("");

    useEffect(() => {
        fetchTemples();
    }, []);

    useEffect(() => {
        filterTemples();
    }, [searchTerm, selectedCity, temples]);

    const fetchTemples = async () => {
        try {
            const res = await fetch("/api/temples");
            if (res.ok) {
                const data = await res.json();
                setTemples(data.temples || []);
                setFilteredTemples(data.temples || []);
            }
        } catch (error) {
            console.error("Error fetching temples:", error);
        } finally {
            setLoading(false);
        }
    };

    const filterTemples = () => {
        let filtered = temples;

        if (searchTerm) {
            filtered = filtered.filter(
                (temple) =>
                    temple.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    temple.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    temple.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedCity) {
            filtered = filtered.filter((temple) => temple.city === selectedCity);
        }

        setFilteredTemples(filtered);
    };

    const uniqueCities = Array.from(new Set(temples.map((t) => t.city))).sort();

    const handleBookNow = (templeId: string) => {
        if (status === "unauthenticated") {
            router.push("/login?redirect=/explore");
        } else {
            router.push(`/book/${templeId}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading temples...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">
                        Explore Sacred Temples
                    </h1>
                    <p className="text-xl text-gray-600">
                        Discover and book your spiritual journey
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search temples by name or location..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>

                        {/* City Filter */}
                        <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                            <option value="">All Cities</option>
                            {uniqueCities.map((city) => (
                                <option key={city} value={city}>
                                    {city}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-4 text-sm text-gray-600">
                        Showing {filteredTemples.length} of {temples.length} temples
                    </div>
                </div>

                {/* Temples Grid */}
                {filteredTemples.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredTemples.map((temple) => (
                            <div
                                key={temple.id}
                                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                            >
                                {/* Temple Image */}
                                <div className="relative h-48 bg-gradient-to-r from-orange-400 to-red-400">
                                    {temple.images.length > 0 ? (
                                        <Image
                                            src={temple.images[0]}
                                            alt={temple.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-white text-6xl">
                                            🛕
                                        </div>
                                    )}
                                </div>

                                {/* Temple Info */}
                                <div className="p-6">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        {temple.name}
                                    </h2>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <MapPin className="w-4 h-4 text-orange-600" />
                                            <span className="text-sm">
                                                {temple.location}, {temple.city}, {temple.state}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Clock className="w-4 h-4 text-orange-600" />
                                            <span className="text-sm">{temple.timings}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Ticket className="w-4 h-4 text-orange-600" />
                                            <span className="text-sm">
                                                {temple.dailyTicketLimit} tickets/day
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-gray-900 font-semibold">
                                            <IndianRupee className="w-4 h-4 text-orange-600" />
                                            <span>₹{temple.ticketPrice} per person</span>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                        {temple.description}
                                    </p>

                                    <button
                                        onClick={() => handleBookNow(temple.id)}
                                        className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all transform hover:scale-105"
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">😔</div>
                        <h2 className="text-2xl font-bold text-gray-700 mb-2">
                            No temples found
                        </h2>
                        <p className="text-gray-500">
                            Try adjusting your search or filters
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
