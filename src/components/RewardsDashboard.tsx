import React, { useState } from 'react';
import { UserProfile, CabinClass, FareFlexibility, Location } from '../types';
import { LOCATIONS } from '../data/mockData';
import { calculateFlightPoints, pointsToCurrencyValue } from '../utils/rewards';
import { Award, Sparkles, TrendingUp, Compass, Gift, Check, Plane, Star } from 'lucide-react';

interface RewardsDashboardProps {
  user: UserProfile;
}

export const RewardsDashboard: React.FC<RewardsDashboardProps> = ({ user }) => {
  // Simulator state
  const [originCode, setOriginCode] = useState<string>('JFK');
  const [destCode, setDestCode] = useState<string>('HND');
  const [simClass, setSimClass] = useState<CabinClass>('business');
  const [simFlex, setSimFlex] = useState<FareFlexibility>('superflex');

  const origin = LOCATIONS.find((l) => l.code === originCode) || LOCATIONS[0];
  const destination = LOCATIONS.find((l) => l.code === destCode) || LOCATIONS[2];

  // Dummy flight representation for calculation
  const mockSimFlight = {
    id: 'sim',
    flightNumber: 'SV-SIM',
    airline: 'Sky View Global',
    origin,
    destination,
    departureTime: '',
    arrivalTime: '',
    durationMinutes: 720,
    distanceMiles: destination.code === 'SYD' ? 9950 : destination.code === 'HND' ? 6737 : destination.code === 'DXB' ? 6836 : 3451,
    aircraft: 'Boeing 787-9',
    terminal: 'T4',
    gate: 'A1',
    basePrices: { economy: 800, premium_economy: 1400, business: 3500, first: 7000 },
    seats: [],
    availableSeatsCount: { economy: 50, premium_economy: 20, business: 10, first: 4 },
    stops: 0,
    onTimeRate: 98,
  };

  const simResult = calculateFlightPoints(mockSimFlight, simClass, simFlex, user.membershipTier);

  return (
    <div className="space-y-8">
      {/* Top Banner & Status Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tier & Balance Hero Card (2 cols) */}
        <div className="lg:col-span-2 bg-gradient-to-br from-white/10 via-white/5 to-indigo-950/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30 mb-2 backdrop-blur-sm">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Sky Club Loyalty Program</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {user.membershipTier} Tier Member
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Traveler: <strong className="text-white">{user.name}</strong> • Account #SV-9941
              </p>
            </div>

            <div className="text-right bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                Available SkyPoints
              </span>
              <div className="text-3xl font-black text-amber-400 mt-0.5">
                {user.pointsBalance.toLocaleString()}
              </div>
              <div className="text-xs font-semibold text-emerald-400 mt-1">
                ≈ ${pointsToCurrencyValue(user.pointsBalance).toLocaleString()} USD Value
              </div>
            </div>
          </div>

          {/* Tier Progress Bar */}
          <div className="mt-8 space-y-2 relative z-10">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">
                Tier Progress: <strong>{user.tierProgressMiles.toLocaleString()}</strong> /{' '}
                {user.nextTierMilesRequired.toLocaleString()} Miles
              </span>
              <span className="text-amber-300 font-bold">Diamond Club (Next Tier)</span>
            </div>
            <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-indigo-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (user.tierProgressMiles / user.nextTierMilesRequired) * 100)}%` }}
              ></div>
            </div>
            <div className="text-[11px] text-slate-400 text-right">
              {(user.nextTierMilesRequired - user.tierProgressMiles).toLocaleString()} miles needed to achieve Diamond Club status
            </div>
          </div>

          <div className="absolute right-0 -bottom-10 opacity-5 pointer-events-none">
            <Award className="w-80 h-80 text-amber-400" />
          </div>
        </div>

        {/* Quick Perks Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="text-xs font-bold uppercase text-indigo-400 tracking-wider mb-2 flex items-center gap-1.5">
              <Star className="w-4 h-4" />
              <span>Your Tier Benefits</span>
            </div>
            <h3 className="text-base font-bold text-white mb-3">Platinum Tier Privileges</h3>
            <ul className="text-xs space-y-2 text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>1.5x Multiplier on all flown miles</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Complimentary Sky Club Lounge Access</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Dedicated priority check-in & fast-track security</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>2 Free Extra Checked Bags (32kg each)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zero change fees on all standard international fares</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-white/10 text-[11px] text-slate-400">
            Valid through December 31, 2027
          </div>
        </div>
      </div>

      {/* ================= DESTINATION REWARDS SIMULATOR ================= */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 mb-2 backdrop-blur-sm">
            <Compass className="w-4 h-4" />
            <span>Interactive Flight Rewards Calculator</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Dynamic Points Accrual by International Destination
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Points are calibrated dynamically based on destination route prestige, great-circle distance, cabin class, and flexible fare option.
          </p>
        </div>

        {/* Selector Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300">Departure Hub</label>
            <select
              value={originCode}
              onChange={(e) => setOriginCode(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white mt-1 outline-none backdrop-blur-sm focus:border-indigo-500/50"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc.code} value={loc.code} className="bg-slate-900 text-white">
                  {loc.city} ({loc.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Arrival Destination</span>
              <span className="text-[10px] text-amber-400 font-bold">
                {destination.rewardBaseMultiplier}x Route Bonus
              </span>
            </label>
            <select
              value={destCode}
              onChange={(e) => setDestCode(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white mt-1 outline-none backdrop-blur-sm focus:border-indigo-500/50"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc.code} value={loc.code} className="bg-slate-900 text-white">
                  {loc.city} ({loc.code}) • {loc.rewardBaseMultiplier}x
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Cabin Class</label>
            <select
              value={simClass}
              onChange={(e) => setSimClass(e.target.value as any)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white mt-1 outline-none backdrop-blur-sm focus:border-indigo-500/50 capitalize"
            >
              <option value="economy" className="bg-slate-900 text-white">Economy (1.0x)</option>
              <option value="premium_economy" className="bg-slate-900 text-white">Premium Economy (1.5x)</option>
              <option value="business" className="bg-slate-900 text-white">Business Class Suite (2.25x)</option>
              <option value="first" className="bg-slate-900 text-white">First Class Suite (3.25x)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Fare Flexibility</label>
            <select
              value={simFlex}
              onChange={(e) => setSimFlex(e.target.value as any)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white mt-1 outline-none backdrop-blur-sm focus:border-indigo-500/50 capitalize"
            >
              <option value="standard" className="bg-slate-900 text-white">Standard (1.0x)</option>
              <option value="flex" className="bg-slate-900 text-white">Flex (1.1x)</option>
              <option value="superflex" className="bg-slate-900 text-white">SuperFlex (1.25x)</option>
            </select>
          </div>
        </div>

        {/* Calculated Results Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 items-center">
          <div className="md:col-span-1 text-center md:text-left">
            <span className="text-[11px] uppercase font-bold text-slate-400">Total Points to Earn</span>
            <div className="text-3xl sm:text-4xl font-black text-amber-400 mt-1">
              +{simResult.totalPoints.toLocaleString()}
            </div>
            <div className="text-xs text-emerald-400 font-semibold mt-0.5">
              ≈ ${pointsToCurrencyValue(simResult.totalPoints)} USD Reward Value
            </div>
          </div>

          <div className="md:col-span-2 space-y-1.5 text-xs text-slate-300 border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-6">
            <div className="font-bold text-white mb-2">Detailed Formula Calculation:</div>
            {simResult.breakdown.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-indigo-400">✦</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Destination Multipliers Comparison Grid */}
      <div>
        <h3 className="text-base font-bold text-white mb-3">Global Destination Prestige Table</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {LOCATIONS.map((loc) => (
            <div
              key={loc.code}
              onClick={() => setDestCode(loc.code)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all backdrop-blur-md ${
                destCode === loc.code
                  ? 'bg-amber-400/15 border-amber-400/60 text-white shadow-lg shadow-amber-400/10'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-indigo-400">{loc.code}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {loc.rewardBaseMultiplier}x Pts
                </span>
              </div>
              <div className="text-sm font-bold text-white truncate">{loc.city}</div>
              <div className="text-[11px] text-slate-400">{loc.region}</div>
              <div className="text-[10px] text-slate-400 mt-2 truncate">
                {loc.popularAttraction}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
