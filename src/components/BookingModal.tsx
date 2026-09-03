import React, { useState } from 'react';
import { Flight, CabinClass, FareFlexibility, Passenger, Booking, BookingAddons, UserProfile } from '../types';
import { SeatMap } from './SeatMap';
import { calculateFlightPoints, pointsToCurrencyValue } from '../utils/rewards';
import {
  X, Check, Plane, Shield, CreditCard, Sparkles, User, Luggage, Coffee,
  HeartHandshake, Leaf, ArrowRight, ArrowLeft, Lock, Info, Calendar, Phone, Mail
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookingModalProps {
  flight: Flight;
  initialClass: CabinClass;
  initialFlexibility: FareFlexibility;
  user: UserProfile;
  onClose: () => void;
  onConfirmBooking: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  flight,
  initialClass,
  initialFlexibility,
  user,
  onClose,
  onConfirmBooking,
}) => {
  const [step, setStep] = useState<number>(1); // 1: Class/Flex, 2: Seats, 3: Passenger, 4: Addons, 5: Payment, 6: Success
  const [cabinClass, setCabinClass] = useState<CabinClass>(initialClass);
  const [flexibility, setFlexibility] = useState<FareFlexibility>(initialFlexibility);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);

  // Passenger form
  const [passenger, setPassenger] = useState<Passenger>({
    id: `p-${Date.now()}`,
    title: 'Mr',
    firstName: user.name.split(' ')[0] || 'Alexander',
    lastName: user.name.split(' ')[1] || 'Sterling',
    email: user.email || 'a.sterling@skyview-member.com',
    phone: user.phone || '+1 (555) 234-8901',
    passportNumber: user.passportNumber || 'PA98471205',
    nationality: user.nationality || 'United States',
    dateOfBirth: '1988-06-15',
    mealPreference: user.preferredMeal || 'Standard Gourmet',
  });

  // Addons
  const [addons, setAddons] = useState<BookingAddons>({
    extraBaggageCount: 0,
    loungeAccess: cabinClass === 'business' || cabinClass === 'first',
    travelInsurance: true,
    carbonOffset: true,
    priorityBoarding: cabinClass !== 'economy',
  });

  // Payment
  const [paymentType, setPaymentType] = useState<'card' | 'points' | 'split'>('card');
  const [cardNumber, setCardNumber] = useState<string>('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState<string>('09/28');
  const [cardCvc, setCardCvc] = useState<string>('884');
  const [cardName, setCardName] = useState<string>(user.name);
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  // Price calculations
  const baseFare = flight.basePrices[cabinClass];
  const flexibilityFee = flexibility === 'superflex' ? 150 : flexibility === 'flex' ? 60 : 0;
  
  // Seat fees
  const selectedSeat = flight.seats.find((s) => selectedSeatIds.includes(s.id));
  const seatFee = selectedSeat ? selectedSeat.priceModifier : 0;

  // Addon fees
  const extraBaggageFee = addons.extraBaggageCount * 65;
  const loungeFee = addons.loungeAccess && cabinClass !== 'business' && cabinClass !== 'first' ? 75 : 0;
  const insuranceFee = addons.travelInsurance ? 45 : 0;
  const carbonFee = addons.carbonOffset ? 15 : 0;
  const priorityFee = addons.priorityBoarding && cabinClass === 'economy' ? 30 : 0;
  const addonsTotal = extraBaggageFee + loungeFee + insuranceFee + carbonFee + priorityFee;

  const taxes = Math.round((baseFare + flexibilityFee + seatFee) * 0.08);
  const subtotal = baseFare + flexibilityFee + seatFee + addonsTotal + taxes;
  const pointsDiscount = pointsToCurrencyValue(pointsToRedeem);
  const finalPrice = Math.max(0, subtotal - pointsDiscount);

  // Points earned
  const pointsInfo = calculateFlightPoints(flight, cabinClass, flexibility, user.membershipTier);

  // Toggle seat selection
  const handleToggleSeat = (seatId: string) => {
    setSelectedSeatIds([seatId]);
  };

  // Payment Submission
  const handleProcessPayment = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const randomPNR = `SV-${Math.floor(100 + Math.random() * 900)}${String.fromCharCode(
        65 + Math.floor(Math.random() * 26)
      )}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;

      const newBooking: Booking = {
        id: `bk-${Date.now()}`,
        bookingReference: randomPNR,
        flightId: flight.id,
        flight,
        cabinClass,
        flexibility,
        passengers: [{ ...passenger, assignedSeatId: selectedSeatIds[0] || '12A' }],
        selectedSeatIds: selectedSeatIds.length > 0 ? selectedSeatIds : ['12A'],
        addons,
        baseFareTotal: baseFare,
        flexibilityFee,
        seatsFee: seatFee,
        addonsTotal,
        taxesAndFees: taxes,
        discount: pointsDiscount,
        totalPrice: finalPrice,
        currency: 'USD',
        pointsEarned: pointsInfo.totalPoints,
        pointsRedeemed: pointsToRedeem,
        paymentMethod: {
          type: paymentType,
          cardLast4: paymentType === 'card' ? '4242' : undefined,
          cardBrand: paymentType === 'card' ? 'Visa' : undefined,
        },
        status: 'confirmed',
        bookedAt: new Date().toISOString(),
      };

      setCreatedBooking(newBooking);
      onConfirmBooking(newBooking);
      setStep(6);

      // Trigger celebration confetti!
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore if iframe blocks confetti
      }
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6">
      <div className="bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header Modal Bar */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Plane className="w-5 h-5 transform -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white">
                  {flight.flightNumber} • {flight.origin.code} ➔ {flight.destination.code}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {flight.aircraft}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {flight.origin.city} to {flight.destination.city} • Terminal {flight.terminal}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="bg-black/30 backdrop-blur-md px-6 py-2.5 border-b border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1 sm:gap-4 overflow-x-auto py-1">
            {[
              { num: 1, label: 'Fare & Cabin' },
              { num: 2, label: 'Seat Selection' },
              { num: 3, label: 'Passenger' },
              { num: 4, label: 'Add-ons' },
              { num: 5, label: 'Payment' },
            ].map((s) => (
              <div
                key={s.num}
                className={`flex items-center gap-1.5 whitespace-nowrap ${
                  step === s.num
                    ? 'text-indigo-400 font-bold'
                    : step > s.num
                    ? 'text-emerald-400'
                    : 'text-slate-500'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    step === s.num
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : step > s.num
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-white/5 text-slate-500 border border-white/10'
                  }`}
                >
                  {step > s.num ? '✓' : s.num}
                </div>
                <span className="hidden sm:inline">{s.label}</span>
                {s.num < 5 && <span className="text-slate-700 hidden sm:inline">›</span>}
              </div>
            ))}
          </div>

          <div className="text-right whitespace-nowrap pl-2">
            <span className="text-xs text-slate-400">Total: </span>
            <strong className="text-sm font-extrabold text-white">
              ${finalPrice.toLocaleString()}
            </strong>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* ================= STEP 1: CABIN CLASS & FARE FLEXIBILITY ================= */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Choose Your Cabin Experience</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select your preferred seating standard and inflight amenities for this international flight.
                </p>
              </div>

              {/* Cabin Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    id: 'economy' as CabinClass,
                    title: 'Economy',
                    price: flight.basePrices.economy,
                    seatsLeft: flight.availableSeatsCount.economy,
                    perks: ['Standard 31" pitch', 'Complimentary meals', '1x 23kg Checked Bag'],
                  },
                  {
                    id: 'premium_economy' as CabinClass,
                    title: 'Premium Economy',
                    price: flight.basePrices.premium_economy,
                    seatsLeft: flight.availableSeatsCount.premium_economy,
                    perks: ['Extra legroom 38" pitch', 'Priority boarding', '2x 23kg Checked Bags'],
                  },
                  {
                    id: 'business' as CabinClass,
                    title: 'Business Suite',
                    price: flight.basePrices.business,
                    seatsLeft: flight.availableSeatsCount.business,
                    badge: 'Most Popular',
                    perks: ['180° Lie-Flat Bed', 'Direct Aisle Access', 'Sky Club Lounge Access', '2x 32kg Baggage'],
                  },
                  {
                    id: 'first' as CabinClass,
                    title: 'First Class Suite',
                    price: flight.basePrices.first,
                    seatsLeft: flight.availableSeatsCount.first,
                    perks: ['Private Enclosed Suite', 'Caviar & Dom Pérignon', 'VIP Chauffeur Service', 'Dedicated Concierge'],
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setCabinClass(item.id)}
                    className={`relative p-4 rounded-2xl border cursor-pointer transition-all ${
                      cabinClass === item.id
                        ? 'bg-indigo-500/15 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/10'
                        : 'bg-white/5 backdrop-blur-md border-white/10 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    {item.badge && (
                      <span className="absolute -top-2.5 right-4 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                        {item.badge}
                      </span>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">{item.title}</span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          cabinClass === item.id ? 'border-indigo-400 bg-indigo-500 text-white' : 'border-slate-600'
                        }`}
                      >
                        {cabinClass === item.id && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                    <div className="text-xl font-extrabold text-indigo-400 mt-2">
                      ${item.price.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-400 mb-3">{item.seatsLeft} seats left</div>
                    <ul className="text-xs space-y-1 text-slate-300 border-t border-white/10 pt-2">
                      {item.perks.map((p, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Flexibility Choice */}
              <div className="pt-4 border-t border-white/10">
                <h3 className="text-base font-bold text-white mb-1">
                  Select International Travel Flexibility
                </h3>
                <p className="text-xs text-slate-400 mb-3">
                  Peace of mind with guaranteed refundable policies for international travelers.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'standard' as FareFlexibility,
                      title: 'Standard',
                      fee: '+$0',
                      pointsBonus: '1.0x Points',
                      refundDesc: 'Non-refundable (Tax recovery only)',
                      changeFee: '$150 date change fee',
                    },
                    {
                      id: 'flex' as FareFlexibility,
                      title: 'Flex Fare',
                      fee: '+$60',
                      pointsBonus: '1.1x Points',
                      refundDesc: '85% Cash refund or 100% airline credit voucher',
                      changeFee: 'Free date changes',
                    },
                    {
                      id: 'superflex' as FareFlexibility,
                      title: 'SuperFlex (Freedom)',
                      fee: '+$150',
                      pointsBonus: '1.25x Points Boost',
                      badge: 'Recommended',
                      refundDesc: '100% Full cash refund up to 2h before flight',
                      changeFee: 'Free unlimited changes + Priority standby',
                    },
                  ].map((flex) => (
                    <div
                      key={flex.id}
                      onClick={() => setFlexibility(flex.id)}
                      className={`relative p-4 rounded-2xl border cursor-pointer transition-all ${
                        flexibility === flex.id
                          ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/30'
                          : 'bg-white/5 backdrop-blur-md border-white/10 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      {flex.badge && (
                        <span className="absolute -top-2.5 right-4 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {flex.badge}
                        </span>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{flex.title}</span>
                        <span className="text-xs font-extrabold text-emerald-400">{flex.fee}</span>
                      </div>
                      <div className="text-xs font-semibold text-amber-400 mt-1">{flex.pointsBonus}</div>
                      <div className="text-xs text-slate-300 mt-2 space-y-1">
                        <div>✓ {flex.refundDesc}</div>
                        <div>✓ {flex.changeFee}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rewards Accrual Preview */}
              <div className="bg-amber-400/10 backdrop-blur-md border border-amber-400/20 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold border border-amber-400/30">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-amber-300">
                      You will earn +{pointsInfo.totalPoints.toLocaleString()} Sky Club Points
                    </div>
                    <div className="text-xs text-slate-300">
                      Includes {flight.destination.city} destination multiplier (
                      {flight.destination.rewardBaseMultiplier}x) and {user.membershipTier} status tier.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: SEAT SELECTION ================= */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-white">Select Your Aircraft Seat</h3>
                  <p className="text-xs text-slate-400">
                    Aircraft: {flight.aircraft} • Filtering for {cabinClass.replace('_', ' ')} section
                  </p>
                </div>
                {selectedSeatIds.length > 0 && (
                  <div className="px-3 py-1.5 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
                    Seat: {selectedSeatIds.join(', ')} ({seatFee > 0 ? `+$${seatFee}` : 'Included'})
                  </div>
                )}
              </div>

              <SeatMap
                seats={flight.seats}
                selectedSeatIds={selectedSeatIds}
                onToggleSeat={handleToggleSeat}
                allowedClass={cabinClass}
              />
            </div>
          )}

          {/* ================= STEP 3: PASSENGER & PASSPORT DETAILS ================= */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white">Passenger & International Travel Documents</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Enter official passport details matching your government-issued ID for border pre-clearance.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300">Title</label>
                    <select
                      value={passenger.title}
                      onChange={(e) => setPassenger({ ...passenger, title: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white mt-1 outline-none focus:border-indigo-500/50 backdrop-blur-sm"
                    >
                      <option className="bg-slate-900 text-white">Mr</option>
                      <option className="bg-slate-900 text-white">Ms</option>
                      <option className="bg-slate-900 text-white">Mrs</option>
                      <option className="bg-slate-900 text-white">Dr</option>
                      <option className="bg-slate-900 text-white">Capt</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300">First Name</label>
                    <input
                      type="text"
                      value={passenger.firstName}
                      onChange={(e) => setPassenger({ ...passenger, firstName: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white mt-1 outline-none focus:border-indigo-500/50 backdrop-blur-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-300">Last Name</label>
                    <input
                      type="text"
                      value={passenger.lastName}
                      onChange={(e) => setPassenger({ ...passenger, lastName: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white mt-1 outline-none focus:border-indigo-500/50 backdrop-blur-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Email for E-Ticket Delivery</span>
                    </label>
                    <input
                      type="email"
                      value={passenger.email}
                      onChange={(e) => setPassenger({ ...passenger, email: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white mt-1 outline-none focus:border-indigo-500/50 backdrop-blur-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Mobile Phone (Flight SMS Alerts)</span>
                    </label>
                    <input
                      type="tel"
                      value={passenger.phone}
                      onChange={(e) => setPassenger({ ...passenger, phone: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white mt-1 outline-none focus:border-indigo-500/50 backdrop-blur-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/10">
                  <div>
                    <label className="text-xs font-semibold text-slate-300">Passport Number</label>
                    <input
                      type="text"
                      value={passenger.passportNumber}
                      onChange={(e) => setPassenger({ ...passenger, passportNumber: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white mt-1 uppercase font-mono outline-none focus:border-indigo-500/50 backdrop-blur-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300">Nationality</label>
                    <input
                      type="text"
                      value={passenger.nationality}
                      onChange={(e) => setPassenger({ ...passenger, nationality: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white mt-1 outline-none focus:border-indigo-500/50 backdrop-blur-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300">Date of Birth</label>
                    <input
                      type="date"
                      value={passenger.dateOfBirth}
                      onChange={(e) => setPassenger({ ...passenger, dateOfBirth: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white mt-1 outline-none focus:border-indigo-500/50 backdrop-blur-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Special Meal Preference</label>
                  <select
                    value={passenger.mealPreference}
                    onChange={(e) => setPassenger({ ...passenger, mealPreference: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white mt-1 outline-none focus:border-indigo-500/50 backdrop-blur-sm"
                  >
                    <option className="bg-slate-900 text-white">Standard Gourmet Dining</option>
                    <option className="bg-slate-900 text-white">Asian Vegetarian (AVML)</option>
                    <option className="bg-slate-900 text-white">Seafood Special (SFML)</option>
                    <option className="bg-slate-900 text-white">Gluten-Friendly (GFML)</option>
                    <option className="bg-slate-900 text-white">Halal Certified (MOML)</option>
                    <option className="bg-slate-900 text-white">Kosher Dining (KSML)</option>
                    <option className="bg-slate-900 text-white">Diabetic Special (DBML)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 4: ADD-ONS ================= */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white">Enhance Your International Journey</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Add optional travel comforts, baggage protection, and lounge access.
                </p>
              </div>

              <div className="space-y-3">
                {/* Extra Baggage */}
                <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                      <Luggage className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Additional Checked Baggage (32kg)</div>
                      <div className="text-xs text-slate-400">
                        Pre-book discounted baggage allowance for international shopping.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-300 font-semibold">$65 each</span>
                    <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-lg p-1">
                      <button
                        onClick={() =>
                          setAddons({
                            ...addons,
                            extraBaggageCount: Math.max(0, addons.extraBaggageCount - 1),
                          })
                        }
                        className="w-6 h-6 rounded bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-white">
                        {addons.extraBaggageCount}
                      </span>
                      <button
                        onClick={() =>
                          setAddons({
                            ...addons,
                            extraBaggageCount: Math.min(3, addons.extraBaggageCount + 1),
                          })
                        }
                        className="w-6 h-6 rounded bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lounge Access */}
                <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
                      <Coffee className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Sky View Club Lounge Access</div>
                      <div className="text-xs text-slate-400">
                        Hot buffet, barista coffee, shower suites, and quiet relaxation suites at{' '}
                        {flight.origin.code}.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-white">
                      {cabinClass === 'business' || cabinClass === 'first' ? 'Included Free' : '+$75'}
                    </span>
                    <input
                      type="checkbox"
                      disabled={cabinClass === 'business' || cabinClass === 'first'}
                      checked={addons.loungeAccess}
                      onChange={(e) => setAddons({ ...addons, loungeAccess: e.target.checked })}
                      className="w-5 h-5 rounded accent-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Travel Insurance */}
                <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                      <HeartHandshake className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Comprehensive Travel & Medical Guard</div>
                      <div className="text-xs text-slate-400">
                        $250,000 international emergency health cover, baggage delay, and trip interruption.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-white">+$45</span>
                    <input
                      type="checkbox"
                      checked={addons.travelInsurance}
                      onChange={(e) => setAddons({ ...addons, travelInsurance: e.target.checked })}
                      className="w-5 h-5 rounded accent-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Carbon Offset */}
                <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                      <Leaf className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">SAF Aviation Carbon Offset</div>
                      <div className="text-xs text-slate-400">
                        Neutralize your flight emissions via verified sustainable aviation biofuel initiatives.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-white">+$15</span>
                    <input
                      type="checkbox"
                      checked={addons.carbonOffset}
                      onChange={(e) => setAddons({ ...addons, carbonOffset: e.target.checked })}
                      className="w-5 h-5 rounded accent-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 5: INTEGRATED PAYMENT PROCESSING ================= */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Integrated Secure Payment Processing</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pay securely with Credit Card, redeem your Sky Club loyalty points, or choose split payment.
                </p>
              </div>

              {/* Payment Methods Tabs */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'card' as const, label: 'Credit Card', icon: CreditCard },
                  { id: 'points' as const, label: 'Pay with Points', icon: Sparkles },
                  { id: 'split' as const, label: 'Card + Points', icon: Shield },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    onClick={() => {
                      setPaymentType(pm.id);
                      if (pm.id === 'points') {
                        setPointsToRedeem(Math.min(user.pointsBalance, subtotal * 100));
                      } else if (pm.id === 'card') {
                        setPointsToRedeem(0);
                      } else {
                        setPointsToRedeem(Math.min(user.pointsBalance, 25000));
                      }
                    }}
                    className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                      paymentType === pm.id
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <pm.icon className="w-4 h-4" />
                    <span>{pm.label}</span>
                  </button>
                ))}
              </div>

              {/* Points Redemption Slider if applicable */}
              {(paymentType === 'points' || paymentType === 'split') && (
                <div className="p-4 rounded-2xl bg-amber-500/10 backdrop-blur-md border border-amber-500/20 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      <span>Sky Club Loyalty Wallet (Balance: {user.pointsBalance.toLocaleString()} pts)</span>
                    </span>
                    <span className="font-extrabold text-white">
                      -${pointsDiscount.toLocaleString()} USD off
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max={Math.min(user.pointsBalance, subtotal * 100)}
                    step="500"
                    value={pointsToRedeem}
                    onChange={(e) => setPointsToRedeem(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />

                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                    <span>Redeeming: {pointsToRedeem.toLocaleString()} pts</span>
                    <span>100 pts = $1.00 USD</span>
                  </div>
                </div>
              )}

              {/* Credit Card Input Form */}
              {(paymentType === 'card' || paymentType === 'split') && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>256-Bit SSL Encrypted Transaction</span>
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10 font-mono text-[10px] text-slate-300">VISA</span>
                      <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10 font-mono text-[10px] text-slate-300">MC</span>
                      <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10 font-mono text-[10px] text-slate-300">AMEX</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white mt-1 outline-none focus:border-indigo-500/50 backdrop-blur-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono mt-1 outline-none focus:border-indigo-500/50 backdrop-blur-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono mt-1 outline-none focus:border-indigo-500/50 backdrop-blur-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-300">Security CVC</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono mt-1 outline-none focus:border-indigo-500/50 backdrop-blur-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Order Summary Breakdown */}
              <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-xs space-y-2">
                <div className="font-bold text-slate-300 pb-2 border-b border-white/10 text-sm">
                  Fare Summary Breakdown
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Base Airfare ({cabinClass.replace('_', ' ')})</span>
                  <span>${baseFare.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Flexibility Option ({flexibility})</span>
                  <span>${flexibilityFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Seat Assignment ({selectedSeatIds[0] || 'Auto'})</span>
                  <span>${seatFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Travel Add-ons Total</span>
                  <span>${addonsTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>International Taxes & Security Surcharges</span>
                  <span>${taxes.toLocaleString()}</span>
                </div>
                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-amber-400 font-bold">
                    <span>Sky Club Points Redeemed</span>
                    <span>-${pointsDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-white/10">
                  <span>Total Amount Due:</span>
                  <span className="text-indigo-400">${finalPrice.toLocaleString()} USD</span>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 6: CONFIRMATION SUCCESS ================= */}
          {step === 6 && createdBooking && (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-bounce">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
                  Booking Confirmed & Ticketed
                </span>
                <h2 className="text-2xl font-extrabold text-white mt-1">
                  You are all set for {flight.destination.city}!
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Electronic ticket and boarding credentials dispatched to{' '}
                  <strong className="text-slate-200">{passenger.email}</strong>.
                </p>
              </div>

              {/* Electronic Ticket Card */}
              <div className="max-w-md mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 text-left text-xs space-y-3 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Booking Reference</div>
                    <div className="text-xl font-mono font-extrabold text-indigo-400">
                      {createdBooking.bookingReference}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase">Flight</div>
                    <div className="text-base font-bold text-white">{flight.flightNumber}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 py-1">
                  <div>
                    <span className="text-slate-400">Passenger:</span>
                    <div className="font-bold text-white">
                      {passenger.firstName} {passenger.lastName}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Cabin & Seat:</span>
                    <div className="font-bold text-white capitalize">
                      {cabinClass.replace('_', ' ')} • {selectedSeatIds.join(', ') || '12A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Departure:</span>
                    <div className="font-bold text-white">
                      {flight.origin.code} (Terminal {flight.terminal})
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Arrival:</span>
                    <div className="font-bold text-white">
                      {flight.destination.code} (Gate {flight.gate})
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-emerald-400 font-semibold text-[11px]">
                  <span>Loyalty Points Earned:</span>
                  <span>+{createdBooking.pointsEarned.toLocaleString()} SkyPoints</span>
                </div>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/25"
                >
                  View My Trips
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        {step < 6 && (
          <div className="px-6 py-4 bg-black/40 backdrop-blur-md border-t border-white/10 flex items-center justify-between sticky bottom-0 z-20">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div></div>
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/25"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleProcessPayment}
                className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay ${finalPrice.toLocaleString()} & Ticket Flight</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
