import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Search, MapPin, Clock, ArrowRight, Star, ShieldCheck } from "lucide-react";

// Define the Temple type based on what we use in this component
interface Temple {
  id: string;
  name: string;
  city: string;
  state: string;
  timings: string;
  ticketPrice: number;
  images: string[];
}

export default async function HomePage() {
  // Ideally we would fetch temples here, but since the DB might not be ready,
  // we'll handle empty states or mock data for the V0 UI.
  let temples: Temple[] = [];
  try {
    temples = await prisma.temple.findMany({
      where: { isActive: true },
      take: 6,
    });
  } catch (e) {
    console.error("Failed to fetch temples:", e);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6 drop-shadow-lg">
              Experience Spiritual Bliss with{" "}
              <span className="text-yellow-100">Easy Bookings</span>
            </h1>
            <p className="text-xl text-white/95 mb-10 leading-relaxed drop-shadow-md">
              Skip the long queues. Book your temple visit in seconds and receive your digital ticket instantly.
            </p>

            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none text-gray-900"
                placeholder="Search by temple name, city, or state..."
              />
            </div>
          </div>
        </div>

        {/* Background blobs */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-yellow-300/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-amber-300/40 rounded-full blur-3xl" />
      </div>

      {/* Featured Temples */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Temples</h2>
            <p className="text-gray-600 mt-2">Discover popular spiritual destinations</p>
          </div>
          <Link href="/explore" className="text-yellow-600 hover:text-yellow-700 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            View All <ArrowRight size={18} />
          </Link>
        </div>

        {temples.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {temples.map((temple) => (
              <TempleCard key={temple.id} temple={temple} />
            ))}
          </div>
        ) : (
          <div className="bg-yellow-50 rounded-3xl p-12 text-center border-2 border-dashed border-yellow-300">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm text-yellow-600">
              <Building2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No temples found yet</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Our temple list is growing. Check back soon or register as a temple board to list your own temple!
            </p>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-white py-20 border-y border-yellow-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <Feature
              title="Quick Booking"
              desc="Select your preferred time slot and book your visit in under a minute."
            />
            <Feature
              title="Digital Tickets"
              desc="Receive a secure QR code ticket which can be easily scanned at the temple."
            />
            <Feature
              title="Crowd Management"
              desc="Temples manage daily limits to ensure a peaceful and organized experience."
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-yellow-50 to-orange-50 py-12 border-t border-yellow-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-700 text-sm font-medium">
            © {new Date().getFullYear()} Dev Dwaar Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function TempleCard({ temple }: { temple: Temple }) {
  return (
    <Link href={`/book/${temple.id}`} className="group bg-white rounded-2xl overflow-hidden border-2 border-yellow-200 hover:shadow-2xl hover:border-yellow-400 transition-all duration-300 hover:-translate-y-1">
      <div className="h-48 bg-gradient-to-br from-yellow-100 to-orange-100 relative overflow-hidden">
        {temple.images?.[0] ? (
          <img src={temple.images[0]} alt={temple.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-yellow-600">
            <Building2 size={48} />
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 text-sm font-bold">
          <Star size={14} className="text-yellow-500 fill-yellow-500" />
          4.5
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors">{temple.name}</h3>
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <MapPin size={16} />
            {temple.city}, {temple.state}
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Clock size={16} />
            {temple.timings}
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-yellow-100">
          <span className="text-lg font-bold text-yellow-600">
            {temple.ticketPrice === 0 ? "Free Entry" : `₹${temple.ticketPrice}`}
          </span>
          <span className="text-xs font-medium px-2 py-1 bg-green-50 text-green-700 rounded-full border border-green-200">
            Available
          </span>
        </div>
      </div>
    </Link>
  );
}

function Feature({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="space-y-4">
      <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl flex items-center justify-center text-yellow-600">
        <ShieldCheck size={24} />
      </div>
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{desc}</p>
    </div>
  );
}

function Building2(props: any) {
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
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}
