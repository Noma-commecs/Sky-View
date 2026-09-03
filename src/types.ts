export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';

export type FareFlexibility = 'standard' | 'flex' | 'superflex';

export type SeatStatus = 'available' | 'occupied' | 'selected' | 'blocked';

export type SeatFeature = 'window' | 'aisle' | 'extra_legroom' | 'exit_row' | 'lie_flat' | 'direct_aisle_access';

export interface Location {
  code: string;
  city: string;
  country: string;
  airportName: string;
  timezone: string;
  region: 'North America' | 'Europe' | 'Asia-Pacific' | 'Middle East' | 'Latin America';
  rewardBaseMultiplier: number; // e.g. long haul / prestige routes have higher multipliers
  popularAttraction: string;
}

export interface Seat {
  id: string; // e.g. "12A"
  row: number;
  col: string; // 'A', 'B', 'C', 'D', 'E', 'F'
  cabinClass: CabinClass;
  status: SeatStatus;
  priceModifier: number; // additional cost for preferred seat
  features: SeatFeature[];
}

export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  origin: Location;
  destination: Location;
  departureTime: string; // ISO or human readable formatted
  arrivalTime: string;
  durationMinutes: number;
  distanceMiles: number;
  aircraft: string; // e.g. "Boeing 787-9 Dreamliner", "Airbus A350-900"
  terminal: string;
  gate: string;
  basePrices: Record<CabinClass, number>;
  seats: Seat[];
  availableSeatsCount: Record<CabinClass, number>;
  stops: number; // 0 for direct
  viaCity?: string;
  onTimeRate: number; // e.g. 94%
}

export interface Passenger {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passportNumber: string;
  nationality: string;
  dateOfBirth: string;
  mealPreference: string;
  assignedSeatId?: string;
}

export interface BookingAddons {
  extraBaggageCount: number; // $60 each
  loungeAccess: boolean; // $75
  travelInsurance: boolean; // $45
  carbonOffset: boolean; // $15
  priorityBoarding: boolean; // $30
}

export interface Booking {
  id: string;
  bookingReference: string; // PNR e.g. "SV-849X2"
  flightId: string;
  flight: Flight;
  cabinClass: CabinClass;
  flexibility: FareFlexibility;
  passengers: Passenger[];
  selectedSeatIds: string[];
  addons: BookingAddons;
  baseFareTotal: number;
  flexibilityFee: number;
  seatsFee: number;
  addonsTotal: number;
  taxesAndFees: number;
  discount: number;
  totalPrice: number;
  currency: string;
  pointsEarned: number;
  pointsRedeemed: number;
  paymentMethod: {
    type: 'card' | 'points' | 'split';
    cardLast4?: string;
    cardBrand?: string;
  };
  status: 'confirmed' | 'cancelled' | 'modified';
  bookedAt: string;
  cancellationDetails?: {
    cancelledAt: string;
    refundAmount: number;
    refundMethod: string;
    penaltyFee: number;
    pointsRefunded: number;
    reason: string;
  };
}

export type MembershipTier = 'Silver' | 'Gold' | 'Platinum' | 'Diamond Club';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  passportNumber: string;
  passportExpiry: string;
  nationality: string;
  membershipTier: MembershipTier;
  pointsBalance: number;
  tierProgressMiles: number;
  nextTierMilesRequired: number;
  homeAirport: string;
  preferredCabinClass: CabinClass;
  preferredMeal: string;
  savedCards: {
    id: string;
    brand: string;
    last4: string;
    expiry: string;
    holderName: string;
  }[];
}

export interface EmailNotification {
  id: string;
  to: string;
  subject: string;
  type: 'booking_confirmed' | 'booking_cancelled' | 'seat_changed' | 'flight_reminder';
  sentAt: string;
  previewText: string;
  read: boolean;
  bookingReference: string;
  flightNumber: string;
  route: string;
  htmlContent: string;
}
