import React, { useState } from 'react';
import { UserProfile, CabinClass } from '../types';
import { LOCATIONS } from '../data/mockData';
import { User, Shield, CreditCard, Award, Save, Check, Plane, Globe, Calendar, Mail, Phone, Lock } from 'lucide-react';

interface UserProfileViewProps {
  user: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ user, onUpdateProfile }) => {
  const [formData, setFormData] = useState<UserProfile>(user);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Traveler Profile & Preferences</h2>
          <p className="text-xs text-slate-400 mt-1">
            Maintain your international passport credentials, frequent flyer preferences, and saved payment profiles.
          </p>
        </div>
        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>Profile Updated Successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Tier & ID Summary Card */}
        <div className="bg-gradient-to-r from-white/10 via-white/5 to-indigo-950/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-500 flex items-center justify-center text-xl font-black text-white shadow-lg">
              AS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">{formData.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {formData.membershipTier} Member
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">Sky View Member ID: #SV-9941-INTL</p>
            </div>
          </div>

          <div className="text-right bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total SkyPoints Balance</span>
            <div className="text-2xl font-black text-amber-400">
              {formData.pointsBalance.toLocaleString()} pts
            </div>
          </div>
        </div>

        {/* Section 1: Personal & Contact Information */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Personal & Contact Credentials</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300">Full Legal Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white mt-1 outline-none backdrop-blur-sm focus:border-indigo-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Email Address (E-Ticket Delivery)</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white mt-1 outline-none backdrop-blur-sm focus:border-indigo-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Mobile Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white mt-1 outline-none backdrop-blur-sm focus:border-indigo-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Home Origin Airport</label>
              <select
                value={formData.homeAirport}
                onChange={(e) => setFormData({ ...formData, homeAirport: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white mt-1 outline-none backdrop-blur-sm focus:border-indigo-500/50"
              >
                {LOCATIONS.map((l) => (
                  <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                    {l.city} ({l.code}) - {l.airportName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Passport & International Travel Documents */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span>International Border & Passport Verification</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300">Passport Number</label>
              <input
                type="text"
                value={formData.passportNumber}
                onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white mt-1 uppercase outline-none backdrop-blur-sm focus:border-indigo-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Passport Expiry Date</label>
              <input
                type="date"
                value={formData.passportExpiry}
                onChange={(e) => setFormData({ ...formData, passportExpiry: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white mt-1 outline-none backdrop-blur-sm focus:border-indigo-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Nationality</label>
              <input
                type="text"
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white mt-1 outline-none backdrop-blur-sm focus:border-indigo-500/50"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Inflight Preferences */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <Plane className="w-4 h-4" />
            <span>Inflight Comfort & Dining Preferences</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300">Default Cabin Class Preference</label>
              <select
                value={formData.preferredCabinClass}
                onChange={(e) => setFormData({ ...formData, preferredCabinClass: e.target.value as any })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white mt-1 outline-none backdrop-blur-sm focus:border-indigo-500/50 capitalize"
              >
                <option value="economy" className="bg-slate-900 text-white">Economy</option>
                <option value="premium_economy" className="bg-slate-900 text-white">Premium Economy</option>
                <option value="business" className="bg-slate-900 text-white">Business Class Suite</option>
                <option value="first" className="bg-slate-900 text-white">First Class Suite</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Dietary & Meal Selection</label>
              <select
                value={formData.preferredMeal}
                onChange={(e) => setFormData({ ...formData, preferredMeal: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white mt-1 outline-none backdrop-blur-sm focus:border-indigo-500/50"
              >
                <option className="bg-slate-900 text-white">Standard Gourmet Dining</option>
                <option className="bg-slate-900 text-white">Asian Vegetarian (AVML)</option>
                <option className="bg-slate-900 text-white">Seafood Special (SFML)</option>
                <option className="bg-slate-900 text-white">Gluten-Friendly (GFML)</option>
                <option className="bg-slate-900 text-white">Halal Certified (MOML)</option>
                <option className="bg-slate-900 text-white">Kosher Dining (KSML)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Saved Cards */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span>Saved Payment Methods</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {formData.savedCards.map((card) => (
              <div
                key={card.id}
                className="p-4 rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center font-bold text-white font-mono">
                    {card.brand}
                  </div>
                  <div>
                    <div className="font-bold text-white">•••• •••• •••• {card.last4}</div>
                    <div className="text-slate-400">Expires {card.expiry}</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Verified
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all shadow-lg shadow-indigo-600/25"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
