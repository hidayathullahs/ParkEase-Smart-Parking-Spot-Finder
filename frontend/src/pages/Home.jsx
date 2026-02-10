import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'; // Added useMap
import L from 'leaflet';
import axios from 'axios';
import { Search, MapPin, Navigation, Palette, X, ArrowLeft } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import io from 'socket.io-client';
import SuccessAnimation from '../components/SuccessAnimation';

import MagicFind from '../components/MagicFind';
import AIChatbot from '../components/AIChatbot';
import SpotFinderHeader from '../components/SpotFinderHeader';
import BookingDrawer from '../components/BookingDrawer';
import NavigationOverlay from '../components/NavigationOverlay';

// Fix for default Leaflet marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Custom Dark Circle Marker like Screenshot
const createCustomIcon = (price, isSelected) => {
    const displayPrice = price !== undefined && price !== null ? price : '--';
    return L.divIcon({
        className: 'custom-marker',
        html: `<div class="${isSelected ? 'bg-black border-green-500 scale-110' : 'bg-[#0f1219] border-white/20'} w-12 h-12 rounded-full border-2 flex items-center justify-center shadow-2xl transform transition-all hover:scale-110">
                <span class="${isSelected ? 'text-green-500' : 'text-white'} text-[13px] font-bold tracking-tighter">$${displayPrice}</span>
               </div>
               ${isSelected ? '<div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-t-[8px] border-t-black border-r-[6px] border-r-transparent"></div>' : ''}
               `,
        iconSize: [48, 48], // Matched to w-12 (48px)
        iconAnchor: [24, 24], // Center (24px)
        popupAnchor: [0, -30]
    });
};

function RecenterMap({ center }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, 16, { animate: true, duration: 1.5 });
    }, [center]);
    return null;
}

const Home = () => {
    const navigate = useNavigate();
    const [parkingSpots, setParkingSpots] = useState([]);
    const [filteredSpots, setFilteredSpots] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    // const [loading, setLoading] = useState(true); // Unused
    const [userLocation, setUserLocation] = useState(null);
    const [center, setCenter] = useState([12.9716, 77.5946]); // Default: Bangalore
    const [sortType, setSortType] = useState(null); // Added sort state

    // UI State
    const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
    const [selectedSpot, setSelectedSpot] = useState(null); // For Booking Drawer
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [navDestination, setNavDestination] = useState(null); // For Navigation Overlay

    useEffect(() => {
        const socket = io(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5002');
        socket.on('parking_update', () => { // Removed unused data param
            axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5002/api'}/parkings`)
                .then(({ data }) => {
                    setParkingSpots(data);
                    // Re-apply current filters if needed, but simple re-fetch is okay
                });
        });
        return () => socket.disconnect();
    }, []);

    // Initial Fetch
    useEffect(() => {
        const fetchParkingSpots = async () => {
            try {
                // Fetch approved parkings from backend
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5002/api'}/parkings`);
                setParkingSpots(data);
                setFilteredSpots(data); // Initial set
            } catch (error) {
                console.error("Error fetching parkings", error);
            }
        };

        fetchParkingSpots();
    }, []);

    // Get User Location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => setUserLocation([position.coords.latitude, position.coords.longitude]),
                (error) => console.error("Location error", error)
            );
        }
    }, []);

    // Unified Filter & Sort Logic
    useEffect(() => {
        let result = [...parkingSpots];

        // 1. Filter
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(spot =>
                spot.name.toLowerCase().includes(lowerQuery) ||
                spot.address.toLowerCase().includes(lowerQuery) ||
                spot.city.toLowerCase().includes(lowerQuery)
            );
        }

        // 2. Sort
        if (sortType === 'cheapest') {
            result.sort((a, b) => {
                const priceA = (a.pricing && a.pricing.hourlyRate !== undefined && a.pricing.hourlyRate !== null) ? Number(a.pricing.hourlyRate) : Infinity;
                const priceB = (b.pricing && b.pricing.hourlyRate !== undefined && b.pricing.hourlyRate !== null) ? Number(b.pricing.hourlyRate) : Infinity;
                return priceA - priceB;
            });
        } else if (sortType === 'rating') {
            result.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
        } else if (sortType === 'closest') {
            if (userLocation) {
                const getDist = (spot) => {
                    if (!spot.location) return Infinity;
                    const { lat, lng } = spot.location;
                    return Math.sqrt(Math.pow(lat - userLocation[0], 2) + Math.pow(lng - userLocation[1], 2));
                };
                result.sort((a, b) => getDist(a) - getDist(b));
            }
        }

        setFilteredSpots(result);
    }, [searchQuery, parkingSpots, sortType, userLocation]);

    // Magic Sort Logic
    const handleMagicSort = (type) => {
        // Immediate visual feedback computing
        let potentialSorted = [...filteredSpots];

        if (type === 'cheapest') {
            potentialSorted.sort((a, b) => {
                const priceA = (a.pricing && a.pricing.hourlyRate !== undefined && a.pricing.hourlyRate !== null) ? Number(a.pricing.hourlyRate) : Infinity;
                const priceB = (b.pricing && b.pricing.hourlyRate !== undefined && b.pricing.hourlyRate !== null) ? Number(b.pricing.hourlyRate) : Infinity;
                return priceA - priceB;
            });
        } else if (type === 'rating') {
            potentialSorted.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
        } else if (type === 'closest') {
            if (!userLocation) {
                alert("Please enable location to find closest spots.");
                return;
            }
            const getDist = (spot) => {
                if (!spot.location) return Infinity;
                const { lat, lng } = spot.location;
                return Math.sqrt(Math.pow(lat - userLocation[0], 2) + Math.pow(lng - userLocation[1], 2));
            };
            sorted.sort((a, b) => getDist(a) - getDist(b));
        }

        setFilteredSpots(potentialSorted);

        // Visual Feedback: Fly to top result
        if (potentialSorted.length > 0) {
            const bestSpot = potentialSorted[0];
            if (bestSpot.location) {
                setCenter([bestSpot.location.lat, bestSpot.location.lng]);
                setSelectedSpot(bestSpot); // This might open the drawer, or we can use it to open popup
                // To open popup, we might need a ref or controlled popup. 
                // For now, centering is good feedback.
            }
        }
    };

    // Handlers
    const handleSpotClick = (spot) => {
        setSelectedSpot(spot);
    };

    const handleReserveClick = (spot) => {
        setSelectedSpot(spot);
        setIsBookingOpen(true);
    };

    const handleShowRoute = (spot) => {
        setNavDestination(spot);
        setIsBookingOpen(false); // Close booking if open
    };

    const handleConfirmBooking = () => {
        // console.log("Booking Confirmed for:", selectedSpot);
        alert(`Booking Confirmed for ${selectedSpot.name}!`);
        setIsBookingOpen(false);
    };

    return (
        <div className="h-screen w-full flex flex-col relative bg-[#0f1219] overflow-hidden">

            {/* Header */}
            <div className="md:hidden">
                <SpotFinderHeader viewMode={viewMode} setViewMode={setViewMode} />
            </div>

            {/* Back Button (Desktop) */}
            {/* Back Button (Desktop) - High Visibility */}
            <button
                onClick={() => navigate(-1)}
                className="absolute top-6 left-6 z-[400] bg-black text-white p-3 rounded-full hover:bg-gray-800 transition-all border-2 border-white/20 shadow-2xl group"
                aria-label="Go Back"
            >
                <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>

            {/* Main Content Area */}
            <div className="flex-1 relative">

                {/* Search Bar - Floating Glass Overlay */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[400] w-full max-w-xl px-4 hidden md:block">
                    <div className="relative flex items-center bg-white/80 backdrop-blur-xl rounded-full shadow-2xl px-6 py-4 border border-white/40 ring-1 ring-black/5 transition-all hover:scale-[1.01] hover:bg-white/90 group">
                        <Search className="text-gray-500 group-focus-within:text-purple-600 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search locations, cities, or parking hubs..."
                            className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder:text-gray-400 font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="w-px h-6 bg-gray-200 mx-3"></div>
                        <button className="bg-gray-50 p-2 rounded-full hover:bg-gray-100 transition border border-gray-200">
                            <Search size={16} className="text-gray-500" />
                        </button>
                    </div>
                </div>

                {viewMode === 'map' ? (
                    <div className="h-full w-full relative z-0">
                        <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                            <RecenterMap center={center} />
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                            />

                            {/* Navigation Route Line (Simulated) */}
                            {navDestination && userLocation && (
                                <Polyline
                                    positions={[
                                        userLocation,
                                        [navDestination.location.lat, navDestination.location.lng]
                                    ]}
                                    pathOptions={{ color: '#3b82f6', weight: 6, opacity: 0.9 }}
                                />
                            )}

                            {filteredSpots.map((spot) => (
                                spot.location && spot.location.lat && (
                                    <Marker
                                        key={`${spot.id}-${spot.pricing?.hourlyRate}`}
                                        position={[spot.location.lat, spot.location.lng]}
                                        icon={createCustomIcon(spot.pricing?.hourlyRate, selectedSpot?.id === spot.id)}
                                        eventHandlers={{
                                            click: () => handleSpotClick(spot),
                                        }}
                                    >
                                        <Popup className="glass-popup" minWidth={260} closeButton={false}>
                                            <div className="bg-[#131722] text-white p-5 rounded-2xl shadow-2xl border border-white/5 -m-[1px] relative overflow-hidden">
                                                <button className="absolute top-3 right-3 text-gray-500 hover:text-white" onClick={() => {
                                                    // e.stopPropagation(); 
                                                }}>
                                                    <X size={16} />
                                                </button>

                                                <h3 className="font-bold text-xl leading-tight mb-1 pr-4">{spot.name}</h3>
                                                <p className="text-xs text-gray-400 mb-4">{spot.city}</p>

                                                <div className="flex items-center gap-3 mb-5">
                                                    <span className="text-blue-400 font-bold text-xl">₹{spot.pricing?.hourlyRate}<span className="text-sm text-gray-500 font-normal">/hr</span></span>
                                                    <span className="bg-[#1c3a2f] text-[#34d399] text-[10px] font-bold px-2 py-1 rounded tracking-wider uppercase">
                                                        {spot.status || 'AVAILABLE'}
                                                    </span>
                                                </div>

                                                <div className="flex flex-col gap-2.5">
                                                    <button
                                                        onClick={() => handleReserveClick(spot)}
                                                        className="w-full bg-[#1e2330] hover:bg-[#252b3b] border border-white/5 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
                                                    >
                                                        Details
                                                    </button>
                                                    <button
                                                        onClick={() => handleShowRoute(spot)}
                                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-blue-600/20 transition-all"
                                                    >
                                                        Show Route
                                                    </button>
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                )
                            ))}

                            {/* User Location Marker */}
                            {userLocation && (
                                <Marker position={userLocation} icon={L.divIcon({
                                    className: 'user-marker',
                                    html: '<div class="w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg pulse-ring"></div>',
                                    iconSize: [20, 20]
                                })} />
                            )}

                        </MapContainer>
                    </div>
                ) : (
                    <div className="p-20 text-white text-center">
                        <h2 className="text-2xl font-bold">List View</h2>
                        <p className="text-gray-400">List view implementation pending...</p>
                    </div>
                )}

                {/* Overlays */}
                <BookingDrawer
                    isOpen={isBookingOpen}
                    onClose={() => setIsBookingOpen(false)}
                    spot={selectedSpot}
                    onConfirm={handleConfirmBooking}
                />

                <NavigationOverlay
                    isNavigating={!!navDestination}
                    destination={navDestination}
                    onStopNavigation={() => setNavDestination(null)}
                />

                {/* Magic Find Button (Smart Sort) */}
                <MagicFind onSort={handleMagicSort} />

                {/* AI Chatbot (ParkGenie) */}
                <AIChatbot />

            </div>
        </div>
    );
};

export default Home;

