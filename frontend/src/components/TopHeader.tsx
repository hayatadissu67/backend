import React, { useState } from 'react';
import { LoggedInPersona, NotificationItem, Project } from '../types';

interface TopHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  unreadNotificationsCount?: number;
  onOpenNewProject: () => void;
  onOpenUserProfile?: () => void;
  currentPersona?: LoggedInPersona;
  notificationsList?: NotificationItem[];
  onMarkNotificationsRead?: () => void;
  projects?: Project[];
  selectedProject?: Project | null;
  onSelectProject?: (project: Project | string | null) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  searchQuery,
  onSearchChange,
  unreadNotificationsCount = 0,
  onOpenNewProject,
  onOpenUserProfile,
  currentPersona,
  notificationsList = [],
  onMarkNotificationsRead,
  projects = [],
  selectedProject = null,
  onSelectProject
}) => {

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const activeName = currentPersona?.name || 'Sarah Jenkins';
  const activeRole = currentPersona?.roleTitle || 'PMO Executive Director';
  const activeAvatar = currentPersona?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150';

  return (
    <>
      <header className="fixed top-0 right-0 w-[calc(100%-260px)] h-[64px] bg-[#f7f9fb] flex justify-between items-center px-6 z-40 border-b border-slate-200/80">
        <div className="flex items-center gap-4">
          <span className="text-[20px] font-bold text-[#191c1e] tracking-tight">
            PMO Insights
          </span>

          {/* Project Quick Selector Dropdown */}
          {projects.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowProjectMenu(!showProjectMenu)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border text-xs font-bold transition-all shadow-2xs ${
                  selectedProject
                    ? 'bg-[#00174b] text-white border-[#00174b]'
                    : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                }`}
                title="Select Project Dashboard"
              >
                <span className="material-symbols-outlined text-[16px] text-amber-400">
                  folder_managed
                </span>
                <span className="truncate max-w-[150px]">
                  {selectedProject ? selectedProject.name : 'All Projects'}
                </span>
                <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
              </button>

              {showProjectMenu && (
                <div className="absolute left-0 mt-2 w-80 bg-white border border-slate-200 rounded-md shadow-2xl z-50 py-2 text-xs">
                  <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <div>
                      <p className="font-extrabold text-slate-900 uppercase tracking-wider text-[10px]">Project Dashboards</p>
                      <p className="text-[11px] text-slate-500">Jump directly to 360 project view</p>
                    </div>
                    {selectedProject && (
                      <button
                        onClick={() => {
                          if (onSelectProject) onSelectProject(null);
                          setShowProjectMenu(false);
                        }}
                        className="text-[10px] font-bold text-blue-700 hover:underline uppercase font-mono"
                      >
                        All Directory
                      </button>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto p-1 space-y-1">
                    {projects.map((p) => {
                      const isSelected = selectedProject?.id === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            if (onSelectProject) onSelectProject(p);
                            setShowProjectMenu(false);
                          }}
                          className={`w-full text-left p-2 rounded-sm flex items-center justify-between transition-colors ${
                            isSelected ? 'bg-indigo-50 border border-indigo-200 font-bold' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="bg-slate-200 text-slate-900 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-xs">
                                {p.code}
                              </span>
                              <span className="font-bold text-slate-900 line-clamp-1">{p.name}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 flex items-center gap-1">
                              <span>{p.department}</span>
                              <span>•</span>
                              <span className="font-mono font-bold text-indigo-900">{p.progress}%</span>
                            </p>
                          </div>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              p.health === 'GREEN'
                                ? 'bg-emerald-500'
                                : p.health === 'YELLOW'
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                          ></span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#45464d] text-[20px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Search portfolio, projects, or documents..."
              className={`bg-[#f2f4f6] border border-transparent focus:border-[#497cff] rounded-sm pl-10 pr-8 py-1.5 font-sans text-[13px] text-[#191c1e] transition-all duration-200 outline-none ${
                isSearchFocused ? 'w-[320px] bg-white shadow-sm' : 'w-[220px]'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-10 h-10 flex items-center justify-center text-[#45464d] hover:text-[#191c1e] hover:bg-slate-200/50 rounded-full transition-colors relative"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 ring-2 ring-white animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-88 bg-white border border-slate-200 rounded-md shadow-2xl z-50 py-2">
                <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">PM &amp; Team Telemetry Feed</h4>
                  {onMarkNotificationsRead && (
                    <button onClick={onMarkNotificationsRead} className="text-[11px] text-blue-600 font-semibold hover:underline">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notificationsList.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">No new notifications</div>
                  ) : (
                    notificationsList.map((n) => (
                      <div key={n.id} className={`p-3 text-xs hover:bg-slate-50 cursor-pointer ${!n.isRead ? 'bg-blue-50/40 border-l-2 border-l-blue-600' : ''}`}>
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-slate-800">{n.title}</p>
                          <span className="text-[10px] text-slate-400 shrink-0 ml-2">{n.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Help Button */}
          <button
            onClick={() => setShowHelpModal(true)}
            className="w-10 h-10 flex items-center justify-center text-[#45464d] hover:text-[#191c1e] hover:bg-slate-200/50 rounded-full transition-colors"
            title="PMO Help & Guidelines"
          >
            <span className="material-symbols-outlined text-[22px]">help_outline</span>
          </button>

          <div className="w-[1px] h-6 bg-slate-300 mx-1"></div>


          {/* Profile User Dropdown */}
          <div className="relative">
            <div
              onClick={() => {
                if (onOpenUserProfile) {
                  onOpenUserProfile();
                } else {
                  setShowProfileMenu(!showProfileMenu);
                }
              }}
              className="flex items-center gap-3 cursor-pointer group py-1 px-2 rounded-md hover:bg-slate-200/40 transition-colors"
              title="Click to view User Profile Details"
            >
              <div className="text-right hidden sm:block">
                <p className="text-[13px] font-bold text-[#191c1e] leading-tight group-hover:text-indigo-950 transition-colors">{activeName}</p>
                <p className="text-[10px] text-indigo-900 uppercase font-bold tracking-wider">{activeRole}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden border-2 border-indigo-900 group-hover:border-amber-400 transition-colors shadow-sm relative">
                <img
                  src={activeAvatar}
                  alt={activeName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-md shadow-xl z-50 py-2 text-xs">
                <div className="px-4 py-2 border-b border-slate-100 bg-slate-50">
                  <p className="font-bold text-slate-800">{activeName}</p>
                  <p className="text-[11px] text-slate-500">{currentPersona?.email || 'sarah.jenkins@enterprise-pmo.com'}</p>
                </div>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onOpenUserProfile) onOpenUserProfile();
                  }}
                  className="w-full text-left px-4 py-2 text-indigo-950 font-bold hover:bg-indigo-50 flex items-center gap-2 border-b border-slate-100 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-indigo-900">account_circle</span>
                  View User Profile Details
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenNewProject();
                  }}
                  className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add_box</span>
                  Create New Project
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-md shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">help</span>
                Executive Control Tower User Guide
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong>Portfolio Health:</strong> Tracks real-time project distribution across Green (On Track), Yellow (At Risk), and Red (Off Track) status.
              </p>
              <p>
                <strong>Resource Loading:</strong> Highlights capacity constraints across Engineering, Design, Product Management, Data, and Cybersecurity.
              </p>
              <p>
                <strong>Critical Risks & Issues:</strong> R-codes represent future risks; I-codes represent active issues requiring immediate executive intervention.
              </p>
              <p>
                <strong>PMO AI Assistant:</strong> Click the floating icon in the bottom right corner to generate status reports or ask for mitigation strategies powered by Gemini.
              </p>
            </div>
            <div className="pt-2 text-right">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-1.5 bg-[#131b2e] text-white text-xs font-bold rounded-sm hover:bg-slate-800"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
