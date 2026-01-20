import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, MessageCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const Landing = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = () => {
        if (searchQuery.trim()) {
            navigate(`/find?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    // Sample Data from Screenshot
    const dummySpots = [
        { id: 1, name: "Downtown Garage", address: "123 Main St, City Center", price: 5, coords: [12.9716, 77.5946] },
        { id: 2, name: "Mall Parking", address: "456 Market Rd", price: 2, coords: [12.9800, 77.6000] }, // Approx nearby
        { id: 3, name: "Whitefield IT Park", address: "ITPL Main Rd, Whitefield", price: 8, coords: [12.9850, 77.7400] }, // Whitefield
        { id: 4, name: "Koramangala Tech Spot", address: "80 Feet Rd, Koramangala", price: 6, coords: [12.9352, 77.6245] }, // Koramangala
        { id: 5, name: "Indiranagar Metro Parking", address: "100 Feet Rd, Indiranagar", price: 4, coords: [12.9784, 77.6408] },
    ];

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col">
            {/* Navbar */}
            <header className="flex items-center justify-between px-8 py-5 border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                        ParkEase
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition">
                        Login
                    </Link>
                    <Link to="/register" className="px-5 py-2.5 rounded-lg bg-[#0f172a] text-white text-sm font-bold hover:bg-black transition shadow-lg hover:shadow-xl">
                        Sign Up
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center pt-10 px-4">
                <div className="text-center max-w-3xl mx-auto mb-10">
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
                        Find Parking <span className="text-blue-500">Instantly</span>
                    </h1>

                    {/* Search Bar */}
                    <div className="flex items-center w-full max-w-2xl mx-auto bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 p-2 pl-6 transition-shadow hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                        <MapPin className="text-gray-400 mr-3" size={24} />
                        <input
                            type="text"
                            placeholder="Search location..."
                            className="flex-1 bg-transparent border-none outline-none text-lg text-gray-800 placeholder:text-gray-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button
                            onClick={handleSearch}
                            className="bg-[#0f172a] text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-black transition"
                        >
                            <Search size={18} />
                            Search
                        </button>
                    </div>
                </div>

                {/* Map & List Section */}
                <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-6 h-[600px] mb-20 px-4">

                    {/* Parking List Sidebar */}
                    <div className="hidden md:block md:w-[380px] h-full overflow-y-auto pr-2 custom-scrollbar">
                        <div className="space-y-4">
                            {dummySpots.map((spot) => (
                                <div key={spot.id} className="bg-[#9ca3af] rounded-lg p-5 shadow-sm hover:shadow-md transition-all">
                                    <h3 className="font-bold text-lg text-gray-900 mb-1">{spot.name}</h3>
                                    <div className="flex items-center text-gray-600 text-sm mb-3">
                                        <MapPin size={14} className="mr-1" />
                                        {spot.address}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-green-400 font-bold text-lg">${spot.price}/hr</span>
                                        <Link to="/login" className="text-blue-600 hover:text-blue-800 text-sm font-semibold hover:underline">
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Map Container */}
                    <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl border border-gray-100 relative h-full bg-slate-100">
                        <MapContainer center={[12.9716, 77.5946]} zoom={13} style={{ height: "100%", width: "100%" }}>
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                            />
                            {dummySpots.map((spot) => (
                                <Marker key={spot.id} position={spot.coords}>
                                    <Popup>
                                        <div className="text-center">
                                            <h3 className="font-bold">{spot.name}</h3>
                                            <p className="text-xs text-gray-500">{spot.address}</p>
                                            <p className="text-green-600 font-bold mt-1">${spot.price}/hr</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </div>
            </main>

            {/* Magic Tool Fab */}
            <div className="fixed bottom-8 right-8 z-50">
                <button className="w-16 h-16 bg-[#6366f1] rounded-full shadow-lg shadow-indigo-500/30 flex items-center justify-center text-white hover:scale-110 transition-transform">
                    <MessageCircle size={32} fill="currentColor" />
                </button>
            </div>
        </div>
    );
};

export default Landing;
