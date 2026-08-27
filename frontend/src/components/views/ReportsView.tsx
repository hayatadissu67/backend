import React, { useState } from 'react';
import { Project, BudgetItem, RiskItem, ResourceLoading, ReportItem, ReportTemplate, LoggedInPersona } from '../../types';
import { createReportApi, updateReportApi, deleteReportApi, createTemplateApi, updateTemplateApi, deleteTemplateApi, createTemplateVersionApi } from '../../services/api';

interface ReportsViewProps {
  projects?: Project[];
  budgets?: BudgetItem[];
  risks?: RiskItem[];
  resources?: ResourceLoading[];
  reports?: ReportItem[];
  templates?: ReportTemplate[];
  onReportsChange?: (reports: ReportItem[]) => void;
  onTemplatesChange?: (templates: ReportTemplate[]) => void;
  currentPersona?: LoggedInPersona | null;
}

type ReportSubTab = 'All Reports' | 'Generate Report' | 'Templates' | 'Audit & Archives';

export const ReportsView: React.FC<ReportsViewProps> = ({
  projects = [],
  budgets = [],
  risks = [],
  resources = [],
  reports = [],
  templates = [],
  onReportsChange,
  onTemplatesChange,
  currentPersona,
}) => {
  const [activeTab, setActiveTab] = useState<ReportSubTab>('All Reports');
  const [selectedReportCategory, setSelectedReportCategory] = useState<'All' | 'Executive' | 'Financial' | 'Governance' | 'Resource'>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Generate Report Form State
  const [newReportTitle, setNewReportTitle] = useState('');
  const [newReportDesc, setNewReportDesc] = useState('');
  const [newReportCat, setNewReportCat] = useState('Executive');
  const [newReportPreparedBy, setNewReportPreparedBy] = useState(currentPersona?.name || 'PMO Directorate');
  const [newReportPeriod, setNewReportPeriod] = useState('Q3 2026');
  const [newReportType, setNewReportType] = useState('Executive Summary');
  const [newReportStatus, setNewReportStatus] = useState('Published');
  const [newReportTemplateId, setNewReportTemplateId] = useState('');
  const [newReportFile, setNewReportFile] = useState<File | null>(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Edit Report Modal State
  const [editingReport, setEditingReport] = useState<ReportItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCat, setEditCat] = useState('Executive');
  const [editPreparedBy, setEditPreparedBy] = useState('');
  const [editPeriod, setEditPeriod] = useState('');
  const [editType, setEditType] = useState('');
  const [editStatus, setEditStatus] = useState('Published');
  const [editFile, setEditFile] = useState<File | null>(null);
  const [isUpdatingReport, setIsUpdatingReport] = useState(false);

  // Template Form State
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editTemplateId, setEditTemplateId] = useState<string | null>(null);
  const [tplName, setTplName] = useState('');
  const [tplDesc, setTplDesc] = useState('');
  const [tplCat, setTplCat] = useState('Executive');
  const [tplVersion, setTplVersion] = useState('1.0');
  const [tplFile, setTplFile] = useState<File | null>(null);
  const [isSubmittingTemplate, setIsSubmittingTemplate] = useState(false);

  // Version History Modal
  const [viewingVersionTemplate, setViewingVersionTemplate] = useState<ReportTemplate | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getLatestVersion = (versions: any[]) => {
    if (!versions || versions.length === 0) return null;
    return versions.reduce((prev, current) => (prev.versionNumber > current.versionNumber ? prev : current));
  };

  // ---- EXCEL DOWNLOAD GENERATOR ----
  const downloadReportAsExcel = (report: ReportItem) => {
    // If a physical file exists, download it
    const latestVersion = getLatestVersion(report.versions || []);
    if (latestVersion && latestVersion.fileUrl) {
      const link = document.createElement('a');
      link.href = `http://localhost:5000${latestVersion.fileUrl}`;
      link.download = report.fileName || `${report.title.replace(/\s+/g, '_')}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`✓ Downloading: ${report.title}`);
      return;
    }

    // Otherwise, generate rich CSV/Excel file content with portfolio data
    const rows = [
      ['ENTERPRISE PMO REPORT & AUDIT RECORD'],
      ['Report Title:', report.title],
      ['Prepared By:', report.preparedBy || currentPersona?.name || 'PMO Directorate'],
      ['Report Period:', report.period || 'Q3 2026'],
      ['Category:', report.category || 'Executive'],
      ['Status:', report.status || 'Published'],
      ['Generated At:', new Date().toLocaleString()],
      [],
      ['PROJECT PORTFOLIO DATA SUMMARY'],
      ['Project Name', 'Project Code', 'Health Status', 'Budget ($)', 'Spent ($)', 'Utilization (%)', 'Owner'],
      ...projects.map((p) => [
        `"${p.name}"`,
        p.code,
        p.health,
        p.budget,
        p.spent,
        p.budget ? Math.round((p.spent / p.budget) * 100) + '%' : '0%',
        `"${p.owner}"`,
      ]),
      [],
      ['RISK & ISSUES SUMMARY'],
      ['Ref', 'Subject', 'Severity', 'Category', 'Status', 'Owner'],
      ...risks.map((r) => [`"${r.ref}"`, `"${r.subject}"`, r.severity, r.category, r.status, `"${r.owner}"`]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${report.title.replace(/[^a-zA-Z0-9]/g, '_')}_${report.period || '2026'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`✓ Excel Spreadsheet exported for "${report.title}"`);
  };

  // ---- REPORT HANDLERS ----
  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReportTitle.trim()) return showToast('Report title required');

    setIsSubmittingReport(true);
    const formData = new FormData();
    formData.append('title', newReportTitle);
    formData.append('description', newReportDesc);
    formData.append('category', newReportCat);
    formData.append('preparedBy', newReportPreparedBy);
    formData.append('period', newReportPeriod);
    formData.append('type', newReportType);
    formData.append('status', newReportStatus);
    if (newReportTemplateId) formData.append('templateId', newReportTemplateId);
    if (newReportFile) formData.append('file', newReportFile);

    try {
      const created = await createReportApi(formData);
      if (created && onReportsChange) {
        onReportsChange([created, ...reports]);
        showToast('✓ Report created and published successfully');
        setNewReportTitle('');
        setNewReportDesc('');
        setNewReportFile(null);
        setActiveTab('All Reports');
      }
    } catch (err) {
      showToast('❌ Error generating report');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleOpenEditReport = (report: ReportItem) => {
    setEditingReport(report);
    setEditTitle(report.title);
    setEditDesc(report.description || '');
    setEditCat(report.category || 'Executive');
    setEditPreparedBy(report.preparedBy || 'PMO Directorate');
    setEditPeriod(report.period || 'Q3 2026');
    setEditType(report.type || 'Executive Summary');
    setEditStatus(report.status || 'Published');
    setEditFile(null);
  };

  const handleSaveEditReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReport) return;

    setIsUpdatingReport(true);
    const formData = new FormData();
    formData.append('title', editTitle);
    formData.append('description', editDesc);
    formData.append('category', editCat);
    formData.append('preparedBy', editPreparedBy);
    formData.append('period', editPeriod);
    formData.append('type', editType);
    formData.append('status', editStatus);
    if (editFile) formData.append('file', editFile);

    try {
      const updated = await updateReportApi(editingReport.id, formData);
      if (updated && onReportsChange) {
        onReportsChange(reports.map((r) => (r.id === updated.id ? updated : r)));
        showToast('✓ Report updated successfully');
        setEditingReport(null);
      }
    } catch (err) {
      showToast('❌ Error updating report');
    } finally {
      setIsUpdatingReport(false);
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    const success = await deleteReportApi(id);
    if (success && onReportsChange) {
      onReportsChange(reports.filter((r) => r.id !== id));
      showToast('✓ Report deleted');
    } else {
      showToast('❌ Error deleting report');
    }
  };

  // ---- TEMPLATE HANDLERS ----
  const resetTemplateForm = () => {
    setTplName('');
    setTplDesc('');
    setTplCat('Executive');
    setTplVersion('1.0');
    setTplFile(null);
    setEditTemplateId(null);
    setShowTemplateForm(false);
  };

  const handleEditTemplate = (tpl: ReportTemplate) => {
    setTplName(tpl.name);
    setTplDesc(tpl.description || '');
    setTplCat(tpl.category || 'Executive');
    setTplVersion(tpl.version || '1.0');
    setTplFile(null);
    setEditTemplateId(tpl.id);
    setShowTemplateForm(true);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tplName.trim()) return showToast('Template name required');

    setIsSubmittingTemplate(true);
    const formData = new FormData();
    formData.append('name', tplName);
    formData.append('description', tplDesc);
    formData.append('category', tplCat);
    formData.append('version', tplVersion);
    if (tplFile) formData.append('file', tplFile);

    try {
      if (editTemplateId) {
        const updated = await updateTemplateApi(editTemplateId, formData);
        if (updated && onTemplatesChange) {
          onTemplatesChange(templates.map((t) => (t.id === updated.id ? updated : t)));
          showToast('✓ Template updated successfully');
        }
      } else {
        const created = await createTemplateApi(formData);
        if (created && onTemplatesChange) {
          onTemplatesChange([created, ...templates]);
          showToast('✓ Template created successfully');
        }
      }
      resetTemplateForm();
    } catch (err) {
      showToast('❌ Error saving template');
    } finally {
      setIsSubmittingTemplate(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this template? All versions will be removed.')) return;
    const success = await deleteTemplateApi(id);
    if (success && onTemplatesChange) {
      onTemplatesChange(templates.filter((t) => t.id !== id));
      showToast('✓ Template deleted');
    } else {
      showToast('❌ Error deleting template');
    }
  };

  // Calculations
  const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);
  const totalSpent = projects.reduce((acc, p) => acc + (p.spent || 0), 0);
  const utilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const greenProjects = projects.filter((p) => p.health === 'GREEN').length;
  const yellowProjects = projects.filter((p) => p.health === 'YELLOW').length;
  const redProjects = projects.filter((p) => p.health === 'RED').length;

  const totalRisks = risks.length;
  const highRisks = risks.filter((r) => r.severity === 'CRITICAL' || r.severity === 'HIGH').length;

  const filteredReports = reports.filter((r) => {
    return selectedReportCategory === 'All' || r.category === selectedReportCategory;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#00174b] text-white px-4 py-3 rounded-lg shadow-xl font-bold text-xs flex items-center gap-2 border border-blue-400/40 animate-bounce">
          <span className="material-symbols-outlined text-[18px] text-amber-400">download_done</span>
          {toastMessage}
        </div>
      )}

      {/* Top Header Navigation Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <nav className="flex items-center gap-1 text-[#45464d] font-bold text-[11px] tracking-wider uppercase mb-1">
            <span>EXECUTIVE PMO</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#00174b]">REPORTS &amp; ANALYTICS MODULE</span>
          </nav>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Portfolio Intelligence &amp; Reports
          </h1>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {(['All Reports', 'Generate Report', 'Templates', 'Audit & Archives'] as ReportSubTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-[#2563eb] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* SUBTAB 1: ALL REPORTS */}
      {activeTab === 'All Reports' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Telemetry Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-2xs space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Portfolio Budget</span>
              <p className="text-2xl font-black text-slate-900">
                ${(totalBudget / 1000000).toFixed(2)}M
              </p>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#2563eb] h-full" style={{ width: `${utilization}%` }} />
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Spent: ${(totalSpent / 1000000).toFixed(2)}M ({utilization}% Utilized)
              </p>
            </div>
            <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-2xs space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Gate Pass Efficiency</span>
              <p className="text-2xl font-black text-emerald-600">94.2%</p>
              <p className="text-xs text-slate-500">{projects.length} active programs.</p>
            </div>
            <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-2xs space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Portfolio Health</span>
              <div className="flex items-center gap-1.5 pt-1 font-bold text-xs">
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">{greenProjects} G</span>
                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">{yellowProjects} A</span>
                <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-md">{redProjects} R</span>
              </div>
            </div>
            <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-2xs space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Critical Risk Density</span>
              <p className="text-2xl font-black text-amber-600">{totalRisks > 0 ? (totalRisks / (projects.length || 1)).toFixed(2) : '0.00'}</p>
              <p className="text-xs text-slate-500">{highRisks} Critical/High risks.</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold mr-1">Category Filter:</span>
              {['All', 'Executive', 'Financial', 'Governance', 'Resource'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedReportCategory(cat as any)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    selectedReportCategory === cat
                      ? 'bg-[#2563eb] text-white font-bold shadow-2xs'
                      : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {cat} Reports
                </button>
              ))}
            </div>

            <button
              onClick={() => setActiveTab('Generate Report')}
              className="px-4 py-2 bg-[#00174b] hover:bg-indigo-950 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>
              New Report
            </button>
          </div>

          {/* Report Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map((report) => {
              const latestVersion = getLatestVersion(report.versions || []);
              return (
                <div
                  key={report.id}
                  className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-2xs space-y-4 hover:border-blue-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="px-2.5 py-0.5 rounded-md font-bold text-[10px] uppercase bg-indigo-50 text-indigo-800 border border-indigo-100">
                        {report.category || 'Executive'}
                      </span>
                      <div className="flex items-center gap-1">
                        {/* EDIT REPORT BUTTON */}
                        <button
                          onClick={() => handleOpenEditReport(report)}
                          className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-md transition-colors cursor-pointer"
                          title="Edit Report Details"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        {/* DELETE REPORT BUTTON */}
                        <button
                          onClick={() => handleDeleteReport(report.id)}
                          className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors cursor-pointer"
                          title="Delete Report"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-sm leading-snug">{report.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{report.description || 'No description provided.'}</p>

                    <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 space-y-1 text-[11px]">
                      {/* PREPARED BY */}
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="text-slate-400 font-bold uppercase text-[9px]">Prepared By:</span>
                        <span className="font-bold text-slate-900">{report.preparedBy || 'PMO Directorate'}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="text-slate-400 font-bold uppercase text-[9px]">Period:</span>
                        <span className="font-semibold text-slate-800">{report.period || 'Q3 2026'}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="text-slate-400 font-bold uppercase text-[9px]">Type &amp; Status:</span>
                        <span className="font-semibold text-emerald-700 font-mono text-[10px]">{report.type || 'Summary'} • {report.status || 'Published'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {latestVersion ? `v${latestVersion.versionNumber}` : 'v1.0 (Excel)'}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* DOWNLOAD BUTTON */}
                      <button
                        onClick={() => downloadReportAsExcel(report)}
                        className="px-3.5 py-1.5 bg-[#00174b] hover:bg-indigo-950 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                        title="Download Report (Excel / Spreadsheet)"
                      >
                        <span className="material-symbols-outlined text-[15px] text-emerald-400">table_chart</span>
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredReports.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500 text-sm bg-white rounded-xl border border-slate-200">
                No reports found in this category. Click &quot;New Report&quot; to generate or upload an Excel report.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: GENERATE / UPLOAD REPORT */}
      {activeTab === 'Generate Report' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs max-w-2xl mx-auto space-y-5 animate-fadeIn text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900">Generate &amp; Upload Report</h2>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Create an official PMO status report with Excel spreadsheet support.
            </p>
          </div>

          <form onSubmit={handleGenerateReport} className="space-y-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Report Title *
              </label>
              <input
                type="text"
                required
                value={newReportTitle}
                onChange={(e) => setNewReportTitle(e.target.value)}
                placeholder="e.g. Q3 Portfolio Capex & Health Audit"
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Prepared By *
                </label>
                <input
                  type="text"
                  required
                  value={newReportPreparedBy}
                  onChange={(e) => setNewReportPreparedBy(e.target.value)}
                  placeholder="e.g. Sarah Jenkins (PMO Director)"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Reporting Period
                </label>
                <input
                  type="text"
                  value={newReportPeriod}
                  onChange={(e) => setNewReportPeriod(e.target.value)}
                  placeholder="e.g. Q3 2026 / August 2026"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={newReportCat}
                  onChange={(e) => setNewReportCat(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 font-medium"
                >
                  <option value="Executive">Executive</option>
                  <option value="Financial">Financial</option>
                  <option value="Governance">Governance</option>
                  <option value="Resource">Resource</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Report Type
                </label>
                <select
                  value={newReportType}
                  onChange={(e) => setNewReportType(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 font-medium"
                >
                  <option value="Executive Summary">Executive Summary</option>
                  <option value="Financial Audit">Financial Audit</option>
                  <option value="Risk Matrix Review">Risk Matrix Review</option>
                  <option value="Resource Loading">Resource Loading</option>
                  <option value="Milestone Tracker">Milestone Tracker</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Executive Description &amp; Highlights
              </label>
              <textarea
                rows={3}
                value={newReportDesc}
                onChange={(e) => setNewReportDesc(e.target.value)}
                placeholder="Key findings, budget highlights, and recommendations..."
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Attach Excel (.xlsx / .csv) or Document File
              </label>
              <input
                type="file"
                accept=".xlsx,.xls,.csv,.pdf,.docx"
                onChange={(e) => setNewReportFile(e.target.files?.[0] || null)}
                className="w-full border border-dashed border-slate-300 rounded-lg p-3 bg-slate-50 text-xs cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 mt-1 italic">
                Upload custom Excel sheets or use PMO automated dataset generation.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('All Reports')}
                className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingReport}
                className="px-5 py-2 bg-[#00174b] text-white font-bold rounded-lg uppercase tracking-wider hover:bg-indigo-950 disabled:opacity-60 flex items-center gap-2"
              >
                {isSubmittingReport ? 'Generating Report...' : 'Publish Report'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUBTAB 3: TEMPLATES */}
      {activeTab === 'Templates' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
            <div>
              <h2 className="text-base font-bold text-slate-900">Governance &amp; Charter Action Templates</h2>
              <p className="text-xs text-slate-500">Standardized templates with version management, upload &amp; download.</p>
            </div>
            <button
              onClick={() => {
                resetTemplateForm();
                setShowTemplateForm(true);
              }}
              className="px-4 py-2 bg-[#00174b] text-white rounded-lg font-bold text-xs flex items-center gap-1.5 hover:bg-indigo-950 shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Create Template
            </button>
          </div>

          {/* Template Creation/Edit Form Modal */}
          {showTemplateForm && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white max-w-lg w-full p-6 rounded-xl border border-slate-300 shadow-2xl space-y-4 text-xs">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <h3 className="font-bold text-slate-900 text-sm">
                    {editTemplateId ? 'Edit Action Template' : 'Create New Action Template'}
                  </h3>
                  <button onClick={resetTemplateForm} className="text-slate-400 hover:text-slate-700 text-sm">✕</button>
                </div>

                <form onSubmit={handleSaveTemplate} className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Template Name *</label>
                    <input
                      type="text"
                      required
                      value={tplName}
                      onChange={(e) => setTplName(e.target.value)}
                      placeholder="e.g. Executive Stage-Gate Charter"
                      className="w-full border p-2 rounded-lg text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Category</label>
                      <select
                        value={tplCat}
                        onChange={(e) => setTplCat(e.target.value)}
                        className="w-full border p-2 rounded-lg text-xs font-medium"
                      >
                        <option value="Executive">Executive</option>
                        <option value="Governance">Governance</option>
                        <option value="Finance">Finance</option>
                        <option value="Risk">Risk</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Initial Version</label>
                      <input
                        type="text"
                        value={tplVersion}
                        onChange={(e) => setTplVersion(e.target.value)}
                        className="w-full border p-2 rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={tplDesc}
                      onChange={(e) => setTplDesc(e.target.value)}
                      className="w-full border p-2 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Upload Template Document (.xlsx, .docx, .json)
                    </label>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.docx,.doc,.json,.pdf"
                      onChange={(e) => setTplFile(e.target.files?.[0] || null)}
                      className="w-full border border-dashed p-2 rounded-lg bg-slate-50 text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={resetTemplateForm}
                      className="px-4 py-2 border rounded-lg font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingTemplate}
                      className="px-5 py-2 bg-[#00174b] text-white font-bold rounded-lg uppercase tracking-wider hover:bg-indigo-950"
                    >
                      {isSubmittingTemplate ? 'Saving...' : 'Save Template'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((tpl) => {
              const latestVer = getLatestVersion(tpl.versions || []);
              return (
                <div
                  key={tpl.id}
                  className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-2xs space-y-4 hover:border-blue-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="px-2.5 py-0.5 rounded-md font-bold text-[10px] uppercase bg-purple-50 text-purple-900 border border-purple-200">
                        {tpl.category || 'Executive'}
                      </span>
                      <div className="flex items-center gap-1">
                        {/* EDIT TEMPLATE BUTTON */}
                        <button
                          onClick={() => handleEditTemplate(tpl)}
                          className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-md transition-colors"
                          title="Edit Template"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        {/* DELETE TEMPLATE BUTTON */}
                        <button
                          onClick={() => handleDeleteTemplate(tpl.id)}
                          className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                          title="Delete Template"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{tpl.name}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{tpl.description || 'No description provided.'}</p>

                    <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                      <span className="text-slate-500 font-bold uppercase text-[9px]">Version Status:</span>
                      <span className="font-bold text-indigo-900 font-mono">
                        {tpl.version ? `v${tpl.version}` : latestVer ? `v${latestVer.versionNumber}.0` : 'v1.0'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setViewingVersionTemplate(tpl)}
                      className="text-[11px] font-bold text-indigo-700 hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">history</span>
                      History ({tpl.versions?.length || 1})
                    </button>

                    {/* DOWNLOAD TEMPLATE BUTTON */}
                    <button
                      onClick={() => {
                        const fileUrl = latestVer?.fileUrl || tpl.fileUrl;
                        if (fileUrl) {
                          window.open(`http://localhost:5000${fileUrl}`, '_blank');
                        } else {
                          // Dynamic JSON/Document download
                          const blob = new Blob([JSON.stringify(tpl, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${tpl.name.replace(/\s+/g, '_')}_v${tpl.version || '1.0'}.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                          showToast(`✓ Downloaded template definition for ${tpl.name}`);
                        }
                      }}
                      className="px-3.5 py-1.5 bg-[#00174b] hover:bg-indigo-950 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-2xs transition-all"
                    >
                      <span className="material-symbols-outlined text-[14px]">download</span>
                      Download
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* EDIT REPORT MODAL */}
      {editingReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white max-w-lg w-full p-6 rounded-xl border border-slate-300 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Edit Report: {editingReport.title}</h3>
              <button onClick={() => setEditingReport(null)} className="text-slate-400 hover:text-slate-700 text-sm">✕</button>
            </div>

            <form onSubmit={handleSaveEditReport} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Report Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full border p-2 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Prepared By</label>
                  <input
                    type="text"
                    required
                    value={editPreparedBy}
                    onChange={(e) => setEditPreparedBy(e.target.value)}
                    className="w-full border p-2 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Period</label>
                  <input
                    type="text"
                    value={editPeriod}
                    onChange={(e) => setEditPeriod(e.target.value)}
                    className="w-full border p-2 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={editCat}
                    onChange={(e) => setEditCat(e.target.value)}
                    className="w-full border p-2 rounded-lg text-xs"
                  >
                    <option value="Executive">Executive</option>
                    <option value="Financial">Financial</option>
                    <option value="Governance">Governance</option>
                    <option value="Resource">Resource</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full border p-2 rounded-lg text-xs font-bold"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Under Review">Under Review</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full border p-2 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Replace Excel / Document File (Optional)
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv,.pdf"
                  onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                  className="w-full border border-dashed p-2 rounded-lg bg-slate-50 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingReport(null)}
                  className="px-4 py-2 border rounded-lg font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingReport}
                  className="px-5 py-2 bg-[#00174b] text-white font-bold rounded-lg uppercase tracking-wider hover:bg-indigo-950"
                >
                  {isUpdatingReport ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEMPLATE VERSION HISTORY MODAL */}
      {viewingVersionTemplate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white max-w-md w-full p-6 rounded-xl border border-slate-300 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Version History</h3>
                <p className="text-slate-500 text-[11px]">{viewingVersionTemplate.name}</p>
              </div>
              <button onClick={() => setViewingVersionTemplate(null)} className="text-slate-400 hover:text-slate-700 text-sm">✕</button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(viewingVersionTemplate.versions && viewingVersionTemplate.versions.length > 0) ? (
                viewingVersionTemplate.versions.map((v) => (
                  <div key={v.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="font-bold text-indigo-950 font-mono">Version {v.versionNumber}.0</span>
                      <p className="text-[10px] text-slate-500">{new Date(v.createdAt).toLocaleDateString()}</p>
                    </div>
                    {v.fileUrl && (
                      <a
                        href={`http://localhost:5000${v.fileUrl}`}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded font-bold text-[11px] flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[13px]">download</span>
                        Download
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-3 bg-slate-50 text-slate-500 text-center rounded-lg">
                  Initial version v1.0 active.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setViewingVersionTemplate(null)}
                className="px-4 py-2 bg-[#00174b] text-white font-bold rounded-lg uppercase"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
