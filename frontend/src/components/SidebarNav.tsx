import React, { useState } from 'react';
import { NavigationTab, LoggedInPersona } from '../types';

interface SidebarNavProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  pendingApprovalsCount: number;
  openRisksCount: number;
  unreadNotificationsCount: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  currentPersona?: LoggedInPersona;
}


interface NavGroup {
  id: string;
  label: string;
  icon: string;
  badge?: number;
  directTab?: NavigationTab;
  children?: { id: NavigationTab; label: string; icon?: string }[];
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  currentTab,
  onSelectTab,
  pendingApprovalsCount,
  openRisksCount,
  unreadNotificationsCount,
  isCollapsed = false,
  onToggleCollapse,
  currentPersona
}) => {


  // Keep track of expanded accordion groups in sidebar
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    communication:
      currentTab === 'collaboration' ||
      currentTab === 'communication' ||
      currentTab === 'chat' ||
      currentTab === 'meetings' ||
      currentTab === 'notifications' ||
      currentTab === 'documents'
  });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const navGroups: NavGroup[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      directTab: 'dashboard'
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      icon: 'domain',
      directTab: 'portfolio'
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: 'topic',
      directTab: 'projects'
    },
    {
      id: 'users',
      label: 'Users',
      icon: 'group',
      directTab: 'users'
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: 'checklist',
      directTab: 'tasks'
    },
    {
      id: 'resources',
      label: 'Resources',
      icon: 'badge',
      directTab: 'resources'
    },
    {
      id: 'risks',
      label: 'Risks',
      icon: 'warning',
      badge: openRisksCount,
      directTab: 'risks'
    },
    {
      id: 'change_requests',
      label: 'Change Requests',
      icon: 'published_with_changes',
      directTab: 'change_requests',
      badge: pendingApprovalsCount
    },
    {
      id: 'budget',
      label: 'Budget',
      icon: 'payments',
      directTab: 'budget'
    },
    {
      id: 'communication',
      label: 'Communication',
      icon: 'forum',
      badge: unreadNotificationsCount,
      children: [
        { id: 'collaboration', label: 'Discussions', icon: 'chat' },
        { id: 'chat', label: 'Team Chat', icon: 'chat_bubble' },
        { id: 'meetings', label: 'Calendar', icon: 'event' },
        { id: 'notifications', label: 'Notifications', icon: 'notifications' },
        { id: 'documents', label: 'File Sharing', icon: 'folder_shared' }
      ]
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: 'analytics',
      directTab: 'reports'
    },
    {
      id: 'templates',
      label: 'Action Templates',
      icon: 'description',
      directTab: 'templates'
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: 'admin_panel_settings',
      directTab: 'admin'
    }
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-full ${
        isCollapsed ? 'w-[72px]' : 'w-[260px]'
      } bg-[#131b2e] text-[#7c839b] flex flex-col border-r border-slate-800 z-50 transition-all duration-300 select-none shadow-xl`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 bg-linear-to-tr from-[#00174b] to-[#497cff] flex items-center justify-center rounded-sm text-white shrink-0 shadow-md">
            <span className="material-symbols-outlined text-white text-[22px]">
              {currentPersona?.roleType === 'PROJECT_MANAGER' ? 'account_tree' : currentPersona?.roleType === 'TEAM_MEMBER' ? 'school' : 'code'}
            </span>
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <h1 className="text-[14px] leading-tight text-white font-black tracking-tight truncate">
                {currentPersona?.name || 'Sarah Jenkins'}
              </h1>
              <p className="text-[9px] uppercase tracking-[0.14em] text-[#497cff] font-bold truncate">
                {currentPersona?.department || 'Enterprise PMO'}
              </p>
            </div>
          )}
        </div>

        {/* Toggle Collapse Button */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="text-slate-400 hover:text-white p-1 rounded-sm hover:bg-white/10 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isCollapsed ? 'menu_open' : 'close'}
            </span>
          </button>
        )}
      </div>

      {/* Navigation Scroll Area */}
      <nav className="flex-1 custom-scroll overflow-y-auto py-3 space-y-1">
        {navGroups.map((group) => {
          const isExpanded = expandedGroups[group.id];
          const hasChildren = group.children && group.children.length > 0;
          const isGroupActive =
            group.directTab === currentTab ||
            group.children?.some((child) => child.id === currentTab);

          if (!hasChildren && group.directTab) {
            return (
              <button
                key={group.id}
                onClick={() => onSelectTab(group.directTab!)}
                className={`w-full flex items-center justify-between px-5 py-2.5 transition-colors duration-150 text-left ${
                  currentTab === group.directTab
                    ? 'border-l-4 border-[#497cff] bg-white/10 text-white font-bold'
                    : 'border-l-4 border-transparent text-[#7c839b] hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <span className="material-symbols-outlined text-[20px]">
                    {group.icon}
                  </span>
                  {!isCollapsed && <span className="text-[13px] leading-tight truncate">{group.label}</span>}
                </div>
                {!isCollapsed && group.badge !== undefined && group.badge > 0 && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      group.id === 'risks'
                        ? 'bg-amber-500/20 text-amber-300'
                        : group.id === 'notifications'
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-indigo-500/20 text-indigo-300'
                    }`}
                  >
                    {group.badge}
                  </span>
                )}
              </button>
            );
          }

          return (
            <div key={group.id} className="space-y-1">
              <button
                onClick={() => toggleGroup(group.id)}
                className={`w-full flex items-center justify-between px-5 py-2.5 transition-colors duration-150 text-left ${
                  isGroupActive
                    ? 'text-white font-bold'
                    : 'text-[#7c839b] hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <span className="material-symbols-outlined text-[20px]">{group.icon}</span>
                  {!isCollapsed && <span className="text-[13px] leading-tight truncate">{group.label}</span>}
                </div>
                {!isCollapsed && (
                  <span className="material-symbols-outlined text-[18px] text-slate-400">
                    {isExpanded ? 'expand_less' : 'expand_more'}
                  </span>
                )}
              </button>

              {!isCollapsed && isExpanded && group.children && (
                <div className="pl-11 pr-3 space-y-1 border-l border-slate-800 ml-6 py-1">
                  {group.children.map((child) => {
                    const isChildActive = currentTab === child.id;
                    return (
                      <button
                        key={child.id}
                        onClick={() => onSelectTab(child.id)}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-xs text-[12px] transition-colors text-left ${
                          isChildActive
                            ? 'bg-[#00174b] text-white font-bold border border-blue-500/30'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {child.icon && (
                          <span className="material-symbols-outlined text-[16px]">{child.icon}</span>
                        )}
                        <span>{child.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer Settings */}
      <div className="p-3 border-t border-slate-800/80 space-y-1">
        <button
          onClick={() => onSelectTab('settings')}
          className={`w-full flex items-center gap-3 transition-colors text-left px-2 py-2 rounded-xs ${
            currentTab === 'settings'
              ? 'text-white font-bold bg-white/10'
              : 'text-[#7c839b] hover:text-white hover:bg-white/5'
          }`}
          title="Platform Settings"
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
          {!isCollapsed && <span className="text-[13px]">Settings</span>}
        </button>
      </div>
    </aside>
  );
};


