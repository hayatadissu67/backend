import React, { useState } from 'react';

export const SettingsView: React.FC = () => {
  const [officeName, setOfficeName] = useState('Strategic Portfolio Office');
  const [fiscalYearStart, setFiscalYearStart] = useState('October 1');
  const [riskAlertThreshold, setRiskAlertThreshold] = useState('High');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl animate-fadeIn">
      <div>
        <h2 className="text-[24px] font-bold text-[#191c1e]">PMO Control Tower Settings</h2>
        <p className="text-xs text-slate-500">
          Configure strategic portfolio governance rules, fiscal year boundaries, and notification thresholds.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200/80 p-6 rounded-sm space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
            PMO Office Name
          </label>
          <input
            type="text"
            value={officeName}
            onChange={(e) => setOfficeName(e.target.value)}
            className="w-full border border-slate-300 rounded-sm p-2 outline-none focus:border-blue-600"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
            Fiscal Year Cycle Start
          </label>
          <select
            value={fiscalYearStart}
            onChange={(e) => setFiscalYearStart(e.target.value)}
            className="w-full border border-slate-300 rounded-sm p-2 outline-none focus:border-blue-600"
          >
            <option value="October 1">October 1 (Q4 Horizon)</option>
            <option value="January 1">January 1 (Calendar Year)</option>
            <option value="July 1">July 1 (Mid-Year)</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
            Executive Alert Trigger Level
          </label>
          <select
            value={riskAlertThreshold}
            onChange={(e) => setRiskAlertThreshold(e.target.value)}
            className="w-full border border-slate-300 rounded-sm p-2 outline-none focus:border-blue-600"
          >
            <option value="Critical">Critical Severity Only</option>
            <option value="High">High &amp; Critical Severity</option>
            <option value="All">All Unmitigated Risks</option>
          </select>
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-slate-100">
          {saved && <span className="text-emerald-600 font-bold text-xs">✓ Settings saved successfully</span>}
          <button
            type="submit"
            className="ml-auto px-5 py-2 bg-[#00174b] text-white font-bold text-xs rounded-sm uppercase tracking-wider hover:bg-indigo-950 transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
