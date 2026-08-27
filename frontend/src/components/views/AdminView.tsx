import React, { useState } from 'react';

interface IPWhitelistEntry {
  id: string;
  ip: string;
  label: string;
  addedBy: string;
  addedDate: string;
  status: 'ACTIVE' | 'PENDING';
}

interface StageGateRule {
  gate: string;
  name: string;
  minQuorum: number; // percentage of committee approval required
  budgetCap: number; // max budget authority in USD
  autoEscalateRiskScore: number; // threshold 1-10
  requireAuditSignoff: boolean;
}

interface BackupSnapshot {
  id: string;
  version: string;
  timestamp: string;
  size: string;
  type: 'AUTOMATED' | 'MANUAL';
  checksum: string;
}

interface AuditLog {
  id: string;
  action: string;
  category: 'SECURITY' | 'GOVERNANCE' | 'SYSTEM' | 'FINANCIAL';
  detail: string;
  user: string;
  ip: string;
  time: string;
}

export const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Overview' | 'Governance Rules' | 'Security & Access' | 'Backup & DR' | 'AI Governance'>('Overview');
  
  // Toast Notification
  const [toast, setToast] = useState<string | null>(null);

  // System State Controls
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [emergencyLockdown, setEmergencyLockdown] = useState<boolean>(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState<boolean>(true);
  const [enforce2FA, setEnforce2FA] = useState<boolean>(true);
  const [debugLogging, setDebugLogging] = useState<boolean>(false);
  const [sessionTimeoutMins, setSessionTimeoutMins] = useState<number>(30);
  const [currencySymbol, setCurrencySymbol] = useState<string>('USD ($)');
  const [fiscalYearStart, setFiscalYearStart] = useState<string>('January 1');

  // Interactive Live Metrics
  const [latency, setLatency] = useState<number>(12);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [memoryUsage, setMemoryUsage] = useState<number>(34);
  const [activeSessions, setActiveSessions] = useState<number>(14);

  // IP Whitelist
  const [ipList, setIpList] = useState<IPWhitelistEntry[]>([
    { id: 'ip-1', ip: '192.168.1.100/32', label: 'PMO HQ Primary Gateway', addedBy: 'System Administrator', addedDate: 'Jul 10, 2026', status: 'ACTIVE' },
    { id: 'ip-2', ip: '10.0.4.0/24', label: 'Internal Cloud Subnet (US-East)', addedBy: 'DevOps Lead', addedDate: 'Jul 18, 2026', status: 'ACTIVE' },
    { id: 'ip-3', ip: '172.16.22.15/32', label: 'Executive Board VPN Range', addedBy: 'Security Auditor', addedDate: 'Aug 01, 2026', status: 'ACTIVE' },
  ]);
  const [newIpAddress, setNewIpAddress] = useState('');
  const [newIpLabel, setNewIpLabel] = useState('');

  // Stage Gate Rules Config
  const [gateRules, setGateRules] = useState<StageGateRule[]>([
    { gate: 'Gate 1', name: 'Concept & Business Case', minQuorum: 75, budgetCap: 250000, autoEscalateRiskScore: 8, requireAuditSignoff: false },
    { gate: 'Gate 2', name: 'Architecture & Planning', minQuorum: 80, budgetCap: 1000000, autoEscalateRiskScore: 7, requireAuditSignoff: true },
    { gate: 'Gate 3', name: 'Execution & Build Approval', minQuorum: 85, budgetCap: 5000000, autoEscalateRiskScore: 7, requireAuditSignoff: true },
    { gate: 'Gate 4', name: 'Monitoring & UAT Cutover', minQuorum: 90, budgetCap: 10000000, autoEscalateRiskScore: 6, requireAuditSignoff: true },
    { gate: 'Gate 5', name: 'Closure & Benefit Realization', minQuorum: 100, budgetCap: 50000000, autoEscalateRiskScore: 5, requireAuditSignoff: true },
  ]);

  // Backups
  const [backups, setBackups] = useState<BackupSnapshot[]>([
    { id: 'bk-104', version: 'v2.8.4-prod', timestamp: 'Aug 03, 2026 00:00', size: '142.8 MB', type: 'AUTOMATED', checksum: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
    { id: 'bk-103', version: 'v2.8.4-prod', timestamp: 'Aug 02, 2026 00:00', size: '141.2 MB', type: 'AUTOMATED', checksum: 'sha256:8f4e2c66d11b22e1a3d9078651c68285df649f8510eb34ef4d89a69ef4848d5d' },
    { id: 'bk-102', version: 'v2.8.3-prod', timestamp: 'Jul 28, 2026 15:30', size: '138.5 MB', type: 'MANUAL', checksum: 'sha256:a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e' },
  ]);
  const [isBackingUp, setIsBackingUp] = useState(false);

  // AI & Analytics Config
  const [geminiQuotaPerDept, setGeminiQuotaPerDept] = useState<number>(50000);
  const [riskDetectionSensitivity, setRiskDetectionSensitivity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'STRICT'>('HIGH');
  const [autoSummarySchedule, setAutoSummarySchedule] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('WEEKLY');

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: 'l1', action: 'User Created', category: 'SECURITY', detail: 'Elena Rostova added as Portfolio Manager', user: 'System Administrator', ip: '192.168.1.100', time: '10 mins ago' },
    { id: 'l2', action: 'Security Policy Update', category: 'SECURITY', detail: 'Enforced 2FA requirement on all Gate Sign-off accounts', user: 'System Administrator', ip: '192.168.1.100', time: '2 hours ago' },
    { id: 'l3', action: 'Budget Threshold Adjusted', category: 'FINANCIAL', detail: 'Critical risk alert limit set to $100,000 variance', user: 'PMO Admin', ip: '10.0.4.12', time: '1 day ago' },
    { id: 'l4', action: 'Database Snapshot', category: 'SYSTEM', detail: 'Automated daily backup completed successfully (bk-104)', user: 'System Bot', ip: 'Internal Cloud', time: '2 days ago' },
    { id: 'l5', action: 'Gate Rule Modification', category: 'GOVERNANCE', detail: 'Updated Gate 4 UAT approval quorum to 90%', user: 'Sarah Jenkins', ip: '172.16.22.15', time: '3 days ago' },
  ]);

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleRunDiagnostics = () => {
    setIsPinging(true);
    setTimeout(() => {
      const newLatency = Math.floor(Math.random() * 8) + 8; // 8ms to 15ms
      setLatency(newLatency);
      setMemoryUsage(Math.floor(Math.random() * 10) + 30);
      setIsPinging(false);
      showToastMsg(`✓ Health check complete: Latency ${newLatency}ms, Storage & SQL Engine 100% Healthy`);
    }, 800);
  };

  const handlePurgeCache = () => {
    showToastMsg('✓ System redis cache & temporary query buffers purged successfully');
    const newLog: AuditLog = {
      id: `l-${Date.now()}`,
      action: 'System Cache Purge',
      category: 'SYSTEM',
      detail: 'Purged temporary query buffers and app session cache',
      user: 'Current Admin',
      ip: '192.168.1.100',
      time: 'Just now'
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleFlushSessions = () => {
    if (window.confirm('Are you sure you want to terminate all active non-admin user sessions?')) {
      setActiveSessions(1);
      showToastMsg('✓ All active user sessions terminated. Users prompted to re-authenticate.');
      const newLog: AuditLog = {
        id: `l-${Date.now()}`,
        action: 'Emergency Session Flush',
        category: 'SECURITY',
        detail: 'Forced termination of 13 active user sessions',
        user: 'Current Admin',
        ip: '192.168.1.100',
        time: 'Just now'
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    }
  };

  const handleTriggerManualBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      const newBk: BackupSnapshot = {
        id: `bk-${Date.now().toString().slice(-3)}`,
        version: 'v2.8.4-prod',
        timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        size: '143.5 MB',
        type: 'MANUAL',
        checksum: `sha256:${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
      };
      setBackups((prev) => [newBk, ...prev]);
      showToastMsg('✓ Manual DB snapshot generated & saved to encrypted Cloud bucket.');

      const newLog: AuditLog = {
        id: `l-${Date.now()}`,
        action: 'Manual Database Snapshot',
        category: 'SYSTEM',
        detail: `Generated snapshot ${newBk.id} (${newBk.size})`,
        user: 'Current Admin',
        ip: '192.168.1.100',
        time: 'Just now'
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    }, 1500);
  };

  const handleAddIP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIpAddress) return;
    const entry: IPWhitelistEntry = {
      id: `ip-${Date.now()}`,
      ip: newIpAddress,
      label: newIpLabel || 'Custom Admin Access Point',
      addedBy: 'Current Admin',
      addedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'ACTIVE'
    };
    setIpList([...ipList, entry]);
    setNewIpAddress('');
    setNewIpLabel('');
    showToastMsg(`✓ Added ${entry.ip} to security whitelist.`);
  };

  const handleRemoveIP = (id: string, ip: string) => {
    setIpList(ipList.filter((i) => i.id !== id));
    showToastMsg(`✓ Removed ${ip} from security whitelist.`);
  };

  const handleUpdateGateQuorum = (gate: string, val: number) => {
    setGateRules((prev) =>
      prev.map((g) => (g.gate === gate ? { ...g, minQuorum: val } : g))
    );
  };

  const handleExportSystemConfig = () => {
    const configData = {
      exportTimestamp: new Date().toISOString(),
      maintenanceMode,
      emergencyLockdown,
      enforce2FA,
      sessionTimeoutMins,
      currencySymbol,
      fiscalYearStart,
      ipWhitelist: ipList,
      stageGateRules: gateRules,
      aiGovernance: {
        geminiQuotaPerDept,
        riskDetectionSensitivity,
        autoSummarySchedule
      }
    };

    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pmo_admin_config_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToastMsg('✓ Downloaded PMO System Configuration JSON');
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl pb-16">
      {/* Toast Banner */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-[#00174b] text-white px-4 py-3 rounded-lg shadow-xl font-bold text-xs flex items-center gap-2 border border-blue-400/40 animate-bounce">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
          {toast}
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <nav className="flex items-center gap-1 text-[#45464d] font-bold text-[11px] tracking-wider uppercase mb-1">
            <span>GOVERNANCE</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#00174b]">SYSTEM ADMINISTRATION CONSOLE</span>
          </nav>
          <h1 className="text-2xl font-black tracking-tight text-[#191c1e] flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-700 text-[28px]">admin_panel_settings</span>
            PMO Control Tower Executive Console
          </h1>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportSystemConfig}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5 border border-slate-300"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export Config
          </button>
          
          <button
            onClick={handleTriggerManualBackup}
            disabled={isBackingUp}
            className="px-4 py-2 bg-[#00174b] hover:bg-indigo-950 text-white font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
          >
            {isBackingUp ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                Backing Up...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                Trigger DB Snapshot
              </>
            )}
          </button>
        </div>
      </div>

      {/* Emergency Lockdown Banner if active */}
      {emergencyLockdown && (
        <div className="bg-red-600 text-white p-4 rounded-xl shadow-md flex justify-between items-center animate-pulse">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl">lock_clock</span>
            <div>
              <p className="font-extrabold text-sm uppercase">EMERGENCY LOCKDOWN MODE ACTIVE</p>
              <p className="text-xs text-red-100">All non-admin API routes &amp; project edits are strictly frozen.</p>
            </div>
          </div>
          <button
            onClick={() => setEmergencyLockdown(false)}
            className="px-3 py-1.5 bg-white text-red-700 font-black text-xs rounded-md shadow hover:bg-red-50 cursor-pointer"
          >
            Disable Lockdown
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200/80 pb-2 overflow-x-auto">
        {(['Overview', 'Governance Rules', 'Security & Access', 'Backup & DR', 'AI Governance'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab
                ? 'bg-[#2563eb] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & SYSTEM TELEMETRY */}
      {activeTab === 'Overview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 border border-slate-200/80 rounded-xl shadow-2xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Cloud SQL Latency</span>
                <button
                  onClick={handleRunDiagnostics}
                  disabled={isPinging}
                  className="text-blue-600 hover:text-blue-800 text-[10px] font-bold uppercase cursor-pointer flex items-center gap-0.5"
                >
                  <span className={`material-symbols-outlined text-[13px] ${isPinging ? 'animate-spin' : ''}`}>sync</span>
                  Ping Test
                </button>
              </div>
              <p className="text-2xl font-black text-emerald-600 font-mono">{latency} ms</p>
              <p className="text-[10px] text-slate-500 font-medium">PostgreSQL Engine • Region us-east2</p>
            </div>

            <div className="bg-white p-5 border border-slate-200/80 rounded-xl shadow-2xs space-y-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Container Memory</span>
              <p className="text-2xl font-black text-blue-900 font-mono">{memoryUsage}%</p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full" style={{ width: `${memoryUsage}%` }} />
              </div>
              <p className="text-[10px] text-slate-500 font-medium">1.36 GB allocated of 4.0 GB cap</p>
            </div>

            <div className="bg-white p-5 border border-slate-200/80 rounded-xl shadow-2xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Active Sessions</span>
                <button
                  onClick={handleFlushSessions}
                  className="text-red-600 hover:text-red-800 text-[10px] font-bold uppercase cursor-pointer"
                  title="Force disconnect all non-admin users"
                >
                  Flush All
                </button>
              </div>
              <p className="text-2xl font-black text-slate-900 font-mono">{activeSessions} Active</p>
              <p className="text-[10px] text-slate-500 font-medium">1 Executive, 4 Risk Mgrs, 9 PMs</p>
            </div>

            <div className="bg-white p-5 border border-slate-200/80 rounded-xl shadow-2xs space-y-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">System State</span>
              <div className="pt-1">
                <span className={`px-2.5 py-1 rounded-md text-xs font-black uppercase ${
                  emergencyLockdown ? 'bg-red-100 text-red-800' : maintenanceMode ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {emergencyLockdown ? 'Lockdown' : maintenanceMode ? 'Maintenance' : 'Operational'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">All services online &amp; synchronized</p>
            </div>
          </div>

          {/* Quick System Controls & Master Switches */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="material-symbols-outlined text-blue-600 text-[20px]">tune</span>
              Global System Flags &amp; Master Operational Controls
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Switch 1: Maintenance Mode */}
              <div className="flex justify-between items-center p-4 bg-slate-50 border border-slate-200/80 rounded-lg">
                <div className="space-y-0.5">
                  <p className="font-extrabold text-slate-900 text-xs">System Maintenance Mode</p>
                  <p className="text-[11px] text-slate-500">Restricts non-admin access while conducting upgrades.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={maintenanceMode}
                    onChange={(e) => {
                      setMaintenanceMode(e.target.checked);
                      showToastMsg(`✓ Maintenance mode ${e.target.checked ? 'ENABLED' : 'DISABLED'}`);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              {/* Switch 2: Emergency Lockdown */}
              <div className="flex justify-between items-center p-4 bg-slate-50 border border-slate-200/80 rounded-lg">
                <div className="space-y-0.5">
                  <p className="font-extrabold text-red-900 text-xs">Emergency Security Freeze</p>
                  <p className="text-[11px] text-slate-500">Instantly locks all project edits and stage sign-offs.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emergencyLockdown}
                    onChange={(e) => {
                      setEmergencyLockdown(e.target.checked);
                      showToastMsg(`✓ Emergency freeze ${e.target.checked ? 'ACTIVATED' : 'DEACTIVATED'}`);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              {/* Switch 3: Auto Database Backup */}
              <div className="flex justify-between items-center p-4 bg-slate-50 border border-slate-200/80 rounded-lg">
                <div className="space-y-0.5">
                  <p className="font-extrabold text-slate-900 text-xs">Automated Midnight Snapshot</p>
                  <p className="text-[11px] text-slate-500">Run nightly full Cloud SQL backups at 00:00 UTC.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoBackupEnabled}
                    onChange={(e) => {
                      setAutoBackupEnabled(e.target.checked);
                      showToastMsg(`✓ Automated midnight snapshot ${e.target.checked ? 'ENABLED' : 'DISABLED'}`);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Switch 4: Debug Telemetry */}
              <div className="flex justify-between items-center p-4 bg-slate-50 border border-slate-200/80 rounded-lg">
                <div className="space-y-0.5">
                  <p className="font-extrabold text-slate-900 text-xs">Verbose Telemetry &amp; Debug Logs</p>
                  <p className="text-[11px] text-slate-500">Record microsecond API trace timestamps for dev team.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={debugLogging}
                    onChange={(e) => {
                      setDebugLogging(e.target.checked);
                      showToastMsg(`✓ Verbose logging ${e.target.checked ? 'ENABLED' : 'DISABLED'}`);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* General Utilities Row */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700">Purge Buffers:</span>
                <button
                  onClick={handlePurgeCache}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">cleaning_services</span>
                  Purge Redis Cache
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700">Session Timeout:</span>
                <select
                  value={sessionTimeoutMins}
                  onChange={(e) => {
                    setSessionTimeoutMins(Number(e.target.value));
                    showToastMsg(`✓ Session timeout updated to ${e.target.value} minutes`);
                  }}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 outline-none cursor-pointer"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={60}>1 Hour</option>
                  <option value={120}>2 Hours</option>
                </select>
              </div>
            </div>
          </div>

          {/* Audit Logs Trail */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-700 text-[20px]">receipt_long</span>
                Real-Time System Governance &amp; Security Audit Trail
              </h3>
              <span className="text-[11px] font-mono text-slate-400">{auditLogs.length} events logged</span>
            </div>

            <div className="divide-y divide-slate-100 font-mono text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-2.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 hover:bg-slate-50/70 px-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.category === 'SECURITY' ? 'bg-red-100 text-red-800' : log.category === 'GOVERNANCE' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {log.action}
                    </span>
                    <span className="font-sans font-medium text-slate-800">{log.detail}</span>
                  </div>

                  <div className="flex items-center gap-4 text-[10px] text-slate-400">
                    <span>IP: {log.ip}</span>
                    <span className="font-bold text-slate-700">{log.user}</span>
                    <span>{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GOVERNANCE RULES & STAGE-GATE THRESHOLDS */}
      {activeTab === 'Governance Rules' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[22px]">gavel</span>
                Stage-Gate Governance &amp; Committee Quorum Matrix
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure minimum sign-off approval thresholds, budget caps, and automatic risk escalation limits for each lifecycle gate.
              </p>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                    <th className="py-3 px-4">Gate &amp; Phase Name</th>
                    <th className="py-3 px-4">Min Approval Quorum (%)</th>
                    <th className="py-3 px-4">Max Budget Cap (USD)</th>
                    <th className="py-3 px-4">Auto-Escalate Risk Score</th>
                    <th className="py-3 px-4 text-center">Mandatory Audit Sign-Off</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {gateRules.map((g) => (
                    <tr key={g.gate} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 font-extrabold text-slate-900">
                        <span className="font-mono text-blue-900 mr-2 bg-blue-50 px-2 py-0.5 rounded font-bold">{g.gate}</span>
                        {g.name}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min={50}
                            max={100}
                            value={g.minQuorum}
                            onChange={(e) => handleUpdateGateQuorum(g.gate, Number(e.target.value))}
                            className="w-24 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                          <span className="font-mono font-black text-slate-900 w-8">{g.minQuorum}%</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-slate-800">
                        ${(g.budgetCap / 1000000).toFixed(2)}M
                      </td>

                      <td className="py-4 px-4 font-mono font-extrabold text-amber-700">
                        Score &ge; {g.autoEscalateRiskScore} / 10
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-md font-bold text-[10px] uppercase ${
                          g.requireAuditSignoff ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {g.requireAuditSignoff ? 'REQUIRED' : 'OPTIONAL'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => showToastMsg('✓ Stage-Gate governance rules saved successfully.')}
                className="px-5 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white font-extrabold text-xs rounded-lg shadow-2xs transition-all cursor-pointer flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                Save Governance Thresholds
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY & IP WHITELIST */}
      {activeTab === 'Security & Access' && (
        <div className="space-y-6 animate-fadeIn">
          {/* 2FA & Auth Policy */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[20px]">shield</span>
              Authentication &amp; Identity Enforcement Policies
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Enforce 2FA MFA</span>
                <p className="text-sm font-extrabold text-slate-900">Multi-Factor Authentication</p>
                <button
                  onClick={() => {
                    setEnforce2FA(!enforce2FA);
                    showToastMsg(`✓ Mandatory 2FA ${!enforce2FA ? 'ENABLED' : 'DISABLED'}`);
                  }}
                  className={`w-full py-1.5 font-bold text-xs rounded-lg transition-colors cursor-pointer ${
                    enforce2FA ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {enforce2FA ? 'MFA Mandatory (Active)' : 'MFA Optional'}
                </button>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Default Currency</span>
                <select
                  value={currencySymbol}
                  onChange={(e) => {
                    setCurrencySymbol(e.target.value);
                    showToastMsg(`✓ Global currency set to ${e.target.value}`);
                  }}
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-bold text-xs text-slate-900 outline-none cursor-pointer"
                >
                  <option value="USD ($)">USD ($)</option>
                  <option value="EUR (€)">EUR (€)</option>
                  <option value="GBP (£)">GBP (£)</option>
                  <option value="JPY (¥)">JPY (¥)</option>
                </select>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Fiscal Year Start</span>
                <select
                  value={fiscalYearStart}
                  onChange={(e) => {
                    setFiscalYearStart(e.target.value);
                    showToastMsg(`✓ Fiscal Year Start set to ${e.target.value}`);
                  }}
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-bold text-xs text-slate-900 outline-none cursor-pointer"
                >
                  <option value="January 1">January 1 (Calendar)</option>
                  <option value="April 1">April 1 (UK/Japan)</option>
                  <option value="October 1">October 1 (US Fed)</option>
                </select>
              </div>
            </div>
          </div>

          {/* IP Whitelist Management */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-700 text-[20px]">lan</span>
                  Network IP CIDR Whitelist Management
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Restrict executive administrative actions to authorized corporate subnets.</p>
              </div>
            </div>

            {/* Add New IP Form */}
            <form onSubmit={handleAddIP} className="flex flex-col md:flex-row items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <input
                type="text"
                required
                placeholder="e.g. 192.168.10.0/24"
                value={newIpAddress}
                onChange={(e) => setNewIpAddress(e.target.value)}
                className="w-full md:w-1/3 bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold text-slate-900 outline-none"
              />
              <input
                type="text"
                placeholder="Label (e.g., London Branch Office Subnet)"
                value={newIpLabel}
                onChange={(e) => setNewIpLabel(e.target.value)}
                className="w-full md:w-1/2 bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-800 outline-none"
              />
              <button
                type="submit"
                className="w-full md:w-auto px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white font-extrabold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-2xs whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Add IP Entry
              </button>
            </form>

            {/* Table */}
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    <th className="py-2.5 px-3">IP CIDR RANGE</th>
                    <th className="py-2.5 px-3">LABEL / DESCRIPTION</th>
                    <th className="py-2.5 px-3">ADDED BY</th>
                    <th className="py-2.5 px-3">DATE</th>
                    <th className="py-2.5 px-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {ipList.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-blue-900">{entry.ip}</td>
                      <td className="py-3 px-3 font-bold text-slate-800">{entry.label}</td>
                      <td className="py-3 px-3 text-slate-600">{entry.addedBy}</td>
                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{entry.addedDate}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleRemoveIP(entry.id, entry.ip)}
                          className="text-red-600 hover:text-red-800 font-bold text-xs hover:underline cursor-pointer"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BACKUP & DISASTER RECOVERY */}
      {activeTab === 'Backup & DR' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-[22px]">database</span>
                  Cloud SQL Snapshots &amp; Point-in-Time Disaster Recovery
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated rolling 30-day encrypted backups stored across geo-redundant storage buckets.
                </p>
              </div>

              <button
                onClick={handleTriggerManualBackup}
                disabled={isBackingUp}
                className="px-4 py-2 bg-[#00174b] hover:bg-indigo-950 text-white font-extrabold text-xs rounded-lg shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                Take Instant Snapshot
              </button>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    <th className="py-2.5 px-3">SNAPSHOT ID</th>
                    <th className="py-2.5 px-3">VERSION</th>
                    <th className="py-2.5 px-3">TIMESTAMP</th>
                    <th className="py-2.5 px-3">SIZE</th>
                    <th className="py-2.5 px-3">TYPE</th>
                    <th className="py-2.5 px-3 text-right">RESTORE / VERIFY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {backups.map((bk) => (
                    <tr key={bk.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{bk.id}</td>
                      <td className="py-3 px-3 font-mono text-blue-900 font-bold">{bk.version}</td>
                      <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">{bk.timestamp}</td>
                      <td className="py-3 px-3 font-mono text-slate-700">{bk.size}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          bk.type === 'MANUAL' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {bk.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        <button
                          onClick={() => showToastMsg(`✓ Checksum verified for ${bk.id}: ${bk.checksum.substring(0, 16)}...`)}
                          className="text-blue-600 hover:text-blue-800 font-bold text-xs hover:underline cursor-pointer"
                        >
                          Verify Checksum
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Initiate disaster recovery restore to snapshot ${bk.id}?`)) {
                              showToastMsg(`✓ Initiated restoration simulation to point-in-time: ${bk.timestamp}`);
                            }
                          }}
                          className="text-amber-700 hover:text-amber-900 font-bold text-xs hover:underline cursor-pointer"
                        >
                          Restore Point
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AI & ANALYTICS GOVERNANCE */}
      {activeTab === 'AI Governance' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600 text-[22px]">auto_awesome</span>
                Gemini AI Studio &amp; Telemetry Rate Governance
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage token allocation limits, risk sentiment evaluation sensitivity, and scheduled executive AI summaries.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Token Quota / Dept</span>
                <p className="text-xl font-black text-slate-900 font-mono">
                  {geminiQuotaPerDept.toLocaleString()} Tokens
                </p>
                <input
                  type="range"
                  min={10000}
                  max={200000}
                  step={5000}
                  value={geminiQuotaPerDept}
                  onChange={(e) => setGeminiQuotaPerDept(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Risk Sentiment Sensitivity</span>
                <select
                  value={riskDetectionSensitivity}
                  onChange={(e) => setRiskDetectionSensitivity(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-xs text-slate-900 outline-none cursor-pointer"
                >
                  <option value="LOW">LOW (Flag only critical blockers)</option>
                  <option value="MEDIUM">MEDIUM (Standard PMO policy)</option>
                  <option value="HIGH">HIGH (Proactive schedule warnings)</option>
                  <option value="STRICT">STRICT (Zero-variance tolerance)</option>
                </select>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Auto Executive Briefing</span>
                <select
                  value={autoSummarySchedule}
                  onChange={(e) => setAutoSummarySchedule(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-xs text-slate-900 outline-none cursor-pointer"
                >
                  <option value="DAILY">DAILY (Every morning at 07:00)</option>
                  <option value="WEEKLY">WEEKLY (Mondays at 08:00)</option>
                  <option value="MONTHLY">MONTHLY (1st of the month)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => showToastMsg('✓ AI governance & quota policies saved successfully.')}
                className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs rounded-lg shadow-2xs transition-all cursor-pointer flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                Save AI Governance Rules
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
