import React from 'react';
import { Plane, Compass, Ticket, Award, User, Bell, FileCode, RotateCcw } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  activeTab: 'search' | 'seats' | 'bookings' | 'rewards' | 'profile';
  setActiveTab: (tab: 'search' | 'seats' | 'bookings' | 'rewards' | 'profile') => void;
  user: UserProfile;
  unreadEmailCount: number;
  onOpenEmails: () => void;
  onOpenPromptSpec: () => void;
  onResetDb: () => void;
  bookingCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  unreadEmailCount,
  onOpenEmails,
  onOpenPromptSpec,
  onResetDb,
  bookingCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-black/40 backdrop-blur-2xl border-b border-white/10 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            id="brand-logo"
            onClick={() => setActiveTab('search')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Plane className="w-5 h-5 text-white transform -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  Sky View
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Global
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider">International Aviation & Reservations</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              id="nav-search-btn"
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'search'
                  ? 'bg-white/10 text-white border border-white/15 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Compass className={`w-4 h-4 ${activeTab === 'search' ? 'text-indigo-400' : ''}`} />
              <span>Book Flights</span>
            </button>

            <button
              id="nav-seats-btn"
              onClick={() => setActiveTab('seats')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'seats'
                  ? 'bg-white/10 text-white border border-white/15 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Plane className={`w-4 h-4 ${activeTab === 'seats' ? 'text-indigo-400' : ''}`} />
              <span>Fleet & Seat Maps</span>
            </button>

            <button
              id="nav-bookings-btn"
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all relative ${
                activeTab === 'bookings'
                  ? 'bg-white/10 text-white border border-white/15 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Ticket className={`w-4 h-4 ${activeTab === 'bookings' ? 'text-indigo-400' : ''}`} />
              <span>My Trips</span>
              {bookingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-600 text-white shadow-sm shadow-indigo-600/30">
                  {bookingCount}
                </span>
              )}
            </button>

            <button
              id="nav-rewards-btn"
              onClick={() => setActiveTab('rewards')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'rewards'
                  ? 'bg-white/10 text-white border border-white/15 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Sky Club Rewards</span>
              <span className="text-xs font-semibold text-amber-400/90 ml-0.5">
                {(user.pointsBalance || 0).toLocaleString()} pts
              </span>
            </button>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2">
            {/* Realtime Email Dispatch / Notifications */}
            <button
              id="nav-email-inbox-btn"
              onClick={onOpenEmails}
              title="Real-time Email Notifications"
              className="relative p-2.5 rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all"
            >
              <Bell className="w-4 h-4" />
              {unreadEmailCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500 text-[10px] font-bold text-white items-center justify-center">
                    {unreadEmailCount}
                  </span>
                </span>
              )}
            </button>

            {/* Prompt Specification Modal Button */}
            <button
              id="nav-prompt-spec-btn"
              onClick={onOpenPromptSpec}
              title="View Master Prompt & System Architecture"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 backdrop-blur-md transition-all"
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-400" />
              <span>Prompt Spec</span>
            </button>

            {/* Profile Button */}
            <button
              id="nav-profile-btn"
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border transition-all ${
                activeTab === 'profile'
                  ? 'bg-white/15 border-white/20 text-white shadow-sm'
                  : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5 border border-white/20">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-bold text-white">
                  AS
                </div>
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-semibold leading-none">{user.name.split(' ')[0]}</div>
                <div className="text-[10px] text-indigo-300 font-medium leading-none mt-0.5">
                  {user.membershipTier}
                </div>
              </div>
            </button>

            {/* Reset Database Button */}
            <button
              id="nav-reset-db-btn"
              onClick={onResetDb}
              title="Reset Demo Data"
              className="p-2.5 rounded-xl text-slate-400 hover:text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden border-t border-white/10 py-2 justify-around text-xs">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex flex-col items-center gap-1 py-1 px-2 ${
              activeTab === 'search' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Search</span>
          </button>
          <button
            onClick={() => setActiveTab('seats')}
            className={`flex flex-col items-center gap-1 py-1 px-2 ${
              activeTab === 'seats' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Plane className="w-4 h-4" />
            <span>Seat Map</span>
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex flex-col items-center gap-1 py-1 px-2 ${
              activeTab === 'bookings' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Trips ({bookingCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex flex-col items-center gap-1 py-1 px-2 ${
              activeTab === 'rewards' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Rewards</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 py-1 px-2 ${
              activeTab === 'profile' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>
        </div>
      </div>
    </header>
  );
};
