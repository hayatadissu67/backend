import React, { useState } from 'react';
import { NotificationItem } from '../../types';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onMarkAllAsRead,
  onClearNotifications
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'alert'>('all');

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'alert') return n.type === 'alert';
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn max-w-3xl">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <nav className="flex items-center gap-1 text-[#45464d] font-bold text-[11px] tracking-wider uppercase mb-1">
            <span>SYSTEM</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#00174b]">NOTIFICATION CENTER</span>
          </nav>
          <h2 className="text-[26px] font-bold tracking-tight text-[#191c1e]">
            Executive Alerts &amp; Telemetry Feed
          </h2>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onMarkAllAsRead}
            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-sm"
          >
            Mark All as Read
          </button>
          <button
            onClick={onClearNotifications}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-sm"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-xs ${filter === 'all' ? 'bg-[#00174b] text-white' : 'text-slate-600 hover:text-slate-900'}`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1 rounded-xs ${filter === 'unread' ? 'bg-[#00174b] text-white' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Unread Only
        </button>
        <button
          onClick={() => setFilter('alert')}
          className={`px-3 py-1 rounded-xs ${filter === 'alert' ? 'bg-[#00174b] text-white' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Critical Alerts
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-sm text-slate-400 text-xs">
            No notifications found in this view.
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className={`p-4 bg-white border border-slate-200/80 rounded-sm shadow-2xs flex items-start justify-between gap-4 ${
                !n.isRead ? 'border-l-4 border-l-blue-600 bg-blue-50/20' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`material-symbols-outlined text-[20px] mt-0.5 ${
                    n.type === 'alert'
                      ? 'text-red-600'
                      : n.type === 'warning'
                      ? 'text-amber-500'
                      : n.type === 'success'
                      ? 'text-emerald-600'
                      : 'text-blue-600'
                  }`}
                >
                  {n.type === 'alert'
                    ? 'error'
                    : n.type === 'warning'
                    ? 'warning'
                    : n.type === 'success'
                    ? 'check_circle'
                    : 'info'}
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{n.title}</h4>
                  <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                </div>
              </div>

              <span className="text-[10px] font-mono text-slate-400 shrink-0">{n.timestamp}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
