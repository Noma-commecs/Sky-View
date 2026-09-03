import React, { useState } from 'react';
import { Flight, Seat } from '../types';
import { SeatMap } from './SeatMap';
import { Plane, Users, CheckCircle, ShieldCheck, Sparkles, Clock, MapPin } from 'lucide-react';

interface FleetExplorerProps {
  flights: Flight[];
  onSelectFlightToBook: (flight: Flight) => void;
}

export const FleetExplorer: React.FC<FleetExplorerProps> = ({ flights, onSelectFlightToBook }) => {
  const [selectedFlightId, setSelectedFlightId] = useState<string>(flights[0]?.id || '');

  const currentFlight = flights.find((f) => f.id === selectedFlightId) || flights[0];

  if (!currentFlight) return null;

  const totalSeats = currentFlight.seats.length;
  const occupiedSeats = currentFlight.seats.filter((s) => s.status === 'occupied').length;
  const availableSeats = totalSeats - occupiedSeats;
  const occupancyPercentage = Math.round((occupiedSeats / totalSeats) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Fleet Operations & Aircraft Cabin Explorer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time live seat inventory, cabin configurations, and availability across active international aircraft.
          </p>
        </div>

        {/* Flight Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Select Flight:</span>
          <select
            value={selectedFlightId}
            onChange={(e) => setSelectedFlightId(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold outline-none focus:border-indigo-500/50 backdrop-blur-md"
          >
            {flights.map((f) => (
              <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                {f.flightNumber}: {f.origin.code} ➔ {f.destination.code} ({f.aircraft})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Aircraft Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Aircraft Model</span>
            <Plane className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-lg font-bold text-white mt-1">{currentFlight.aircraft}</div>
          <div className="text-[11px] text-indigo-400 font-semibold mt-0.5">
            Flight {currentFlight.flightNumber}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Route</span>
            <MapPin className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-white mt-1">
            {currentFlight.origin.code} ➔ {currentFlight.destination.code}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {currentFlight.origin.city} to {currentFlight.destination.city}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Live Cabin Load</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-white mt-1">
            {availableSeats} Seats Open ({occupancyPercentage}% full)
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Total Capacity: {totalSeats} seats
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Action</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <button
            onClick={() => onSelectFlightToBook(currentFlight)}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/25 mt-2"
          >
            Book Seats on this Flight
          </button>
        </div>
      </div>

      {/* Interactive Seat Map View */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Live Cabin Seat Map</span>
            <span className="text-xs font-normal text-slate-400">
              (Interactive: hover over any seat to inspect amenities and price tier)
            </span>
          </h3>
        </div>

        <SeatMap seats={currentFlight.seats} selectedSeatIds={[]} readOnly={false} />
      </div>
    </div>
  );
};
