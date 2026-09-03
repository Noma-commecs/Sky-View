import React, { useState } from 'react';
import { EmailNotification } from '../types';
import { Mail, CheckCheck, X, Plane, AlertTriangle, Calendar, Clock, ExternalLink } from 'lucide-react';

interface EmailInboxModalProps {
  emails: EmailNotification[];
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export const EmailInboxModal: React.FC<EmailInboxModalProps> = ({
  emails,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const [selectedEmail, setSelectedEmail] = useState<EmailNotification | null>(emails[0] || null);

  const formatDateTime = (iso: string) => {
    return new Date(iso).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSelectEmail = (email: EmailNotification) => {
    setSelectedEmail(email);
    if (!email.read) {
      onMarkAsRead(email.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="bg-slate-950/90 backdrop-blur-2xl border border-white/10 rounded-3xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Real-Time Airline Email Dispatch Center</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  SMTP Live Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Live transactional emails dispatched for ticketing, refunds, seat updates, and flight alerts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllAsRead}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Mark All Read</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Two-Column Mail Interface */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Email List (5 cols) */}
          <div className="md:col-span-5 border-r border-white/10 overflow-y-auto divide-y divide-white/5 bg-black/20">
            {emails.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No notification emails dispatched yet.
              </div>
            ) : (
              emails.map((email) => {
                const isSelected = selectedEmail?.id === email.id;
                const isCancellation = email.type === 'booking_cancelled';

                return (
                  <div
                    key={email.id}
                    onClick={() => handleSelectEmail(email)}
                    className={`p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-500/15 border-l-4 border-l-indigo-400 text-white'
                        : 'hover:bg-white/5'
                    } ${!email.read ? 'bg-white/5' : 'opacity-80'}`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                        {isCancellation ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                        ) : (
                          <Plane className="w-3.5 h-3.5 text-indigo-400" />
                        )}
                        <span>Sky View Reservations</span>
                      </div>
                      <span>{formatDateTime(email.sentAt)}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {!email.read && (
                        <div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0"></div>
                      )}
                      <h4
                        className={`text-xs truncate ${
                          !email.read ? 'font-bold text-white' : 'font-medium text-slate-300'
                        }`}
                      >
                        {email.subject}
                      </h4>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                      {email.previewText}
                    </p>

                    <div className="mt-2 flex items-center gap-2 text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono border border-white/10">
                        PNR: {email.bookingReference}
                      </span>
                      <span className="text-slate-400">{email.route}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Email Preview Body (7 cols) */}
          <div className="md:col-span-7 bg-white/5 backdrop-blur-md overflow-y-auto p-4 sm:p-6 flex flex-col">
            {selectedEmail ? (
              <div className="space-y-4 max-w-2xl mx-auto w-full">
                {/* Email Meta header */}
                <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-slate-400">From:</span>
                      <span className="text-slate-200 font-bold ml-1">
                        Sky View International &lt;tickets@flyskyview.com&gt;
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {formatDateTime(selectedEmail.sentAt)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400">To:</span>
                    <span className="text-slate-200 font-semibold ml-1">{selectedEmail.to}</span>
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <span className="text-slate-400">Subject:</span>
                    <span className="text-white font-bold ml-1">{selectedEmail.subject}</span>
                  </div>
                </div>

                {/* Rendered HTML Email Content */}
                <div
                  className="rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-white text-slate-900"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.htmlContent }}
                />
              </div>
            ) : (
              <div className="m-auto text-center text-slate-500 text-xs">
                Select an email from the left sidebar to read notification contents.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
