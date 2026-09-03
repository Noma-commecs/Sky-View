import { Booking, EmailNotification, Flight, Passenger, SeatStatus, UserProfile } from '../types';
import { INITIAL_BOOKINGS, INITIAL_EMAILS, INITIAL_FLIGHTS, INITIAL_USER } from '../data/mockData';

const STORAGE_KEYS = {
  FLIGHTS: 'skyview_flights_v1',
  BOOKINGS: 'skyview_bookings_v1',
  USER: 'skyview_user_v1',
  EMAILS: 'skyview_emails_v1',
};

class SkyViewDatabase {
  private flights: Flight[] = [];
  private bookings: Booking[] = [];
  private user: UserProfile = INITIAL_USER;
  private emails: EmailNotification[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      const storedFlights = localStorage.getItem(STORAGE_KEYS.FLIGHTS);
      const storedBookings = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      const storedEmails = localStorage.getItem(STORAGE_KEYS.EMAILS);

      this.flights = storedFlights ? JSON.parse(storedFlights) : INITIAL_FLIGHTS;
      this.bookings = storedBookings ? JSON.parse(storedBookings) : INITIAL_BOOKINGS;
      this.user = storedUser ? JSON.parse(storedUser) : INITIAL_USER;
      this.emails = storedEmails ? JSON.parse(storedEmails) : INITIAL_EMAILS;
    } catch {
      this.resetToDefaults();
    }
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEYS.FLIGHTS, JSON.stringify(this.flights));
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(this.bookings));
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.user));
      localStorage.setItem(STORAGE_KEYS.EMAILS, JSON.stringify(this.emails));
    } catch (e) {
      console.warn('Storage persistence failed:', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // --- Flights ---
  public getFlights(): Flight[] {
    return [...this.flights];
  }

  public getFlight(id: string): Flight | undefined {
    return this.flights.find((f) => f.id === id);
  }

  public updateSeatStatus(flightId: string, seatIds: string[], status: SeatStatus): boolean {
    const flight = this.flights.find((f) => f.id === flightId);
    if (!flight) return false;

    let modified = false;
    flight.seats = flight.seats.map((seat) => {
      if (seatIds.includes(seat.id)) {
        modified = true;
        return { ...seat, status };
      }
      return seat;
    });

    if (modified) {
      // Recalculate available seat counts
      const counts = { economy: 0, premium_economy: 0, business: 0, first: 0 };
      flight.seats.forEach((s) => {
        if (s.status === 'available') {
          counts[s.cabinClass]++;
        }
      });
      flight.availableSeatsCount = counts;
      this.persist();
    }
    return modified;
  }

  // --- Bookings ---
  public getBookings(): Booking[] {
    return [...this.bookings].sort(
      (a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime()
    );
  }

  public getBooking(id: string): Booking | undefined {
    return this.bookings.find((b) => b.id === id || b.bookingReference === id);
  }

  public createBooking(booking: Booking): Booking {
    // 1. Save booking
    this.bookings.unshift(booking);

    // 2. Mark chosen seats as occupied in flight
    this.updateSeatStatus(booking.flightId, booking.selectedSeatIds, 'occupied');

    // 3. Update user points
    let newBalance = this.user.pointsBalance;
    if (booking.pointsRedeemed > 0) {
      newBalance -= booking.pointsRedeemed;
    }
    newBalance += booking.pointsEarned;
    this.user.pointsBalance = Math.max(0, newBalance);
    this.user.tierProgressMiles += booking.flight.distanceMiles;

    // 4. Send real-time confirmation email
    this.sendBookingConfirmationEmail(booking);

    this.persist();
    return booking;
  }

  public cancelBooking(bookingId: string, refundAmount: number, penalty: number, reason: string): boolean {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking || booking.status === 'cancelled') return false;

    booking.status = 'cancelled';
    booking.cancellationDetails = {
      cancelledAt: new Date().toISOString(),
      refundAmount,
      refundMethod: booking.paymentMethod.type === 'card' ? `Card ending in ${booking.paymentMethod.cardLast4 || '4242'}` : 'SkyPoints Wallet',
      penaltyFee: penalty,
      pointsRefunded: booking.flexibility === 'superflex' ? booking.pointsRedeemed : Math.round(booking.pointsRedeemed * 0.85),
      reason,
    };

    // Release seats back to available!
    this.updateSeatStatus(booking.flightId, booking.selectedSeatIds, 'available');

    // Refund points if applicable
    if (booking.cancellationDetails.pointsRefunded > 0) {
      this.user.pointsBalance += booking.cancellationDetails.pointsRefunded;
    }

    // Send real-time cancellation email
    this.sendCancellationEmail(booking);

    this.persist();
    return true;
  }

  // --- User Profile ---
  public getUserProfile(): UserProfile {
    return { ...this.user };
  }

  public updateUserProfile(updated: Partial<UserProfile>): UserProfile {
    this.user = { ...this.user, ...updated };
    this.persist();
    return this.user;
  }

  // --- Email Notifications ---
  public getEmails(): EmailNotification[] {
    return [...this.emails].sort(
      (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    );
  }

  public markEmailAsRead(id: string) {
    const email = this.emails.find((e) => e.id === id);
    if (email) {
      email.read = true;
      this.persist();
    }
  }

  public markAllEmailsAsRead() {
    this.emails.forEach((e) => (e.read = true));
    this.persist();
  }

  private sendBookingConfirmationEmail(booking: Booking) {
    const email: EmailNotification = {
      id: `em-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      to: booking.passengers[0]?.email || this.user.email,
      subject: `Sky View Confirmation: ${booking.bookingReference} (${booking.flight.origin.code} ✈ ${booking.flight.destination.code})`,
      type: 'booking_confirmed',
      sentAt: new Date().toISOString(),
      previewText: `Your flight ${booking.flight.flightNumber} to ${booking.flight.destination.city} is confirmed. View your e-ticket, terminal, and boarding passes.`,
      read: false,
      bookingReference: booking.bookingReference,
      flightNumber: booking.flight.flightNumber,
      route: `${booking.flight.origin.city} (${booking.flight.origin.code}) ➔ ${booking.flight.destination.city} (${booking.flight.destination.code})`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; color: #0f172a; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 24px; color: #ffffff;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="letter-spacing: 2px; font-weight: 800; font-size: 22px; color: #ffffff;">SKY VIEW</span>
                <p style="margin: 4px 0 0 0; color: #e0f2fe; font-size: 13px;">International Airline Reservation Confirmation</p>
              </div>
              <div style="background: rgba(255,255,255,0.2); border-radius: 8px; padding: 6px 14px; text-align: right;">
                <div style="font-size: 10px; text-transform: uppercase; color: #e0f2fe;">PNR CODE</div>
                <div style="font-size: 16px; font-weight: 800; letter-spacing: 2px;">${booking.bookingReference}</div>
              </div>
            </div>
          </div>
          
          <div style="padding: 24px;">
            <p style="font-size: 15px; color: #334155; margin-top: 0;">Hello <strong>${booking.passengers[0]?.firstName} ${booking.passengers[0]?.lastName}</strong>,</p>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
              Your international flight reservation is confirmed and ticketed. Below is your complete travel summary and electronic itinerary receipt.
            </p>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 18px 0;">
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 12px;">
                <div>
                  <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600;">Flight</span>
                  <div style="font-size: 16px; font-weight: 700; color: #0284c7;">${booking.flight.flightNumber}</div>
                </div>
                <div>
                  <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600;">Class</span>
                  <div style="font-size: 15px; font-weight: 600; text-transform: capitalize;">${booking.cabinClass.replace('_', ' ')}</div>
                </div>
                <div>
                  <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600;">Fare Tier</span>
                  <div style="font-size: 15px; font-weight: 600; text-transform: capitalize; color: #059669;">${booking.flexibility}</div>
                </div>
                <div>
                  <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600;">Seat(s)</span>
                  <div style="font-size: 15px; font-weight: 700; color: #0f172a;">${booking.selectedSeatIds.join(', ') || 'Assigned at Gate'}</div>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-size: 20px; font-weight: 800;">${booking.flight.origin.code}</div>
                  <div style="font-size: 12px; color: #64748b;">${booking.flight.origin.city}</div>
                  <div style="font-size: 12px; font-weight: 600; color: #0284c7; margin-top: 4px;">Terminal ${booking.flight.terminal}</div>
                </div>
                <div style="text-align: center; color: #64748b; font-size: 12px;">
                  <div>${Math.floor(booking.flight.durationMinutes / 60)}h ${booking.flight.durationMinutes % 60}m</div>
                  <div style="color: #0284c7; font-weight: bold; margin: 2px 0;">✈ Non-stop</div>
                  <div style="font-size: 11px; color: #94a3b8;">${booking.flight.aircraft}</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 20px; font-weight: 800;">${booking.flight.destination.code}</div>
                  <div style="font-size: 12px; color: #64748b;">${booking.flight.destination.city}</div>
                  <div style="font-size: 12px; font-weight: 600; color: #0284c7; margin-top: 4px;">Gate ${booking.flight.gate}</div>
                </div>
              </div>
            </div>

            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px; margin-bottom: 18px;">
              <div style="font-size: 13px; font-weight: 700; color: #166534;">
                ✈ Sky Club Points Earned: +${booking.pointsEarned.toLocaleString()} SkyPoints
              </div>
              <div style="font-size: 12px; color: #15803d; margin-top: 4px;">
                Calculated based on distance (${booking.flight.distanceMiles.toLocaleString()} miles) and international route prestige for ${booking.flight.destination.city}.
              </div>
            </div>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; font-size: 13px; color: #475569;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span>Total Amount Paid:</span>
                <span style="font-weight: 700; color: #0f172a;">$${booking.totalPrice.toLocaleString()} USD</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span>Payment Method:</span>
                <span>${booking.paymentMethod.type === 'card' ? `Credit Card (•••• ${booking.paymentMethod.cardLast4})` : 'SkyPoints Wallet'}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Flexibility Terms:</span>
                <span>${booking.flexibility === 'superflex' ? '100% Refundable & Free Changes' : booking.flexibility === 'flex' ? 'Partial Refundable (15% fee)' : 'Non-refundable (Tax recovery only)'}</span>
              </div>
            </div>
            
            <div style="margin-top: 24px; text-align: center; border-top: 1px dashed #cbd5e1; padding-top: 16px;">
              <div style="display: inline-block; padding: 6px 16px; background: #f1f5f9; border-radius: 4px; font-family: monospace; letter-spacing: 3px; font-size: 13px; color: #334155;">
                ||| | |||| | ||| ||||| |||| |||
              </div>
              <p style="font-size: 11px; color: #94a3b8; margin: 6px 0 0 0;">BARCODE: ${booking.bookingReference}-ELECTRONIC-TICKET</p>
            </div>
          </div>
        </div>
      `,
    };

    this.emails.unshift(email);
  }

  private sendCancellationEmail(booking: Booking) {
    const details = booking.cancellationDetails!;
    const email: EmailNotification = {
      id: `em-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      to: booking.passengers[0]?.email || this.user.email,
      subject: `Sky View Notice: Reservation Cancelled & Refund Processed (${booking.bookingReference})`,
      type: 'booking_cancelled',
      sentAt: new Date().toISOString(),
      previewText: `Reservation ${booking.bookingReference} has been cancelled. A refund of $${details.refundAmount.toLocaleString()} has been queued.`,
      read: false,
      bookingReference: booking.bookingReference,
      flightNumber: booking.flight.flightNumber,
      route: `${booking.flight.origin.city} (${booking.flight.origin.code}) ➔ ${booking.flight.destination.city} (${booking.flight.destination.code})`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; color: #0f172a; max-width: 620px; margin: 0 auto; border: 1px solid #fee2e2; border-radius: 12px; overflow: hidden; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%); padding: 24px; color: #ffffff;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="letter-spacing: 2px; font-weight: 800; font-size: 22px; color: #ffffff;">SKY VIEW</span>
                <p style="margin: 4px 0 0 0; color: #fecaca; font-size: 13px;">Booking Cancellation & Refund Statement</p>
              </div>
              <div style="background: rgba(255,255,255,0.2); border-radius: 8px; padding: 6px 14px; text-align: right;">
                <div style="font-size: 10px; text-transform: uppercase; color: #fecaca;">STATUS</div>
                <div style="font-size: 15px; font-weight: 800; color: #ffffff;">CANCELLED</div>
              </div>
            </div>
          </div>
          
          <div style="padding: 24px;">
            <p style="font-size: 15px; color: #334155; margin-top: 0;">Dear <strong>${booking.passengers[0]?.firstName} ${booking.passengers[0]?.lastName}</strong>,</p>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
              As requested, your reservation for flight <strong>${booking.flight.flightNumber}</strong> (PNR: <strong>${booking.bookingReference}</strong>) has been cancelled. Your assigned seat(s) have been safely returned to inventory.
            </p>

            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 18px; margin: 18px 0;">
              <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #991b1b;">Refund Breakdown (${booking.flexibility.toUpperCase()} Fare)</h3>
              <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 6px;">
                <span style="color: #64748b;">Original Total Paid:</span>
                <span style="font-weight: 600;">$${booking.totalPrice.toLocaleString()} USD</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 6px;">
                <span style="color: #64748b;">Cancellation / Penalty Fee:</span>
                <span style="color: #dc2626; font-weight: 600;">-$${details.penaltyFee.toLocaleString()} USD</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; border-top: 1px solid #fecaca; padding-top: 8px; color: #15803d;">
                <span>Total Refund Credited:</span>
                <span>$${details.refundAmount.toLocaleString()} USD</span>
              </div>
              <div style="font-size: 12px; color: #64748b; margin-top: 8px;">
                Refund destination: <strong>${details.refundMethod}</strong>. Processing typically completes within 2-4 business days.
              </div>
            </div>

            <p style="font-size: 13px; color: #64748b;">Reason provided: <em>${details.reason || 'Travel schedule adjustment'}</em></p>
            <p style="font-size: 12px; color: #94a3b8; margin-top: 24px; text-align: center;">We hope to welcome you back on board Sky View in the near future.</p>
          </div>
        </div>
      `,
    };

    this.emails.unshift(email);
  }

  public resetToDefaults() {
    this.flights = INITIAL_FLIGHTS;
    this.bookings = INITIAL_BOOKINGS;
    this.user = INITIAL_USER;
    this.emails = INITIAL_EMAILS;
    this.persist();
  }
}

export const db = new SkyViewDatabase();
