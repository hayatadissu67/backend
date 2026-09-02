import React, { useState } from 'react';
import { MeetingItem } from '../../types';

interface MeetingsViewProps {
  meetings: MeetingItem[];
  onAddMeeting: (meeting: MeetingItem) => void;
}

export const MeetingsView: React.FC<MeetingsViewProps> = ({ meetings, onAddMeeting }) => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const getLocalToday = () => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  };

  const [date, setDate] = useState(getLocalToday());
  const [time, setTime] = useState('10:00 AM - 11:00 AM');
  const [location, setLocation] = useState('Executive Boardroom A');
  const [agenda, setAgenda] = useState('');

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    if (date < getLocalToday()) {
      alert('Cannot schedule a meeting in the past.');
      return;
    }

    const newM: MeetingItem = {
      id: `m-${Date.now()}`,
      title,
      date,
      time,
      attendees: ['PMO Steering Committee', 'Portfolio Leads'],
      location,
      status: 'Scheduled',
      agenda: agenda || 'Strategic portfolio alignment and gate reviews.'
    };

    onAddMeeting(newM);
    setTitle('');
    setAgenda('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <nav className="flex items-center gap-1 text-[#45464d] font-bold text-[11px] tracking-wider uppercase mb-1">
            <span>GOVERNANCE</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#00174b]">STEERING COMMITTEE MEETINGS</span>
          </nav>
          <h2 className="text-[26px] font-bold tracking-tight text-[#191c1e]">
            Executive Meetings &amp; Governance Sessions
          </h2>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-[#00174b] text-white font-bold text-xs rounded-sm hover:bg-indigo-950 flex items-center gap-1.5 shadow-2xs"
        >
          <span className="material-symbols-outlined text-[16px]">event_available</span>
          Schedule Meeting
        </button>
      </div>

      {/* Meetings Schedule List */}
      <div className="space-y-4">
        {meetings.map((m) => (
          <div key={m.id} className="bg-white border border-slate-200/80 p-5 rounded-sm shadow-2xs space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase bg-blue-100 text-blue-900 px-2 py-0.5 rounded-xs mr-2">
                  {m.status}
                </span>
                <h3 className="inline text-base font-bold text-slate-900">{m.title}</h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">calendar_today</span>
                    {m.date} ({m.time})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">location_on</span>
                    {m.location}
                  </span>
                </p>
              </div>

              <button className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xs flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-amber-500">auto_awesome</span>
                AI Minutes
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xs border border-slate-200/60 text-xs">
              <p className="font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">Agenda &amp; Focus Area:</p>
              <p className="text-slate-800">{m.agenda}</p>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <span className="font-bold text-slate-700">Attendees ({m.attendees.length}):</span>
              {m.attendees.map((att, i) => (
                <span key={i} className="bg-slate-100 px-2 py-0.5 rounded-xs font-medium text-slate-700">
                  {att}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* SCHEDULE MEETING MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-sm border border-slate-300 shadow-xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">Schedule Governance Session</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Session Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q4 Gate Pass Review"
                  className="w-full border border-slate-300 p-2 rounded-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Date</label>
                  <input
                    type="date"
                    min={getLocalToday()}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-slate-300 p-2 rounded-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Time</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="10:00 AM - 11:30 AM"
                    className="w-full border border-slate-300 p-2 rounded-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Location / Link</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border border-slate-300 p-2 rounded-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Agenda Summary</label>
                <textarea
                  rows={2}
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  placeholder="Focus areas..."
                  className="w-full border border-slate-300 p-2 rounded-sm"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 border rounded-sm font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#00174b] text-white font-bold rounded-sm uppercase tracking-wider"
                >
                  Schedule Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
