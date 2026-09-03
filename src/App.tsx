import React, { useState, useEffect } from 'react';
import { db } from './services/db';
import { Flight, Booking, UserProfile, CabinClass, FareFlexibility, EmailNotification } from './types';
import { Navbar } from './components/Navbar';
import { FlightSearch } from './components/FlightSearch';
import { BookingsList } from './components/BookingsList';
import { RewardsDashboard } from './components/RewardsDashboard';
import { UserProfileView } from './components/UserProfileView';
import { FleetExplorer } from './components/FleetExplorer';
import { BookingModal } from './components/BookingModal';
import { EmailInboxModal } from './components/EmailInboxModal';
import { PromptSpecModal } from './components/PromptSpecModal';
import { Bell, CheckCircle2, Plane, Sparkles, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'seats' | 'bookings' | 'rewards' | 'profile'>('search');
  
  // Database reactive states
  const [flights, setFlights] = useState<Flight[]>(() => db.getFlights());
  const [bookings, setBookings] = useState<Booking[]>(() => db.getBookings());
  const [user, setUser] = useState<UserProfile>(() => db.getUserProfile());
  const [emails, setEmails] = useState<EmailNotification[]>(() => db.getEmails());

  // Modals
  const [selectedFlightForBooking, setSelectedFlightForBooking] = useState<{
    flight: Flight;
    cabinClass: CabinClass;
    flexibility: FareFlexibility;
  } | null>(null);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
  const [isPromptSpecModalOpen, setIsPromptSpecModalOpen] = useState<boolean>(false);
  
  // Toast alert
  const [toastMessage, setToastMessage] = useState<{ title: string; subtitle: string; icon?: string } | null>(null);

  // Subscribe to DB changes
  useEffect(() => {
    const unsubscribe = db.subscribe(() => {
      setFlights(db.getFlights());
      setBookings(db.getBookings());
      setUser(db.getUserProfile());
      setEmails(db.getEmails());
    });
    return unsubscribe;
  }, []);

  const triggerToast = (title: string, subtitle: string) => {
    setToastMessage({ title, subtitle });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Handlers
  const handleSelectFlight = (flight: Flight, cabinClass: CabinClass, flexibility: FareFlexibility) => {
    setSelectedFlightForBooking({ flight, cabinClass, flexibility });
  };

  const handleConfirmBooking = (newBooking: Booking) => {
    db.createBooking(newBooking);
    triggerToast(
      '✈ Booking Confirmed & Ticket Dispatched',
      `PNR ${newBooking.bookingReference} confirmed. Real-time e-ticket sent to ${user.email}.`
    );
  };

  const handleCancelBooking = (bookingId: string, refundAmount: number, penalty: number, reason: string) => {
    const success = db.cancelBooking(bookingId, refundAmount, penalty, reason);
    if (success) {
      triggerToast(
        '✕ Reservation Cancelled',
        `$${refundAmount.toLocaleString()} refund processed. Formal cancellation statement emailed.`
      );
    }
  };

  const handleUpdateSeats = (flightId: string, seatIds: string[]) => {
    db.updateSeatStatus(flightId, seatIds, 'occupied');
    triggerToast('💺 Seat Assignment Updated', `Assigned new seat ${seatIds.join(', ')}.`);
  };

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    db.updateUserProfile(updated);
    triggerToast('👤 Profile Updated', 'Traveler passport and loyalty settings saved.');
  };

  const handleResetDb = () => {
    db.resetToDefaults();
    triggerToast('🔄 Demo Database Reset', 'All flights, sample bookings, and rewards restored to default state.');
  };

  const unreadEmailCount = emails.filter((e) => !e.read).length;

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Ambient Frosted Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-indigo-600/20 blur-[130px] rounded-full"></div>
        <div className="absolute top-[25%] right-[-5%] w-[40%] h-[40%] bg-violet-600/15 blur-[140px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-cyan-600/15 blur-[160px] rounded-full"></div>
      </div>

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        unreadEmailCount={unreadEmailCount}
        onOpenEmails={() => setIsEmailModalOpen(true)}
        onOpenPromptSpec={() => setIsPromptSpecModalOpen(true)}
        onResetDb={handleResetDb}
        bookingCount={bookings.filter((b) => b.status === 'confirmed').length}
      />

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'search' && (
          <FlightSearch flights={flights} onSelectFlight={handleSelectFlight} />
        )}

        {activeTab === 'seats' && (
          <FleetExplorer
            flights={flights}
            onSelectFlightToBook={(f) => handleSelectFlight(f, 'business', 'superflex')}
          />
        )}

        {activeTab === 'bookings' && (
          <BookingsList
            bookings={bookings}
            flights={flights}
            onCancelBooking={handleCancelBooking}
            onUpdateSeats={handleUpdateSeats}
          />
        )}

        {activeTab === 'rewards' && <RewardsDashboard user={user} />}

        {activeTab === 'profile' && (
          <UserProfileView user={user} onUpdateProfile={handleUpdateProfile} />
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/30 backdrop-blur-md py-6 text-slate-400 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-wider text-slate-200">SKY VIEW GLOBAL AIRLINES</span>
            <span className="text-slate-600">•</span>
            <span>IATA & ICAO Certified Flight Operations</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsPromptSpecModalOpen(true)}
              className="hover:text-indigo-400 transition-colors"
            >
              System Prompt & Architecture Spec
            </button>
            <span>•</span>
            <button onClick={() => setIsEmailModalOpen(true)} className="hover:text-indigo-400 transition-colors">
              Email Notifications ({unreadEmailCount} unread)
            </button>
            <span>•</span>
            <button onClick={handleResetDb} className="hover:text-indigo-400 transition-colors">
              Reset Demo Data
            </button>
          </div>
        </div>
      </footer>

      {/* ================= MODALS ================= */}

      {/* Booking Modal Flow */}
      {selectedFlightForBooking && (
        <BookingModal
          flight={selectedFlightForBooking.flight}
          initialClass={selectedFlightForBooking.cabinClass}
          initialFlexibility={selectedFlightForBooking.flexibility}
          user={user}
          onClose={() => setSelectedFlightForBooking(null)}
          onConfirmBooking={(bk) => {
            handleConfirmBooking(bk);
            setSelectedFlightForBooking(null);
            setActiveTab('bookings');
          }}
        />
      )}

      {/* Email Inbox / Real-Time Notification Center */}
      {isEmailModalOpen && (
        <EmailInboxModal
          emails={emails}
          onClose={() => setIsEmailModalOpen(false)}
          onMarkAsRead={(id) => db.markEmailAsRead(id)}
          onMarkAllAsRead={() => db.markAllEmailsAsRead()}
        />
      )}

      {/* Prompt Specification & Architecture Blueprint */}
      {isPromptSpecModalOpen && (
        <PromptSpecModal onClose={() => setIsPromptSpecModalOpen(false)} />
      )}

      {/* Real-Time Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900/80 backdrop-blur-xl border border-white/15 rounded-2xl p-4 shadow-2xl shadow-indigo-950/40 flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-500/30">
            <Bell className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs">
            <div className="font-bold text-white">{toastMessage.title}</div>
            <div className="text-slate-300 mt-0.5">{toastMessage.subtitle}</div>
            <button
              onClick={() => {
                setToastMessage(null);
                setIsEmailModalOpen(true);
              }}
              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 mt-1.5 inline-block"
            >
              View in Notification Center ➔
            </button>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
