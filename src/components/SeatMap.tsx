import React, { useState } from 'react';
import { Seat, CabinClass } from '../types';
import { Armchair, Check, Info, ShieldAlert, Sparkles, User } from 'lucide-react';

interface SeatMapProps {
  seats: Seat[];
  selectedSeatIds: string[];
  onToggleSeat?: (seatId: string) => void;
  allowedClass?: CabinClass;
  maxSelectable?: number;
  readOnly?: boolean;
}

export const SeatMap: React.FC<SeatMapProps> = ({
  seats,
  selectedSeatIds,
  onToggleSeat,
  allowedClass,
  maxSelectable = 1,
  readOnly = false,
}) => {
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);
  const [activeFilterClass, setActiveFilterClass] = useState<CabinClass | 'all'>(allowedClass || 'all');

  // Filter seats if applicable
  const displaySeats = seats.filter((s) => {
    if (activeFilterClass === 'all') return true;
    return s.cabinClass === activeFilterClass;
  });

  // Group seats by row
  const rowsMap = new Map<number, Seat[]>();
  displaySeats.forEach((seat) => {
    if (!rowsMap.has(seat.row)) {
      rowsMap.set(seat.row, []);
    }
    rowsMap.get(seat.row)!.push(seat);
  });

  const sortedRowNumbers = Array.from(rowsMap.keys()).sort((a, b) => a - b);

  const getSeatColor = (seat: Seat) => {
    const isSelected = selectedSeatIds.includes(seat.id);
    if (isSelected) {
      return 'bg-amber-400 border-amber-500 text-slate-950 font-bold shadow-md shadow-amber-400/30 scale-105';
    }
    if (seat.status === 'occupied') {
      return 'bg-slate-700/60 border-slate-700 text-slate-500 cursor-not-allowed';
    }
    if (seat.status === 'blocked') {
      return 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed';
    }

    // Available by class
    switch (seat.cabinClass) {
      case 'first':
        return 'bg-violet-950/40 border-violet-500/50 text-violet-200 hover:bg-violet-600/40 hover:border-violet-400';
      case 'business':
        return 'bg-indigo-950/40 border-indigo-500/50 text-indigo-200 hover:bg-indigo-600/40 hover:border-indigo-400';
      case 'premium_economy':
        return 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200 hover:bg-emerald-600/40 hover:border-emerald-400';
      case 'economy':
      default:
        return 'bg-black/30 border-white/15 text-slate-300 hover:bg-indigo-950/40 hover:border-indigo-400';
    }
  };

  const handleSeatClick = (seat: Seat) => {
    if (readOnly || seat.status === 'occupied' || seat.status === 'blocked') return;
    if (allowedClass && seat.cabinClass !== allowedClass) return;
    if (onToggleSeat) {
      onToggleSeat(seat.id);
    }
  };

  return (
    <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-6 text-slate-100 shadow-xl">
      {/* Top Cabin Class Selector filter */}
      {!allowedClass && (
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Armchair className="w-4 h-4 text-indigo-400" />
            <span>Cabin Sections:</span>
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs">
            {(['all', 'first', 'business', 'premium_economy', 'economy'] as const).map((cls) => (
              <button
                key={cls}
                onClick={() => setActiveFilterClass(cls)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                  activeFilterClass === cls
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                {cls === 'all'
                  ? 'All Cabins'
                  : cls === 'premium_economy'
                  ? 'Premium Economy'
                  : cls.charAt(0).toUpperCase() + cls.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 text-xs mb-6">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-black/30 border border-white/20 flex items-center justify-center text-[10px]">
            •
          </div>
          <span className="text-slate-300">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-amber-400 border border-amber-500 flex items-center justify-center text-slate-950 font-bold text-[10px]">
            ✓
          </div>
          <span className="text-slate-300">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 text-[10px]">
            ✕
          </div>
          <span className="text-slate-400">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-indigo-500/20 border border-indigo-400 flex items-center justify-center text-indigo-400 text-[10px]">
            ★
          </div>
          <span className="text-slate-300">Exit / Extra Legroom</span>
        </div>
      </div>

      {/* Aircraft Fuselage Container */}
      <div className="relative max-w-xl mx-auto bg-black/30 backdrop-blur-md border-2 border-white/15 rounded-t-[100px] rounded-b-3xl p-4 sm:p-8 pt-12 shadow-2xl">
        {/* Cockpit Indicator */}
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          <div className="w-16 h-4 bg-white/10 rounded-t-full border-t border-x border-white/20 flex items-center justify-center">
            <span className="text-[9px] font-bold tracking-widest text-slate-300">COCKPIT</span>
          </div>
        </div>

        {/* Fuselage Nose Windows */}
        <div className="flex justify-center gap-3 mb-6">
          <div className="w-6 h-2 bg-indigo-400/40 rounded-full"></div>
          <div className="w-8 h-2 bg-indigo-400/50 rounded-full"></div>
          <div className="w-6 h-2 bg-indigo-400/40 rounded-full"></div>
        </div>

        {/* Seat Rows Matrix */}
        <div className="space-y-3.5">
          {sortedRowNumbers.map((rowNum) => {
            const rowSeats = rowsMap.get(rowNum) || [];
            const cabinClass = rowSeats[0]?.cabinClass || 'economy';
            const isExitRow = rowSeats.some((s) => s.features.includes('exit_row'));

            // Column arrangement depending on cabin class
            // First/Business: A -- D G -- K
            // Premium: A C -- D E F -- H K
            // Economy: A B C -- D E F -- H J K
            return (
              <div key={rowNum} className="relative">
                {/* Cabin Section Divider if beginning of cabin */}
                {(rowNum === 1 || rowNum === 3 || rowNum === 10 || rowNum === 20) && (
                  <div className="flex items-center gap-2 my-4 pt-2 border-t border-white/10">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                      {cabinClass.replace('_', ' ')}
                    </span>
                    <div className="flex-1 h-px bg-white/10"></div>
                  </div>
                )}

                {/* Exit Row marker */}
                {isExitRow && (
                  <div className="flex items-center justify-between text-[10px] font-bold text-amber-400 px-2 mb-1.5">
                    <span>EXIT ◀</span>
                    <span className="tracking-widest uppercase">Emergency Exit Row (Extra Space)</span>
                    <span>▶ EXIT</span>
                  </div>
                )}

                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  {/* Row number label left */}
                  <span className="w-6 text-center text-xs font-bold text-slate-500">
                    {rowNum}
                  </span>

                  {/* Seats in Row */}
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                    {rowSeats.map((seat, index) => {
                      const isSelected = selectedSeatIds.includes(seat.id);
                      const isAisleGap =
                        (cabinClass === 'first' && (seat.col === 'A' || seat.col === 'G')) ||
                        (cabinClass === 'business' && (seat.col === 'A' || seat.col === 'G')) ||
                        (cabinClass === 'premium_economy' && (seat.col === 'C' || seat.col === 'F')) ||
                        (cabinClass === 'economy' && (seat.col === 'C' || seat.col === 'F'));

                      const isClickable =
                        !readOnly &&
                        seat.status === 'available' &&
                        (!allowedClass || seat.cabinClass === allowedClass);

                      return (
                        <React.Fragment key={seat.id}>
                          <button
                            type="button"
                            disabled={!isClickable}
                            onClick={() => handleSeatClick(seat)}
                            onMouseEnter={() => setHoveredSeat(seat)}
                            onMouseLeave={() => setHoveredSeat(null)}
                            title={`Seat ${seat.id} (${seat.cabinClass.replace('_', ' ')}) - ${
                              seat.status === 'occupied' ? 'Occupied' : 'Click to select'
                            }`}
                            className={`relative rounded-md border text-xs font-semibold flex items-center justify-center transition-all ${
                              cabinClass === 'first'
                                ? 'w-10 h-11 sm:w-11 sm:h-12 text-sm'
                                : cabinClass === 'business'
                                ? 'w-9 h-10 sm:w-10 sm:h-11'
                                : 'w-7 h-8 sm:w-8 sm:h-9 text-[11px]'
                            } ${getSeatColor(seat)} ${
                              !isClickable && seat.status !== 'occupied' ? 'opacity-40 cursor-not-allowed' : ''
                            }`}
                          >
                            <span>{seat.col}</span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 absolute top-0.5 right-0.5 text-slate-950 stroke-[3]" />
                            )}
                            {seat.priceModifier > 0 && !isSelected && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-indigo-400"></span>
                            )}
                          </button>

                          {/* Aisle Spacer */}
                          {isAisleGap && (
                            <div className="w-4 sm:w-6 text-center text-[10px] text-slate-500 font-mono select-none">
                              |
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Row number label right */}
                  <span className="w-6 text-center text-xs font-bold text-slate-500">
                    {rowNum}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Aircraft Tail Wing Graphic */}
        <div className="mt-10 pt-4 border-t border-white/10 text-center">
          <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
            AFT GALLEY & LAVATORIES
          </div>
        </div>
      </div>

      {/* Hovered Seat Details Inspector */}
      {hoveredSeat && (
        <div className="mt-4 p-3 rounded-2xl bg-black/40 backdrop-blur-xl border border-indigo-500/40 flex items-center justify-between text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-500/30">
              {hoveredSeat.id}
            </div>
            <div>
              <div className="font-semibold text-slate-200 capitalize">
                {hoveredSeat.cabinClass.replace('_', ' ')} Class • Row {hoveredSeat.row}
              </div>
              <div className="text-slate-400 capitalize">
                {hoveredSeat.features.map((f) => f.replace('_', ' ')).join(' • ')}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-indigo-400">
              {hoveredSeat.priceModifier > 0 ? `+$${hoveredSeat.priceModifier}` : 'Standard Included'}
            </div>
            <div className="text-slate-400 capitalize">{hoveredSeat.status}</div>
          </div>
        </div>
      )}

      {/* Selection Status Summary */}
      {selectedSeatIds.length > 0 && !readOnly && (
        <div className="mt-4 p-3 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-amber-400" />
            <span className="text-slate-200 font-medium">
              Selected Seat: <strong className="text-amber-400 font-bold">{selectedSeatIds.join(', ')}</strong>
            </span>
          </div>
          <span className="text-slate-400">
            Click another seat to change selection
          </span>
        </div>
      )}
    </div>
  );
};
