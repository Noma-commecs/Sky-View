import React, { useState, useMemo } from 'react';
import { Flight, Location, CabinClass, FareFlexibility } from '../types';
import { LOCATIONS } from '../data/mockData';
import { Plane, Calendar, Clock, Sparkles, Filter, ChevronRight, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { calculateFlightPoints } from '../utils/rewards';

interface FlightSearchProps {
  flights: Flight[];
  onSelectFlight: (flight: Flight, cabinClass: CabinClass, flexibility: FareFlexibility) => void;
}

export const FlightSearch: React.FC<FlightSearchProps> = ({ flights, onSelectFlight }) => {
  const [originCode, setOriginCode] = useState<string>('all');
  const [destCode, setDestCode] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<CabinClass | 'all'>('all');
  const [selectedFlexibility, setSelectedFlexibility] = useState<FareFlexibility>('superflex');
  const [onlyDirect, setOnlyDirect] = useState<boolean>(false);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [sortBy, setSortBy] = useState<'price_asc' | 'duration' | 'points'>('price_asc');

  // Filter flights
  const filteredFlights = useMemo(() => {
    return flights.filter((flight) => {
      if (originCode !== 'all' && flight.origin.code !== originCode) return false;
      if (destCode !== 'all' && flight.destination.code !== destCode) return false;
      if (onlyDirect && flight.stops > 0) return false;

      // Price filter checking lowest available price
      const prices: number[] = [
        flight.basePrices.economy,
        flight.basePrices.premium_economy,
        flight.basePrices.business,
        flight.basePrices.first,
      ];
      const lowestPrice = Math.min(...prices);
      if (lowestPrice > maxPrice) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') {
        const pA = selectedClass === 'all' ? a.basePrices.economy : a.basePrices[selectedClass];
        const pB = selectedClass === 'all' ? b.basePrices.economy : b.basePrices[selectedClass];
        return pA - pB;
      }
      if (sortBy === 'duration') {
        return a.durationMinutes - b.durationMinutes;
      }
      if (sortBy === 'points') {
        const ptsA = calculateFlightPoints(a, 'business', selectedFlexibility).totalPoints;
        const ptsB = calculateFlightPoints(b, 'business', selectedFlexibility).totalPoints;
        return ptsB - ptsA;
      }
      return 0;
    });
  }, [flights, originCode, destCode, selectedClass, selectedFlexibility, onlyDirect, maxPrice, sortBy]);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' });
  };

  return (
    <div className="space-y-6">
      {/* Search Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>International Long-Haul Fleet & Dynamic Sky Club Rewards</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Reserve Your International Journey with <span className="text-indigo-400">Sky View</span>
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            Experience curated 4-class luxury, flexible international fare policies, live aircraft seat matrices, and destination-boosted loyalty points.
          </p>
        </div>

        {/* Decorative flight line graphic */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <Plane className="w-72 h-72 text-indigo-400 transform -rotate-12" />
        </div>
      </div>

      {/* Main Search Bar & Filter Controls */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Origin */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>From (Origin Hub)</span>
            </label>
            <select
              value={originCode}
              onChange={(e) => setOriginCode(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-indigo-500/50 backdrop-blur-md transition-all"
            >
              <option value="all" className="bg-slate-900 text-white">All Global Departure Hubs</option>
              {LOCATIONS.map((loc) => (
                <option key={loc.code} value={loc.code} className="bg-slate-900 text-white">
                  {loc.city} ({loc.code}) - {loc.country}
                </option>
              ))}
            </select>
          </div>

          {/* Destination */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>To (Destination)</span>
              <span className="text-[10px] text-amber-400 font-bold">Earn up to 1.65x pts</span>
            </label>
            <select
              value={destCode}
              onChange={(e) => setDestCode(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-indigo-500/50 backdrop-blur-md transition-all"
            >
              <option value="all" className="bg-slate-900 text-white">All Worldwide Destinations</option>
              {LOCATIONS.map((loc) => (
                <option key={loc.code} value={loc.code} className="bg-slate-900 text-white">
                  {loc.city} ({loc.code}) • {loc.rewardBaseMultiplier}x Points
                </option>
              ))}
            </select>
          </div>

          {/* Cabin Class Preference */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Cabin Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value as any)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-indigo-500/50 backdrop-blur-md transition-all capitalize"
            >
              <option value="all" className="bg-slate-900 text-white">All Available Classes</option>
              <option value="economy" className="bg-slate-900 text-white">Economy Class</option>
              <option value="premium_economy" className="bg-slate-900 text-white">Premium Economy</option>
              <option value="business" className="bg-slate-900 text-white">Business Class Suite</option>
              <option value="first" className="bg-slate-900 text-white">First Class Suite</option>
            </select>
          </div>

          {/* Fare Flexibility Preference */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Flexibility Tier</span>
              <span className="text-[10px] text-emerald-400 font-medium">Free Cancellation</span>
            </label>
            <select
              value={selectedFlexibility}
              onChange={(e) => setSelectedFlexibility(e.target.value as any)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-indigo-500/50 backdrop-blur-md transition-all capitalize"
            >
              <option value="superflex" className="bg-slate-900 text-white">SuperFlex (100% Refundable + Free Changes)</option>
              <option value="flex" className="bg-slate-900 text-white">Flex (Free Changes + 85% Refund)</option>
              <option value="standard" className="bg-slate-900 text-white">Standard (Non-Refundable)</option>
            </select>
          </div>
        </div>

        {/* Quick Toggles & Sorting Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setOnlyDirect(!onlyDirect)}
              className={`px-3 py-1.5 rounded-xl border font-medium transition-all ${
                onlyDirect
                  ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Direct Flights Only
            </button>

            <button
              onClick={() => {
                setOriginCode('all');
                setDestCode('HND');
              }}
              className={`px-3 py-1.5 rounded-xl border font-medium transition-all ${
                destCode === 'HND'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Tokyo Haneda (1.5x pts)
            </button>

            <button
              onClick={() => {
                setOriginCode('all');
                setDestCode('SYD');
              }}
              className={`px-3 py-1.5 rounded-xl border font-medium transition-all ${
                destCode === 'SYD'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Sydney Australia (1.65x pts)
            </button>

            <button
              onClick={() => {
                setOriginCode('all');
                setDestCode('DXB');
              }}
              className={`px-3 py-1.5 rounded-xl border font-medium transition-all ${
                destCode === 'DXB'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Dubai UAE (1.45x pts)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-black/40 border border-white/10 rounded-xl px-2.5 py-1 text-slate-200 text-xs outline-none focus:border-indigo-500/50 backdrop-blur-md"
            >
              <option value="price_asc" className="bg-slate-900 text-white">Lowest Price</option>
              <option value="duration" className="bg-slate-900 text-white">Shortest Duration</option>
              <option value="points" className="bg-slate-900 text-white">Highest Reward Points</option>
            </select>
          </div>
        </div>
      </div>

      {/* Flight Results Header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>Available Scheduled Flights</span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-indigo-300 border border-white/10">
            {filteredFlights.length} Routes Found
          </span>
        </h2>
        <div className="text-xs text-slate-400">
          Showing real-time aircraft status & seat counts
        </div>
      </div>

      {/* Flight Cards Grid */}
      <div className="space-y-4">
        {filteredFlights.map((flight) => {
          const hours = Math.floor(flight.durationMinutes / 60);
          const minutes = flight.durationMinutes % 60;
          const pointsInfo = calculateFlightPoints(flight, 'business', selectedFlexibility);

          return (
            <div
              key={flight.id}
              className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-3xl p-5 sm:p-6 transition-all shadow-xl hover:shadow-indigo-500/10 group"
            >
              {/* Top metadata strip */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-white/10 text-xs">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-1.5 text-indigo-400 font-bold tracking-wider">
                    <Plane className="w-3.5 h-3.5 transform -rotate-45" />
                    <span>{flight.flightNumber}</span>
                  </div>
                  <span className="text-white/20">•</span>
                  <span className="text-slate-300 font-medium">{flight.aircraft}</span>
                  <span className="text-white/20 hidden sm:inline">•</span>
                  <span className="text-slate-400 hidden sm:inline">
                    Terminal {flight.terminal}, Gate {flight.gate}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 text-[11px] font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    {flight.onTimeRate}% On-Time
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/20 text-[11px] font-medium">
                    <Sparkles className="w-3 h-3" />
                    +{pointsInfo.totalPoints.toLocaleString()} SkyPoints
                  </span>
                </div>
              </div>

              {/* Main Flight Routing Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Flight Route & Timings (7 cols) */}
                <div className="lg:col-span-7 grid grid-cols-7 items-center gap-2 text-center sm:text-left">
                  {/* Departure */}
                  <div className="col-span-3 text-left">
                    <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      {formatTime(flight.departureTime)}
                    </div>
                    <div className="text-base font-bold text-indigo-400 mt-0.5">
                      {flight.origin.code}
                    </div>
                    <div className="text-xs text-slate-300 truncate">
                      {flight.origin.city}, {flight.origin.country}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {formatDate(flight.departureTime)}
                    </div>
                  </div>

                  {/* Duration Path Graphic */}
                  <div className="col-span-1 flex flex-col items-center justify-center">
                    <span className="text-[11px] font-semibold text-slate-400 mb-1">
                      {hours}h {minutes}m
                    </span>
                    <div className="relative w-full flex items-center justify-center">
                      <div className="w-full h-0.5 bg-white/20"></div>
                      <div className="absolute w-2 h-2 rounded-full bg-indigo-400 -left-1"></div>
                      <Plane className="w-3.5 h-3.5 text-indigo-400 transform rotate-90 mx-auto" />
                      <div className="absolute w-2 h-2 rounded-full bg-indigo-400 -right-1"></div>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-medium mt-1">
                      {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop`}
                    </span>
                  </div>

                  {/* Arrival */}
                  <div className="col-span-3 text-right">
                    <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      {formatTime(flight.arrivalTime)}
                    </div>
                    <div className="text-base font-bold text-indigo-400 mt-0.5">
                      {flight.destination.code}
                    </div>
                    <div className="text-xs text-slate-300 truncate">
                      {flight.destination.city}, {flight.destination.country}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {formatDate(flight.arrivalTime)}
                    </div>
                  </div>
                </div>

                {/* Cabin Class Options Matrix (5 cols) */}
                <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 lg:pt-0 lg:border-l lg:border-white/10 lg:pl-6">
                  {/* Economy */}
                  <button
                    onClick={() => onSelectFlight(flight, 'economy', selectedFlexibility)}
                    className="p-2.5 rounded-2xl bg-black/20 hover:bg-white/10 border border-white/10 hover:border-indigo-400/40 text-left transition-all group/btn backdrop-blur-sm"
                  >
                    <div className="text-[10px] uppercase font-bold text-slate-400 group-hover/btn:text-indigo-300">
                      Economy
                    </div>
                    <div className="text-base font-bold text-white mt-1">
                      ${flight.basePrices.economy}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {flight.availableSeatsCount.economy} seats
                    </div>
                  </button>

                  {/* Premium Economy */}
                  <button
                    onClick={() => onSelectFlight(flight, 'premium_economy', selectedFlexibility)}
                    className="p-2.5 rounded-2xl bg-black/20 hover:bg-white/10 border border-white/10 hover:border-emerald-400/40 text-left transition-all group/btn backdrop-blur-sm"
                  >
                    <div className="text-[10px] uppercase font-bold text-emerald-400">
                      Premium
                    </div>
                    <div className="text-base font-bold text-white mt-1">
                      ${flight.basePrices.premium_economy}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {flight.availableSeatsCount.premium_economy} seats
                    </div>
                  </button>

                  {/* Business */}
                  <button
                    onClick={() => onSelectFlight(flight, 'business', selectedFlexibility)}
                    className="p-2.5 rounded-2xl bg-indigo-950/30 hover:bg-indigo-900/40 border border-indigo-500/30 hover:border-indigo-400/60 text-left transition-all group/btn backdrop-blur-sm ring-1 ring-indigo-500/20"
                  >
                    <div className="text-[10px] uppercase font-bold text-indigo-300">
                      Business
                    </div>
                    <div className="text-base font-bold text-white mt-1">
                      ${flight.basePrices.business}
                    </div>
                    <div className="text-[10px] text-indigo-300/80 mt-0.5">
                      {flight.availableSeatsCount.business} left
                    </div>
                  </button>

                  {/* First Class */}
                  <button
                    onClick={() => onSelectFlight(flight, 'first', selectedFlexibility)}
                    className="p-2.5 rounded-2xl bg-violet-950/30 hover:bg-violet-900/40 border border-violet-500/30 hover:border-violet-400/60 text-left transition-all group/btn backdrop-blur-sm"
                  >
                    <div className="text-[10px] uppercase font-bold text-violet-300">
                      First Suite
                    </div>
                    <div className="text-base font-bold text-white mt-1">
                      ${flight.basePrices.first}
                    </div>
                    <div className="text-[10px] text-violet-300/80 mt-0.5">
                      {flight.availableSeatsCount.first} suites
                    </div>
                  </button>
                </div>
              </div>

              {/* Perks & Flexibility Guarantee Footer */}
              <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{selectedFlexibility === 'superflex' ? '100% Refundable Fare Selected' : 'Flexible Date Changes'}</span>
                  </span>
                  <span className="hidden sm:inline text-slate-400">
                    Distance: {flight.distanceMiles.toLocaleString()} miles
                  </span>
                </div>

                <button
                  onClick={() => onSelectFlight(flight, selectedClass === 'all' ? 'business' : selectedClass, selectedFlexibility)}
                  className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold group-hover:translate-x-1 transition-transform"
                >
                  <span>Select Seats & Book</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredFlights.length === 0 && (
          <div className="text-center py-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <Plane className="w-12 h-12 text-slate-600 mx-auto mb-3 transform -rotate-45" />
            <h3 className="text-lg font-bold text-white">No Flights Matched Your Criteria</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
              Try adjusting your departure hub or destination filter to view our international scheduled services.
            </p>
            <button
              onClick={() => {
                setOriginCode('all');
                setDestCode('all');
                setSelectedClass('all');
              }}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
