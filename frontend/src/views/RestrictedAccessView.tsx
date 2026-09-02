import React from 'react';
import { LoggedInPersona } from '../types';

interface RestrictedAccessViewProps {
  currentPersona: LoggedInPersona;
  tabName: string;
  onLogout?: () => void;
}

export const RestrictedAccessView: React.FC<RestrictedAccessViewProps> = ({
  currentPersona,
  tabName,
  onLogout
}) => {
  return (
    <div className="max-w-3xl mx-auto my-12 bg-white border border-slate-200 rounded-sm shadow-sm p-8 text-center space-y-6 animate-fadeIn">
      <div className="w-16 h-16 bg-amber-50 border border-amber-200 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
        <span className="material-symbols-outlined text-[36px]">lock</span>
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold uppercase tracking-wider">
          <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
          <span>Administrator Authorization Required</span>
        </div>

        <h2 className="text-2xl font-black text-slate-900 tracking-tight capitalize">
          {tabName} Access Restricted
        </h2>

        <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
          Logged in as <strong className="text-slate-900">{currentPersona.name}</strong> ({currentPersona.roleTitle}).
          This module requires administrator management credentials.
        </p>
      </div>

      {/* Relevant Member Summary Box */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-sm max-w-md mx-auto text-left text-xs space-y-2">
        <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-blue-600 text-[18px]">info</span>
          Authorized Account Features:
        </h4>
        <ul className="space-y-1 text-slate-600 list-disc list-inside">
          <li>View and update assigned project tasks &amp; progress %</li>
          <li>Log developer work hours &amp; post status updates</li>
          <li>Notify Project Manager on task completion</li>
          <li>Access assigned project meetings &amp; team discussions</li>
        </ul>
      </div>

      {onLogout && (
        <div className="pt-4">
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-sm font-bold shadow-md transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Sign Out
          </button>
        </div>
      )}


    </div>
  );
};
