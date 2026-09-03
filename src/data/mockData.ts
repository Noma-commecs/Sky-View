import { Flight, Location, Seat, UserProfile, Booking, EmailNotification, CabinClass } from '../types';

export const LOCATIONS: Location[] = [
  {
    code: 'JFK',
    city: 'New York',
    country: 'United States',
    airportName: 'John F. Kennedy International',
    timezone: 'EST (UTC-5)',
    region: 'North America',
    rewardBaseMultiplier: 1.1,
    popularAttraction: 'Manhattan Skyline & Central Park',
  },
  {
    code: 'LHR',
    city: 'London',
    country: 'United Kingdom',
    airportName: 'Heathrow International',
    timezone: 'GMT (UTC+0)',
    region: 'Europe',
    rewardBaseMultiplier: 1.2,
    popularAttraction: 'Big Ben & Tower Bridge',
  },
  {
    code: 'HND',
    city: 'Tokyo',
    country: 'Japan',
    airportName: 'Haneda International',
    timezone: 'JST (UTC+9)',
    region: 'Asia-Pacific',
    rewardBaseMultiplier: 1.5,
    popularAttraction: 'Mount Fuji & Shibuya Crossing',
  },
  {
    code: 'DXB',
    city: 'Dubai',
    country: 'United Arab Emirates',
    airportName: 'Dubai International',
    timezone: 'GST (UTC+4)',
    region: 'Middle East',
    rewardBaseMultiplier: 1.45,
    popularAttraction: 'Burj Khalifa & Palm Jumeirah',
  },
  {
    code: 'CDG',
    city: 'Paris',
    country: 'France',
    airportName: 'Charles de Gaulle',
    timezone: 'CET (UTC+1)',
    region: 'Europe',
    rewardBaseMultiplier: 1.25,
    popularAttraction: 'Eiffel Tower & Louvre Museum',
  },
  {
    code: 'SIN',
    city: 'Singapore',
    country: 'Singapore',
    airportName: 'Changi International',
    timezone: 'SGT (UTC+8)',
    region: 'Asia-Pacific',
    rewardBaseMultiplier: 1.55,
    popularAttraction: 'Marina Bay Sands & Jewel Changi',
  },
  {
    code: 'SYD',
    city: 'Sydney',
    country: 'Australia',
    airportName: 'Kingsford Smith',
    timezone: 'AEST (UTC+10)',
    region: 'Asia-Pacific',
    rewardBaseMultiplier: 1.65,
    popularAttraction: 'Sydney Opera House & Harbour Bridge',
  },
  {
    code: 'FRA',
    city: 'Frankfurt',
    country: 'Germany',
    airportName: 'Frankfurt am Main',
    timezone: 'CET (UTC+1)',
    region: 'Europe',
    rewardBaseMultiplier: 1.2,
    popularAttraction: 'Römerberg & Rhine Valley',
  },
  {
    code: 'SFO',
    city: 'San Francisco',
    country: 'United States',
    airportName: 'San Francisco International',
    timezone: 'PST (UTC-8)',
    region: 'North America',
    rewardBaseMultiplier: 1.15,
    popularAttraction: 'Golden Gate Bridge & Silicon Valley',
  },
  {
    code: 'FCO',
    city: 'Rome',
    country: 'Italy',
    airportName: 'Leonardo da Vinci-Fiumicino',
    timezone: 'CET (UTC+1)',
    region: 'Europe',
    rewardBaseMultiplier: 1.3,
    popularAttraction: 'Colosseum & Vatican City',
  },
];

// Helper to generate a realistic seat grid for an aircraft
export function generateAircraftSeats(): Seat[] {
  const seats: Seat[] = [];

  // Row 1-2: First Class (1 - 2 - 1)
  for (let r = 1; r <= 2; r++) {
    ['A', 'D', 'G', 'K'].forEach((col) => {
      const isOccupied = Math.random() < 0.35;
      seats.push({
        id: `${r}${col}`,
        row: r,
        col,
        cabinClass: 'first',
        status: isOccupied ? 'occupied' : 'available',
        priceModifier: 150,
        features: ['lie_flat', 'direct_aisle_access', col === 'A' || col === 'K' ? 'window' : 'aisle', 'extra_legroom'],
      });
    });
  }

  // Row 3-6: Business Class (1 - 2 - 1)
  for (let r = 3; r <= 6; r++) {
    ['A', 'D', 'G', 'K'].forEach((col) => {
      const isOccupied = Math.random() < 0.45;
      seats.push({
        id: `${r}${col}`,
        row: r,
        col,
        cabinClass: 'business',
        status: isOccupied ? 'occupied' : 'available',
        priceModifier: 60,
        features: ['lie_flat', 'direct_aisle_access', col === 'A' || col === 'K' ? 'window' : 'aisle'],
      });
    });
  }

  // Row 10-13: Premium Economy (2 - 3 - 2)
  for (let r = 10; r <= 13; r++) {
    ['A', 'C', 'D', 'E', 'F', 'H', 'K'].forEach((col) => {
      const isOccupied = Math.random() < 0.5;
      const isExit = r === 10;
      seats.push({
        id: `${r}${col}`,
        row: r,
        col,
        cabinClass: 'premium_economy',
        status: isOccupied ? 'occupied' : 'available',
        priceModifier: isExit ? 45 : 25,
        features: [
          col === 'A' || col === 'K' ? 'window' : col === 'C' || col === 'H' ? 'aisle' : 'extra_legroom',
          ...(isExit ? (['exit_row', 'extra_legroom'] as any[]) : ['extra_legroom']),
        ],
      });
    });
  }

  // Row 20-30: Economy (3 - 3 - 3)
  for (let r = 20; r <= 30; r++) {
    ['A', 'B', 'C', 'D', 'E', 'F', 'H', 'J', 'K'].forEach((col) => {
      const isOccupied = Math.random() < 0.55;
      const isExit = r === 20;
      seats.push({
        id: `${r}${col}`,
        row: r,
        col,
        cabinClass: 'economy',
        status: isOccupied ? 'occupied' : 'available',
        priceModifier: isExit ? 35 : col === 'A' || col === 'K' ? 15 : 0,
        features: [
          col === 'A' || col === 'K' ? 'window' : col === 'C' || col === 'D' || col === 'F' || col === 'H' ? 'aisle' : 'extra_legroom',
          ...(isExit ? (['exit_row', 'extra_legroom'] as any[]) : []),
        ],
      });
    });
  }

  return seats;
}

export const INITIAL_FLIGHTS: Flight[] = [
  {
    id: 'fl-101',
    flightNumber: 'SV-101',
    airline: 'Sky View Global',
    origin: LOCATIONS[0], // JFK
    destination: LOCATIONS[1], // LHR
    departureTime: '2026-09-10T19:30:00Z',
    arrivalTime: '2026-09-11T07:45:00Z',
    durationMinutes: 435, // 7h 15m
    distanceMiles: 3451,
    aircraft: 'Boeing 787-9 Dreamliner',
    terminal: 'T4',
    gate: 'B28',
    basePrices: {
      economy: 640,
      premium_economy: 1180,
      business: 2850,
      first: 5400,
    },
    seats: generateAircraftSeats(),
    availableSeatsCount: {
      economy: 42,
      premium_economy: 14,
      business: 9,
      first: 4,
    },
    stops: 0,
    onTimeRate: 96,
  },
  {
    id: 'fl-204',
    flightNumber: 'SV-204',
    airline: 'Sky View Global',
    origin: LOCATIONS[0], // JFK
    destination: LOCATIONS[2], // HND (Tokyo)
    departureTime: '2026-09-12T11:15:00Z',
    arrivalTime: '2026-09-13T14:40:00Z',
    durationMinutes: 865, // 14h 25m
    distanceMiles: 6737,
    aircraft: 'Airbus A350-900 XWB',
    terminal: 'T4',
    gate: 'A12',
    basePrices: {
      economy: 1090,
      premium_economy: 1890,
      business: 4450,
      first: 8900,
    },
    seats: generateAircraftSeats(),
    availableSeatsCount: {
      economy: 36,
      premium_economy: 11,
      business: 7,
      first: 3,
    },
    stops: 0,
    onTimeRate: 98,
  },
  {
    id: 'fl-315',
    flightNumber: 'SV-315',
    airline: 'Sky View Global',
    origin: LOCATIONS[1], // LHR (London)
    destination: LOCATIONS[3], // DXB (Dubai)
    departureTime: '2026-09-14T14:00:00Z',
    arrivalTime: '2026-09-15T00:15:00Z',
    durationMinutes: 435, // 7h 15m
    distanceMiles: 3421,
    aircraft: 'Boeing 787-9 Dreamliner',
    terminal: 'T2',
    gate: 'B34',
    basePrices: {
      economy: 580,
      premium_economy: 1050,
      business: 2600,
      first: 4950,
    },
    seats: generateAircraftSeats(),
    availableSeatsCount: {
      economy: 48,
      premium_economy: 16,
      business: 12,
      first: 5,
    },
    stops: 0,
    onTimeRate: 94,
  },
  {
    id: 'fl-422',
    flightNumber: 'SV-422',
    airline: 'Sky View Global',
    origin: LOCATIONS[4], // CDG (Paris)
    destination: LOCATIONS[5], // SIN (Singapore)
    departureTime: '2026-09-15T12:40:00Z',
    arrivalTime: '2026-09-16T06:55:00Z',
    durationMinutes: 735, // 12h 15m
    distanceMiles: 6667,
    aircraft: 'Airbus A350-900 XWB',
    terminal: '2E',
    gate: 'K41',
    basePrices: {
      economy: 950,
      premium_economy: 1680,
      business: 3950,
      first: 7800,
    },
    seats: generateAircraftSeats(),
    availableSeatsCount: {
      economy: 52,
      premium_economy: 15,
      business: 8,
      first: 2,
    },
    stops: 0,
    onTimeRate: 95,
  },
  {
    id: 'fl-580',
    flightNumber: 'SV-580',
    airline: 'Sky View Global',
    origin: LOCATIONS[5], // SIN (Singapore)
    destination: LOCATIONS[6], // SYD (Sydney)
    departureTime: '2026-09-16T21:20:00Z',
    arrivalTime: '2026-09-17T07:05:00Z',
    durationMinutes: 465, // 7h 45m
    distanceMiles: 3908,
    aircraft: 'Boeing 787-9 Dreamliner',
    terminal: 'T3',
    gate: 'B07',
    basePrices: {
      economy: 620,
      premium_economy: 1150,
      business: 2790,
      first: 5200,
    },
    seats: generateAircraftSeats(),
    availableSeatsCount: {
      economy: 40,
      premium_economy: 12,
      business: 10,
      first: 4,
    },
    stops: 0,
    onTimeRate: 97,
  },
  {
    id: 'fl-602',
    flightNumber: 'SV-602',
    airline: 'Sky View Global',
    origin: LOCATIONS[8], // SFO (San Francisco)
    destination: LOCATIONS[2], // HND (Tokyo)
    departureTime: '2026-09-18T13:10:00Z',
    arrivalTime: '2026-09-19T16:30:00Z',
    durationMinutes: 680, // 11h 20m
    distanceMiles: 5160,
    aircraft: 'Boeing 787-9 Dreamliner',
    terminal: 'Intl-G',
    gate: 'G98',
    basePrices: {
      economy: 890,
      premium_economy: 1580,
      business: 3890,
      first: 7500,
    },
    seats: generateAircraftSeats(),
    availableSeatsCount: {
      economy: 38,
      premium_economy: 10,
      business: 6,
      first: 3,
    },
    stops: 0,
    onTimeRate: 99,
  },
  {
    id: 'fl-718',
    flightNumber: 'SV-718',
    airline: 'Sky View Global',
    origin: LOCATIONS[3], // DXB (Dubai)
    destination: LOCATIONS[0], // JFK (New York)
    departureTime: '2026-09-20T08:30:00Z',
    arrivalTime: '2026-09-20T14:45:00Z',
    durationMinutes: 855, // 14h 15m
    distanceMiles: 6836,
    aircraft: 'Airbus A350-900 XWB',
    terminal: 'T3',
    gate: 'A19',
    basePrices: {
      economy: 1020,
      premium_economy: 1820,
      business: 4600,
      first: 9200,
    },
    seats: generateAircraftSeats(),
    availableSeatsCount: {
      economy: 45,
      premium_economy: 13,
      business: 11,
      first: 4,
    },
    stops: 0,
    onTimeRate: 96,
  },
  {
    id: 'fl-830',
    flightNumber: 'SV-830',
    airline: 'Sky View Global',
    origin: LOCATIONS[7], // FRA (Frankfurt)
    destination: LOCATIONS[9], // FCO (Rome)
    departureTime: '2026-09-21T09:15:00Z',
    arrivalTime: '2026-09-21T11:05:00Z',
    durationMinutes: 110, // 1h 50m
    distanceMiles: 601,
    aircraft: 'Airbus A321neo',
    terminal: 'T1',
    gate: 'A14',
    basePrices: {
      economy: 180,
      premium_economy: 310,
      business: 620,
      first: 1150,
    },
    seats: generateAircraftSeats(),
    availableSeatsCount: {
      economy: 62,
      premium_economy: 20,
      business: 12,
      first: 4,
    },
    stops: 0,
    onTimeRate: 93,
  },
];

export const INITIAL_USER: UserProfile = {
  id: 'usr-9941',
  name: 'Alexander Sterling',
  email: 'a.sterling@skyview-member.com',
  phone: '+1 (555) 234-8901',
  passportNumber: 'PA98471205',
  passportExpiry: '2031-08-14',
  nationality: 'United States',
  membershipTier: 'Platinum',
  pointsBalance: 78450,
  tierProgressMiles: 42500,
  nextTierMilesRequired: 50000,
  homeAirport: 'JFK',
  preferredCabinClass: 'business',
  preferredMeal: 'Seafood Special',
  savedCards: [
    {
      id: 'card-1',
      brand: 'Visa',
      last4: '4242',
      expiry: '09/28',
      holderName: 'Alexander Sterling',
    },
    {
      id: 'card-2',
      brand: 'Amex',
      last4: '1004',
      expiry: '12/29',
      holderName: 'Alexander Sterling',
    },
  ],
};

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bk-5501',
    bookingReference: 'SV-782NX',
    flightId: 'fl-101',
    flight: INITIAL_FLIGHTS[0],
    cabinClass: 'business',
    flexibility: 'superflex',
    passengers: [
      {
        id: 'p-1',
        title: 'Mr',
        firstName: 'Alexander',
        lastName: 'Sterling',
        email: 'a.sterling@skyview-member.com',
        phone: '+1 (555) 234-8901',
        passportNumber: 'PA98471205',
        nationality: 'United States',
        dateOfBirth: '1988-06-15',
        mealPreference: 'Seafood Special',
        assignedSeatId: '4A',
      },
    ],
    selectedSeatIds: ['4A'],
    addons: {
      extraBaggageCount: 1,
      loungeAccess: true,
      travelInsurance: true,
      carbonOffset: true,
      priorityBoarding: true,
    },
    baseFareTotal: 2850,
    flexibilityFee: 150,
    seatsFee: 60,
    addonsTotal: 180,
    taxesAndFees: 195,
    discount: 0,
    totalPrice: 3435,
    currency: 'USD',
    pointsEarned: 8625,
    pointsRedeemed: 0,
    paymentMethod: {
      type: 'card',
      cardLast4: '4242',
      cardBrand: 'Visa',
    },
    status: 'confirmed',
    bookedAt: '2026-08-25T14:30:00Z',
  },
];

export const INITIAL_EMAILS: EmailNotification[] = [
  {
    id: 'em-101',
    to: 'a.sterling@skyview-member.com',
    subject: 'Sky View Ticket & Boarding Pass Confirmation: SV-782NX (JFK ✈ LHR)',
    type: 'booking_confirmed',
    sentAt: '2026-08-25T14:31:00Z',
    previewText: 'Your flight reservation SV-782NX to London Heathrow is confirmed. View your e-ticket, cabin perks, and check-in timeline.',
    read: false,
    bookingReference: 'SV-782NX',
    flightNumber: 'SV-101',
    route: 'New York (JFK) ➔ London (LHR)',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); padding: 24px; color: #ffffff;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px; color: #38bdf8;">SKY VIEW</h1>
            <span style="background: rgba(255,255,255,0.15); padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600;">CONFIRMED E-TICKET</span>
          </div>
          <p style="margin: 8px 0 0 0; color: #cbd5e1; font-size: 14px;">Booking Reference: <strong style="color: #ffffff; letter-spacing: 2px;">SV-782NX</strong></p>
        </div>
        <div style="padding: 24px;">
          <h2 style="font-size: 18px; margin-top: 0; color: #0f172a;">Dear Alexander Sterling,</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">Thank you for reserving with Sky View International. Your international journey from <strong>New York (JFK)</strong> to <strong>London (LHR)</strong> is confirmed with <strong>SuperFlex</strong> protection.</p>
          
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
              <div>
                <span style="font-size: 12px; color: #64748b; text-transform: uppercase;">Flight</span>
                <div style="font-size: 16px; font-weight: 700; color: #0284c7;">SV-101</div>
              </div>
              <div>
                <span style="font-size: 12px; color: #64748b; text-transform: uppercase;">Cabin Class</span>
                <div style="font-size: 16px; font-weight: 700; color: #0f172a;">Business Class Suite</div>
              </div>
              <div>
                <span style="font-size: 12px; color: #64748b; text-transform: uppercase;">Seat</span>
                <div style="font-size: 16px; font-weight: 700; color: #0284c7;">4A (Window / Direct Aisle)</div>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; border-top: 1px dashed #cbd5e1; padding-top: 12px;">
              <div>
                <div style="font-size: 18px; font-weight: 700;">JFK (19:30)</div>
                <div style="font-size: 12px; color: #64748b;">Terminal 4, Gate B28</div>
              </div>
              <div style="text-align: center; color: #64748b; font-size: 12px; align-self: center;">
                ✈ 7h 15m (Direct)
              </div>
              <div style="text-align: right;">
                <div style="font-size: 18px; font-weight: 700;">LHR (07:45 +1)</div>
                <div style="font-size: 12px; color: #64748b;">Terminal 2</div>
              </div>
            </div>
          </div>

          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px; margin: 16px 0;">
            <p style="margin: 0; color: #166534; font-size: 13px; font-weight: 600;">
              🌟 Sky Club Rewards: <strong>+8,625 SkyPoints</strong> will be credited upon completion of this transatlantic flight.
            </p>
          </div>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 20px; font-size: 12px; color: #64748b; line-height: 1.5;">
            <p><strong>Baggage:</strong> 2 Checked bags up to 32kg each + 1 Carry-on.</p>
            <p><strong>Fare Rules:</strong> SuperFlex gives you 100% refundable cancellation and unlimited complimentary changes up to 2 hours before departure.</p>
            <p style="margin-top: 16px; color: #94a3b8; text-align: center;">Sky View International Airlines • High Skies, Seamless Journeys</p>
          </div>
        </div>
      </div>
    `,
  },
];
