import React, { useState } from 'react';
import { Project, BudgetItem, RiskItem, ResourceLoading, NavigationTab } from '../../types';

interface PortfolioViewProps {
  projects: Project[];
  budgets: BudgetItem[];
  risks: RiskItem[];
  resources?: ResourceLoading[];
  onNavigate?: (tab: NavigationTab) => void;
  onSelectProject?: (project: Project | string) => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  projects,
  budgets,
  risks,
  resources = [],
  onNavigate,
  onSelectProject
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'Overview' | 'Departments' | 'Health & Risks' | 'Strategic ROI'>('Overview');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Calculations
  const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);
  const totalSpent = projects.reduce((acc, p) => acc + (p.spent || 0), 0);
  const totalRemaining = totalBudget - totalSpent;
  const spendPercent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const activeProjectsCount = projects.filter((p) => p.status === 'ACTIVE').length;
  const completedProjectsCount = projects.filter((p) => p.status === 'COMPLETED').length;
  const delayedProjectsCount = projects.filter((p) => p.status === 'DELAYED').length;
  const planningProjectsCount = projects.filter((p) => p.status === 'PLANNING').length;

  const greenCount = projects.filter((p) => p.health === 'GREEN').length;
  const yellowCount = projects.filter((p) => p.health === 'YELLOW').length;
  const redCount = projects.filter((p) => p.health === 'RED').length;

  const portfolioHealthScore = projects.length > 0
    ? Math.round(((greenCount * 100 + yellowCount * 60 + redCount * 20) / (projects.length * 100)) * 100)
    : 100;

  // Departmental breakdown
  const departments = Array.from(new Set(projects.map((p) => p.department || 'General PMO')));

  const deptSummaries = departments.map((dept) => {
    const deptProjects = projects.filter((p) => (p.department || 'General PMO') === dept);
    const deptBudget = deptProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const deptSpent = deptProjects.reduce((sum, p) => sum + (p.spent || 0), 0);
    const deptGreen = deptProjects.filter((p) => p.health === 'GREEN').length;
    const deptYellow = deptProjects.filter((p) => p.health === 'YELLOW').length;
    const deptRed = deptProjects.filter((p) => p.health === 'RED').length;
    const avgProgress = deptProjects.length > 0
      ? Math.round(deptProjects.reduce((sum, p) => sum + p.progress, 0) / deptProjects.length)
      : 0;

    return {
      department: dept,
      projectCount: deptProjects.length,
      budget: deptBudget,
      spent: deptSpent,
      avgProgress,
      green: deptGreen,
      yellow: deptYellow,
      red: deptRed,
      projects: deptProjects
    };
  });

  const filteredProjects = projects.filter((p) => {
    const matchesDept = departmentFilter === 'ALL' || (p.department || 'General PMO') === departmentFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.owner.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDept && matchesSearch;
  });

  // Strategic Pillars static reference data
  const strategicPillars = [
    { name: 'Cloud Native & Infrastructure Modernization', targetCapex: 8500000, allocated: projects.filter(p => p.techStack?.some(t => ['AWS', 'GCP', 'Docker', 'Kubernetes'].includes(t))).reduce((a,b) => a+b.budget, 0), progress: 74, status: 'On Track' },
    { name: 'Zero Trust Cybersecurity & Governance', targetCapex: 4200000, allocated: projects.filter(p => p.techStack?.some(t => ['OAuth2', 'JWT', 'Security', 'Vault'].includes(t))).reduce((a,b) => a+b.budget, 0), progress: 88, status: 'On Track' },
    { name: 'AI & Data Intelligence Platform', targetCapex: 5100000, allocated: projects.filter(p => p.techStack?.some(t => ['Python', 'Gemini AI', 'TensorFlow', 'PyTorch'].includes(t))).reduce((a,b) => a+b.budget, 0), progress: 62, status: 'Needs Review' },
    { name: 'Customer Experience & Digital Portal', targetCapex: 3800000, allocated: projects.filter(p => p.techStack?.some(t => ['React', 'TypeScript', 'Next.js', 'Tailwind'].includes(t))).reduce((a,b) => a+b.budget, 0), progress: 91, status: 'Exceeding' }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <nav className="flex items-center gap-1 text-[#45464d] font-bold text-[11px] tracking-wider uppercase mb-1">
            <span>EXECUTIVE PMO</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#00174b]">STRATEGIC PORTFOLIO MANAGEMENT</span>
          </nav>
          <h2 className="text-[26px] font-bold tracking-tight text-[#191c1e]">
            Enterprise Portfolio Control Tower
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Holistic capital allocation, departmental program performance, strategic pillar alignment, and ROI realization.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {onNavigate && (
            <button
              onClick={() => onNavigate('projects')}
              className="px-3.5 py-1.5 bg-[#00174b] hover:bg-indigo-950 text-white font-bold text-xs rounded-xs flex items-center gap-1.5 shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px]">topic</span>
              <span>Manage Projects Directory</span>
            </button>
          )}
          {onNavigate && (
            <button
              onClick={() => onNavigate('reports')}
              className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xs flex items-center gap-1.5 shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px]">analytics</span>
              <span>Portfolio Reports</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex flex-wrap items-center gap-1">
          {[
            { key: 'Overview', label: 'Portfolio Overview', icon: 'dashboard' },
            { key: 'Departments', label: 'Departmental Breakdown', icon: 'domain' },
            { key: 'Health & Risks', label: 'Health & Risk Matrix', icon: 'shield_with_heart' },
            { key: 'Strategic ROI', label: 'Strategic Pillars & ROI', icon: 'trending_up' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveSubTab(tab.key as any)}
              className={`px-3 py-1.5 rounded-xs text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === tab.key
                  ? 'bg-[#00174b] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Department Quick Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-500 uppercase text-[10px]">Department:</span>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-sm px-2.5 py-1 font-medium text-slate-800 outline-none focus:border-blue-600"
          >
            <option value="ALL">All Departments ({projects.length})</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top Portfolio Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Valuation */}
        <div className="bg-white border border-slate-200/80 p-4 rounded-sm shadow-2xs space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Portfolio Valuation</span>
            <span className="material-symbols-outlined text-[18px] text-indigo-700">payments</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono">
            ${(totalBudget / 1000000).toFixed(2)}M
          </p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#00174b] h-full" style={{ width: `${Math.min(spendPercent, 100)}%` }} />
          </div>
          <p className="text-[10px] text-slate-500 font-mono">
            Spent: ${(totalSpent / 1000000).toFixed(2)}M ({spendPercent}%)
          </p>
        </div>

        {/* Card 2: Active Programs */}
        <div className="bg-white border border-slate-200/80 p-4 rounded-sm shadow-2xs space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Programs &amp; Initiatives</span>
            <span className="material-symbols-outlined text-[18px] text-blue-700">topic</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono">
            {projects.length}
          </p>
          <div className="flex gap-2 text-[10px] font-bold font-mono">
            <span className="text-emerald-700">{activeProjectsCount} Active</span>
            <span className="text-blue-700">{completedProjectsCount} Done</span>
            <span className="text-red-700">{delayedProjectsCount} Delayed</span>
          </div>
        </div>

        {/* Card 3: Health Index */}
        <div className="bg-white border border-slate-200/80 p-4 rounded-sm shadow-2xs space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Portfolio Health Score</span>
            <span className="material-symbols-outlined text-[18px] text-emerald-600">verified</span>
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 font-mono">
            {portfolioHealthScore}%
          </p>
          <div className="flex items-center gap-1.5 text-[10px] font-bold">
            <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-xs font-mono">{greenCount} Green</span>
            <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-xs font-mono">{yellowCount} Amber</span>
            <span className="bg-red-100 text-red-800 px-1.5 py-0.5 rounded-xs font-mono">{redCount} Red</span>
          </div>
        </div>

        {/* Card 4: Open Risks */}
        <div className="bg-white border border-slate-200/80 p-4 rounded-sm shadow-2xs space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Strategic Risk Exposure</span>
            <span className="material-symbols-outlined text-[18px] text-amber-600">warning</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono">
            {risks.length}
          </p>
          <p className="text-[10px] text-slate-500">
            {risks.filter(r => r.severity === 'CRITICAL' || r.severity === 'HIGH').length} High/Critical Severity
          </p>
        </div>

        {/* Card 5: Resource Pool */}
        <div className="bg-white border border-slate-200/80 p-4 rounded-sm shadow-2xs space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Resource Utilization</span>
            <span className="material-symbols-outlined text-[18px] text-purple-700">badge</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono">
            {resources.length > 0 ? `${Math.round(resources.reduce((a,r) => a + r.percentage, 0) / resources.length)}%` : '88%'}
          </p>
          <p className="text-[10px] text-slate-500">
            {resources.length} Allocated Key Personnel
          </p>
        </div>
      </div>

      {/* SUB TAB 1: OVERVIEW */}
      {activeSubTab === 'Overview' && (
        <div className="space-y-6">
          {/* Strategic Pillars Grid */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-sm shadow-2xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00174b] text-[20px]">account_balance</span>
                  Enterprise Strategic Investment Pillars (2026 Strategy)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Investment tracking against top strategic transformation vectors.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {strategicPillars.map((pillar) => (
                <div key={pillar.name} className="bg-slate-50 border border-slate-200 p-4 rounded-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-slate-900 text-xs">{pillar.name}</p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        pillar.status === 'Exceeding' || pillar.status === 'On Track'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {pillar.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Target Capital</span>
                      <span className="font-mono font-bold text-slate-900">${(pillar.targetCapex / 1000000).toFixed(2)}M</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Active Allocation</span>
                      <span className="font-mono font-bold text-indigo-900">${(pillar.allocated / 1000000).toFixed(2)}M</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                      <span>Strategic Progress</span>
                      <span className="font-mono text-slate-800">{pillar.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#00174b] h-full" style={{ width: `${pillar.progress}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Portfolio Projects Quick View */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-sm shadow-2xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-700 text-[20px]">list_alt</span>
                Portfolio Projects Status Summary ({filteredProjects.length})
              </h3>

              <div className="relative w-64">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter portfolio projects..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-sm pl-8 pr-3 py-1 text-xs text-slate-800 outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                    <th className="p-3">Project &amp; Code</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Owner</th>
                    <th className="p-3">Stage / Gate</th>
                    <th className="p-3">Budget / Spent</th>
                    <th className="p-3">Progress</th>
                    <th className="p-3 text-center">Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProjects.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => onSelectProject ? onSelectProject(p) : onNavigate ? onNavigate('projects') : null}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      title="Click to view Project Dashboard"
                    >
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{p.name}</p>
                        <p className="text-[11px] font-mono text-slate-400">{p.code}</p>
                      </td>
                      <td className="p-3 text-slate-700 font-medium">{p.department || 'General PMO'}</td>
                      <td className="p-3 text-slate-700">{p.owner}</td>
                      <td className="p-3">
                        <span className="font-mono font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-xs border border-indigo-200 text-[10px]">
                          {p.lifecycleStage || 'Execution'} • {p.gate}
                        </span>
                      </td>
                      <td className="p-3 font-mono">
                        <span className="font-bold text-slate-900">${(p.budget / 1000).toFixed(0)}k</span>
                        <span className="text-slate-400 text-[11px] block">Spent: ${(p.spent / 1000).toFixed(0)}k</span>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-800">
                        {p.progress}%
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                            p.health === 'GREEN'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.health === 'YELLOW'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {p.health}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 2: DEPARTMENTS */}
      {activeSubTab === 'Departments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {deptSummaries.map((ds) => (
              <div key={ds.department} className="bg-white border border-slate-200/80 p-5 rounded-sm shadow-2xs space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{ds.department}</h4>
                    <p className="text-xs text-slate-500">{ds.projectCount} Active Program(s)</p>
                  </div>
                  <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-950 font-bold font-mono text-xs rounded-xs">
                    Avg Progress: {ds.avgProgress}%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xs border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Budget Allocated</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">${(ds.budget / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xs border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Actual Spent</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">${(ds.spent / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xs border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Health Mix</span>
                    <div className="flex gap-1 text-[10px] font-mono font-bold mt-0.5">
                      <span className="text-emerald-700">{ds.green} G</span>
                      <span className="text-amber-700">{ds.yellow} A</span>
                      <span className="text-red-700">{ds.red} R</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Department Projects</span>
                  <div className="space-y-1.5 text-xs">
                    {ds.projects.map((proj) => (
                      <div key={proj.id} className="flex justify-between items-center bg-slate-50/80 p-2 rounded-xs border border-slate-100">
                        <div>
                          <span className="font-bold text-slate-900">{proj.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono ml-2">({proj.code})</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <span>{proj.progress}%</span>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              proj.health === 'GREEN' ? 'bg-emerald-500' : proj.health === 'YELLOW' ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB TAB 3: HEALTH & RISKS */}
      {activeSubTab === 'Health & Risks' && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-sm shadow-2xs space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600 text-[20px]">shield_with_heart</span>
              Portfolio Risk Matrix &amp; Escalation Radar
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Top critical risks identified across all active projects requiring PMO executive intervention.
            </p>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <th className="p-3">Ref</th>
                  <th className="p-3">Risk Subject</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Owner</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {risks.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-700">{r.ref}</td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{r.subject}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{r.description}</p>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-xs font-mono font-bold text-[10px] uppercase ${
                          r.severity === 'CRITICAL'
                            ? 'bg-red-100 text-red-900'
                            : r.severity === 'HIGH'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-blue-100 text-blue-900'
                        }`}
                      >
                        {r.severity}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 font-medium">{r.owner}</td>
                    <td className="p-3 font-mono font-bold text-slate-800">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB TAB 4: STRATEGIC ROI */}
      {activeSubTab === 'Strategic ROI' && (
        <div className="bg-white border border-slate-200/80 p-6 rounded-sm shadow-2xs space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-[20px]">trending_up</span>
              Strategic Value Realization &amp; Expected ROI Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Financial and operational returns projected for 2026 enterprise capital programs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-sm space-y-1">
              <span className="text-[10px] font-bold uppercase text-emerald-900">Projected Portfolio ROI</span>
              <p className="text-2xl font-extrabold font-mono text-emerald-700">28.4%</p>
              <p className="text-[11px] text-emerald-800">Estimated $5.2M net annual operational savings</p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-sm space-y-1">
              <span className="text-[10px] font-bold uppercase text-blue-900">Average Payback Period</span>
              <p className="text-2xl font-extrabold font-mono text-blue-800">14.2 Months</p>
              <p className="text-[11px] text-blue-800">Based on discounted cash flow projections</p>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-sm space-y-1">
              <span className="text-[10px] font-bold uppercase text-purple-900">Compliance &amp; Security Score</span>
              <p className="text-2xl font-extrabold font-mono text-purple-800">98.5%</p>
              <p className="text-[11px] text-purple-800">ISO 27001 &amp; SOC2 Type II alignment</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
