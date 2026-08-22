import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Compass, Sparkles, ArrowRight, Star, Heart, Navigation } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

const INDIAN_DESTINATIONS = [
  {
    id: 'c05-ladakh',
    name: 'Leh Ladakh',
    state: 'Ladakh',
    region: 'North',
    x: 32, // percent on map
    y: 12,
    avgBudget: 42000,
    highlights: 'Pangong Lake, Khardung La, Nubra Valley',
    image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=500&auto=format&fit=crop&q=80',
    tag: 'Mountain Wilderness'
  },
  {
    id: 'c03-manali',
    name: 'Manali & Rohtang',
    state: 'Himachal Pradesh',
    region: 'North',
    x: 34,
    y: 20,
    avgBudget: 28000,
    highlights: 'Solang Valley Paragliding, Snow Peaks, Old Manali Cafes',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=500&auto=format&fit=crop&q=80',
    tag: 'Snow & Adventure'
  },
  {
    id: 'c08-rishikesh',
    name: 'Rishikesh & Haridwar',
    state: 'Uttarakhand',
    region: 'North',
    x: 39,
    y: 26,
    avgBudget: 16000,
    highlights: 'White Water Rafting, Ganga Aarti, Bungee Jumping',
    image: 'https://images.unsplash.com/photo-1598890777032-bde835ba27c2?w=500&auto=format&fit=crop&q=80',
    tag: 'Spiritual & Rafting'
  },
  {
    id: 'c02-jaipur',
    name: 'Jaipur (Pink City)',
    state: 'Rajasthan',
    region: 'West',
    x: 28,
    y: 36,
    avgBudget: 24000,
    highlights: 'Amer Fort, Hawa Mahal, Johari Bazaar Street Food',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=500&auto=format&fit=crop&q=80',
    tag: 'Royal Heritage'
  },
  {
    id: 'c07-udaipur',
    name: 'Udaipur (City of Lakes)',
    state: 'Rajasthan',
    region: 'West',
    x: 26,
    y: 44,
    avgBudget: 32000,
    highlights: 'Lake Pichola Sunset Boat, City Palace, Jagmandir',
    image: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=500&auto=format&fit=crop&q=80',
    tag: 'Romantic Lakes'
  },
  {
    id: 'c06-varanasi',
    name: 'Varanasi',
    state: 'Uttar Pradesh',
    region: 'East',
    x: 52,
    y: 40,
    avgBudget: 15000,
    highlights: 'Dashashwamedh Ghat Aarti, Morning Boat Ride, Kashi Temple',
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=500&auto=format&fit=crop&q=80',
    tag: 'Timeless Culture'
  },
  {
    id: 'c09-mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    region: 'West',
    x: 25,
    y: 58,
    avgBudget: 35000,
    highlights: 'Marine Drive, Gateway of India, Colaba Causeway',
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=500&auto=format&fit=crop&q=80',
    tag: 'Maximum City'
  },
  {
    id: 'c01-goa',
    name: 'Goa',
    state: 'Goa',
    region: 'West',
    x: 27,
    y: 70,
    avgBudget: 25000,
    highlights: 'Palolem Beach, Grand Island Scuba Diving, Sunsets',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500&auto=format&fit=crop&q=80',
    tag: 'Beaches & Water Sports'
  },
  {
    id: 'c04-kerala',
    name: 'Alleppey & Munnar',
    state: 'Kerala',
    region: 'South',
    x: 32,
    y: 86,
    avgBudget: 36000,
    highlights: 'Backwater Luxury Houseboat, Tea Plantations, Kathakali',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=500&auto=format&fit=crop&q=80',
    tag: "God's Own Country"
  },
  {
    id: 'c10-andaman',
    name: 'Andaman & Nicobar',
    state: 'Andaman',
    region: 'South',
    x: 82,
    y: 78,
    avgBudget: 55000,
    highlights: 'Radhanagar Beach, Havelock Snorkeling, Coral Reefs',
    image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=500&auto=format&fit=crop&q=80',
    tag: 'Tropical Paradise'
  }
];

export default function IndiaMap() {
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [hoveredCity, setHoveredCity] = useState(INDIAN_DESTINATIONS[0]);

  const filteredSpots = selectedRegion === 'All'
    ? INDIAN_DESTINATIONS
    : INDIAN_DESTINATIONS.filter(d => d.region === selectedRegion);

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header & Region Filter Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-brand-600 text-xs font-black uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>Interactive Tourism Map</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Explore Incredible India 🇮🇳</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Click on any tourist hub on the map to view trip budgets in ₹ and launch your itinerary planner.
          </p>
        </div>

        {/* Region Filter Pills */}
        <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-2xl">
          {['All', 'North', 'West', 'South', 'East'].map(region => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                selectedRegion === region
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {region === 'All' ? 'All India' : `${region} India`}
            </button>
          ))}
        </div>
      </div>

      {/* Main Container: Left Map Visual, Right Destination Spotlight Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Interactive Map Visual (7 Cols) */}
        <div className="lg:col-span-7 relative bg-gradient-to-b from-sky-50 via-brand-50/20 to-slate-100 rounded-3xl p-4 sm:p-8 border border-slate-200/60 overflow-hidden min-h-[460px] flex items-center justify-center">
          
          {/* Subtle India Geographic Stylized Base */}
          <div className="relative w-full max-w-[420px] aspect-[4/5] mx-auto select-none">
            {/* Background SVG silhouette representing the vibrant Indian subcontinent */}
            <svg
              viewBox="0 0 400 500"
              className="w-full h-full drop-shadow-md text-brand-100/80 fill-current"
            >
              <path
                d="M 130 30 Q 150 10, 180 35 Q 210 50, 200 90 Q 230 110, 250 140 Q 280 160, 310 165 Q 350 170, 360 210 Q 340 230, 290 235 Q 270 260, 260 290 Q 230 350, 180 430 Q 170 470, 150 480 Q 130 450, 120 380 Q 90 320, 80 260 Q 60 220, 80 180 Q 70 140, 95 110 Z"
                className="fill-slate-200/90 stroke-slate-300 stroke-2"
              />
              <path
                d="M 330 380 Q 340 370, 345 390 Q 350 410, 335 420 Z"
                className="fill-slate-200/90 stroke-slate-300 stroke-2"
              />
            </svg>

            {/* Clickable Destination Pins */}
            {filteredSpots.map((spot) => {
              const isHovered = hoveredCity?.id === spot.id;
              return (
                <div
                  key={spot.id}
                  style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                  onMouseEnter={() => setHoveredCity(spot)}
                  onClick={() => navigate(`/trips/new?city=${spot.id}`)}
                >
                  {/* Glowing Radar Ring on selected */}
                  {isHovered && (
                    <span className="absolute -inset-2 rounded-full bg-brand-500/30 animate-ping"></span>
                  )}

                  {/* Pin Circle */}
                  <div
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all transform ${
                      isHovered
                        ? 'bg-slate-900 text-amber-400 scale-125 ring-4 ring-brand-500/30'
                        : 'bg-brand-600 text-white hover:scale-110'
                    }`}
                  >
                    <MapPin className="w-4 h-4 stroke-[2.5]" />
                  </div>

                  {/* Hover Tag label */}
                  <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-slate-200/80 shadow-md text-[10px] font-black text-slate-800 pointer-events-none">
                    {spot.name.split(' ')[0]}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="absolute bottom-3 left-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Interactive GPS Tourism Nodes</span>
          </div>
        </div>

        {/* Right Destination Spotlight Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {hoveredCity ? (
            <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 space-y-5 shadow-inner">
              <div className="relative h-48 rounded-2xl overflow-hidden shadow-sm">
                <img
                  src={hoveredCity.image}
                  alt={hoveredCity.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                  {hoveredCity.tag}
                </div>
                <div className="absolute bottom-3 right-3 bg-emerald-600 text-white text-xs font-black px-3 py-1 rounded-xl shadow-md">
                  Avg: {formatINR(hoveredCity.avgBudget)}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{hoveredCity.name}</h3>
                  <span className="text-xs font-bold text-slate-500">{hoveredCity.state}</span>
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  <strong>Key Highlights:</strong> {hoveredCity.highlights}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Est. Cost Per Day</span>
                  <span className="font-extrabold text-brand-700">{formatINR(Math.round(hoveredCity.avgBudget / 5))}/day</span>
                </div>

                <button
                  onClick={() => navigate(`/trips/new?city=${hoveredCity.id}`)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-700 text-white px-5 py-2.5 rounded-2xl font-black text-xs shadow-md shadow-brand-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  <span>Plan Trip in {hoveredCity.name.split(' ')[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400">
              Hover over any point on the India map to preview destination highlights.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
