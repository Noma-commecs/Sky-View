import React, { useState } from 'react';
import { Booking, Flight } from '../types';
import { calculateCancellationRefund } from '../utils/rewards';
import {
  Ticket, Plane, Calendar, Clock, AlertTriangle, CheckCircle2,
  XCircle, QrCode, ShieldAlert, ArrowRight, RotateCcw, Luggage, Printer
} from 'lucide-react';
import { SeatMap } from './SeatMap';

interface BookingsListProps {
  bookings: Booking[];
  flights: Flight[];
  onCancelBooking: (bookingId: string, refundAmount: number, penalty: number, reason: string) => void;
  onUpdateSeats: (flightId: string, seatIds: string[]) => void;
}

export const BookingsList: React.FC<BookingsListProps> = ({
  bookings,
  flights,
  onCancelBooking,
  onUpdateSeats,
}) => {
  const [selectedTicket, setSelectedTicket] = useState<Booking | null>(null);
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [cancellationReason, setCancellationReason] = useState<string>('Personal schedule change');
  const [seatChangeBooking, setSeatChangeBooking] = useState<Booking | null>(null);
  const [newSelectedSeatId, setNewSelectedSeatId] = useState<string>('');

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleConfirmCancellation = () => {
    if (!cancellingBooking) return;
    const calc = calculateCancellationRefund(
      cancellingBooking.totalPrice,
      cancellingBooking.flexibility,
      cancellingBooking.pointsRedeemed
    );

    onCancelBooking(cancellingBooking.id, calc.refundAmount, calc.penalty, cancellationReason);
    setCancellingBooking(null);
  };

  const handleConfirmSeatChange = () => {
    if (!seatChangeBooking || !newSelectedSeatId) return;
    // Release old seat, assign new seat
    onUpdateSeats(seatChangeBooking.flightId, [newSelectedSeatId]);
    seatChangeBooking.selectedSeatIds = [newSelectedSeatId];
    if (seatChangeBooking.passengers[0]) {
      seatChangeBooking.passengers[0].assignedSeatId = newSelectedSeatId;
    }
    setSeatChangeBooking(null);
    setNewSelectedSeatId('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">My Trips & Reservations</h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your scheduled international flights, view e-tickets, update seat assignments, or process cancellations.
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 backdrop-blur-md">
          Total Bookings: {bookings.length}
        </div>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="text-center py-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl">
          <Ticket className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Flights Currently Booked</h3>
          <p className="text-xs text-slate-400 mt-1">
            Search for international destinations to book your next voyage with Sky View.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const isCancelled = booking.status === 'cancelled';
            const refundCalc = calculateCancellationRefund(
              booking.totalPrice,
              booking.flexibility,
              booking.pointsRedeemed
            );

            return (
              <div
                key={booking.id}
                className={`backdrop-blur-xl border rounded-3xl p-5 sm:p-6 transition-all ${
                  isCancelled
                    ? 'border-red-500/20 bg-red-950/20 opacity-75'
                    : 'bg-white/5 border-white/10 hover:border-white/20 shadow-xl'
                }`}
              >
                {/* Top Status Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-white/10 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      PNR:
                    </span>
                    <strong className="font-mono text-indigo-400 font-bold tracking-widest text-sm">
                      {booking.bookingReference}
                    </strong>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-300">Booked {formatDate(booking.bookedAt)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        isCancelled
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {booking.status}
                    </span>

                    <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 border border-white/10 text-[11px] font-medium capitalize">
                      {booking.flexibility} Fare
                    </span>
                  </div>
                </div>

                {/* Routing & Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  {/* Origin to Destination (6 cols) */}
                  <div className="lg:col-span-6 grid grid-cols-7 items-center gap-2">
                    <div className="col-span-3 text-left">
                      <div className="text-2xl font-extrabold text-white">
                        {formatTime(booking.flight.departureTime)}
                      </div>
                      <div className="text-sm font-bold text-indigo-400">{booking.flight.origin.code}</div>
                      <div className="text-xs text-slate-400 truncate">
                        {booking.flight.origin.city}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Terminal {booking.flight.terminal}
                      </div>
                    </div>

                    <div className="col-span-1 flex flex-col items-center">
                      <Plane className="w-4 h-4 text-indigo-400 transform rotate-90" />
                      <span className="text-[10px] text-slate-500 mt-1">Non-stop</span>
                    </div>

                    <div className="col-span-3 text-right">
                      <div className="text-2xl font-extrabold text-white">
                        {formatTime(booking.flight.arrivalTime)}
                      </div>
                      <div className="text-sm font-bold text-indigo-400">{booking.flight.destination.code}</div>
                      <div className="text-xs text-slate-400 truncate">
                        {booking.flight.destination.city}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Gate {booking.flight.gate}
                      </div>
                    </div>
                  </div>

                  {/* Flight & Passenger summary (3 cols) */}
                  <div className="lg:col-span-3 text-xs space-y-1.5 border-t lg:border-t-0 lg:border-l border-white/10 pt-3 lg:pt-0 lg:pl-5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Flight:</span>
                      <strong className="text-white">{booking.flight.flightNumber}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cabin Class:</span>
                      <strong className="text-white capitalize">{booking.cabinClass.replace('_', ' ')}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Seat(s):</span>
                      <strong className="text-indigo-400 font-mono font-bold">
                        {booking.selectedSeatIds.join(', ') || 'Pending'}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Passenger:</span>
                      <span className="text-slate-200">
                        {booking.passengers[0]?.firstName} {booking.passengers[0]?.lastName}
                      </span>
                    </div>
                  </div>

                  {/* Actions (3 cols) */}
                  <div className="lg:col-span-3 flex flex-col sm:flex-row lg:flex-col gap-2 justify-end">
                    {!isCancelled ? (
                      <>
                        <button
                          onClick={() => setSelectedTicket(booking)}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          <span>View Boarding Pass</span>
                        </button>

                        <button
                          onClick={() => {
                            setSeatChangeBooking(booking);
                            setNewSelectedSeatId(booking.selectedSeatIds[0] || '');
                          }}
                          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                        >
                          <Plane className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Change Seat</span>
                        </button>

                        <button
                          onClick={() => setCancellingBooking(booking)}
                          className="px-4 py-1.5 rounded-xl text-red-400 hover:bg-red-500/10 text-xs font-medium transition-all flex items-center justify-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel Flight</span>
                        </button>
                      </>
                    ) : (
                      <div className="text-xs p-2.5 rounded-xl bg-red-950/30 border border-red-900/40 text-red-300 space-y-1">
                        <div className="font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Reservation Cancelled</span>
                        </div>
                        <div>
                          Refund: <strong>${booking.cancellationDetails?.refundAmount.toLocaleString()}</strong>
                        </div>
                        <div className="text-[10px] text-red-400">
                          {booking.cancellationDetails?.refundMethod}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL 1: BOARDING PASS & E-TICKET ================= */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Ticket Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 p-6 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Plane className="w-5 h-5 transform -rotate-45" />
                  <span className="font-extrabold tracking-widest text-lg">SKY VIEW AIRWAYS</span>
                </div>
                <p className="text-xs text-indigo-100 mt-1">Official Electronic Boarding Pass & Travel Document</p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 rounded-lg bg-black/20 hover:bg-black/30 text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Ticket Content */}
            <div className="p-6 space-y-5 text-xs">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <span className="text-slate-400 uppercase text-[10px]">Passenger</span>
                  <div className="text-base font-bold text-white">
                    {selectedTicket.passengers[0]?.firstName} {selectedTicket.passengers[0]?.lastName}
                  </div>
                  <div className="text-slate-400">
                    Passport: {selectedTicket.passengers[0]?.passportNumber}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 uppercase text-[10px]">PNR / E-Ticket</span>
                  <div className="text-base font-mono font-extrabold text-indigo-400">
                    {selectedTicket.bookingReference}
                  </div>
                  <div className="text-slate-400 capitalize">{selectedTicket.cabinClass.replace('_', ' ')}</div>
                </div>
              </div>

              {/* Routing */}
              <div className="grid grid-cols-3 items-center bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center">
                <div className="text-left">
                  <div className="text-2xl font-black text-white">{selectedTicket.flight.origin.code}</div>
                  <div className="text-slate-300">{selectedTicket.flight.origin.city}</div>
                  <div className="text-[11px] text-indigo-400 font-bold mt-1">
                    {formatTime(selectedTicket.flight.departureTime)}
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-400">{selectedTicket.flight.flightNumber}</span>
                  <Plane className="w-4 h-4 text-indigo-400 my-1 transform rotate-90" />
                  <span className="text-[10px] text-emerald-400">Non-stop</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-white">{selectedTicket.flight.destination.code}</div>
                  <div className="text-slate-300">{selectedTicket.flight.destination.city}</div>
                  <div className="text-[11px] text-indigo-400 font-bold mt-1">
                    {formatTime(selectedTicket.flight.arrivalTime)}
                  </div>
                </div>
              </div>

              {/* Gate, Terminal, Seat Boarding Details */}
              <div className="grid grid-cols-4 gap-2 text-center p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase">Terminal</span>
                  <div className="text-sm font-bold text-white">{selectedTicket.flight.terminal}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase">Gate</span>
                  <div className="text-sm font-bold text-white">{selectedTicket.flight.gate}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase">Boarding</span>
                  <div className="text-sm font-bold text-amber-400">45m Prior</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase">Seat</span>
                  <div className="text-base font-extrabold text-indigo-400">
                    {selectedTicket.selectedSeatIds.join(', ') || 'Auto'}
                  </div>
                </div>
              </div>

              {/* Barcode & Security Strip */}
              <div className="pt-2 border-t border-dashed border-white/10 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-mono text-[11px] tracking-widest text-slate-400">
                    ||| | |||| | ||| ||||| |||| ||| |||||| |
                  </div>
                  <div className="text-[10px] text-slate-400">
                    ELECTRONIC VALIDATED BOARDING PASS • SKY VIEW APP
                  </div>
                </div>
                <QrCode className="w-12 h-12 text-slate-200" />
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Ticket</span>
                </button>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20"
                >
                  Close Pass
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: CANCEL RESERVATION ================= */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-red-500/30 rounded-3xl w-full max-w-lg shadow-2xl p-6 text-xs space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Cancel Flight Reservation</h3>
                <p className="text-slate-400">PNR: {cancellingBooking.bookingReference}</p>
              </div>
            </div>

            {/* Refund Calculation Policy Notice */}
            {(() => {
              const calc = calculateCancellationRefund(
                cancellingBooking.totalPrice,
                cancellingBooking.flexibility,
                cancellingBooking.pointsRedeemed
              );

              return (
                <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="font-bold text-slate-300">Fare Class Policy</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold capitalize">
                      {cancellingBooking.flexibility}
                    </span>
                  </div>

                  <p className="text-slate-300">{calc.policyNotice}</p>

                  <div className="space-y-1.5 pt-2 border-t border-white/10">
                    <div className="flex justify-between text-slate-400">
                      <span>Original Paid Amount:</span>
                      <span>${cancellingBooking.totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-red-400">
                      <span>Cancellation Fee / Penalty:</span>
                      <span>-${calc.penalty.toLocaleString()}</span>
                    </div>
                    {calc.pointsRefunded > 0 && (
                      <div className="flex justify-between text-amber-400">
                        <span>SkyPoints Restored:</span>
                        <span>+{calc.pointsRefunded.toLocaleString()} pts</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-extrabold text-emerald-400 pt-2 border-t border-white/10">
                      <span>Total Refund Credited:</span>
                      <span>${calc.refundAmount.toLocaleString()} USD</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div>
              <label className="text-slate-300 font-semibold mb-1 block">Reason for cancellation:</label>
              <select
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-slate-200 outline-none backdrop-blur-sm"
              >
                <option className="bg-slate-900 text-white">Personal schedule adjustment</option>
                <option className="bg-slate-900 text-white">Found alternative travel dates</option>
                <option className="bg-slate-900 text-white">Visa or passport documentation delay</option>
                <option className="bg-slate-900 text-white">Medical or family emergency</option>
                <option className="bg-slate-900 text-white">Trip postponed</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCancellingBooking(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold"
              >
                Keep Flight
              </button>
              <button
                onClick={handleConfirmCancellation}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all shadow-lg shadow-red-600/20"
              >
                Confirm Cancellation & Process Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: CHANGE SEATS ================= */}
      {seatChangeBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl p-6 text-xs space-y-4 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white">
                  Update Aircraft Seat Assignment ({seatChangeBooking.flight.flightNumber})
                </h3>
                <p className="text-slate-400">
                  Current Seat: {seatChangeBooking.selectedSeatIds.join(', ') || 'None'} • Cabin:{' '}
                  {seatChangeBooking.cabinClass.replace('_', ' ')}
                </p>
              </div>
              <button
                onClick={() => setSeatChangeBooking(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              <SeatMap
                seats={seatChangeBooking.flight.seats}
                selectedSeatIds={newSelectedSeatId ? [newSelectedSeatId] : seatChangeBooking.selectedSeatIds}
                onToggleSeat={(sId) => setNewSelectedSeatId(sId)}
                allowedClass={seatChangeBooking.cabinClass}
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div className="text-xs text-slate-300">
                New Selection: <strong className="text-amber-400">{newSelectedSeatId || 'None'}</strong>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSeatChangeBooking(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  disabled={!newSelectedSeatId}
                  onClick={handleConfirmSeatChange}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold disabled:opacity-50 shadow-lg shadow-indigo-600/20"
                >
                  Confirm Seat Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
