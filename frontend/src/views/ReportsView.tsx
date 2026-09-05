import React, { useState } from 'react';
import { Project, RiskItem, ReportItem, ReportTemplate, LoggedInPersona, TaskItem, BudgetItem, ResourceLoading } from '../types';
import { createReportApi, updateReportApi, deleteReportApi, createTemplateApi, updateTemplateApi, deleteTemplateApi } from '../services/api';

interface ReportsViewProps {
  projects?: Project[];
  risks?: RiskItem[];
  tasks?: TaskItem[];
  budgets?: BudgetItem[];
  resources?: ResourceLoading[];
  reports?: ReportItem[];
  reportsLoading?: boolean;
  reportsError?: string | null;
  templates?: ReportTemplate[];
  onReportsChange?: (reports: ReportItem[]) => void;
  onTemplatesChange?: (templates: ReportTemplate[]) => void;
  currentPersona?: LoggedInPersona | null;
}

type ReportSubTab = 'All Reports' | 'Submit Report' | 'Templates' | 'Report History';

export const ReportsView: React.FC<ReportsViewProps> = ({
  projects = [],
  risks = [],
  tasks = [],
  budgets = [],
  resources = [],
  reports = [],
  reportsLoading = false,
  reportsError = null,
  templates = [],
  onReportsChange,
  onTemplatesChange,
  currentPersona,
}) => {
  const [activeTab, setActiveTab] = useState<ReportSubTab>('All Reports');
  const [selectedReportCategory, setSelectedReportCategory] = useState<'All' | 'Executive' | 'Financial' | 'Governance' | 'Resource'>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [viewingReport, setViewingReport] = useState<ReportItem | null>(null);

  // Submit Report Form State
  const [newReportTitle, setNewReportTitle] = useState('');
  const [newReportDesc, setNewReportDesc] = useState('');
  const [newReportCat, setNewReportCat] = useState('Executive');
  const [newReportPreparedBy, setNewReportPreparedBy] = useState(currentPersona?.name || 'PMO Directorate');
  const [newReportStartDate, setNewReportStartDate] = useState('');
  const [newReportEndDate, setNewReportEndDate] = useState('');
  const [newReportType, setNewReportType] = useState('Executive Summary');
  const [newReportProjectCode, setNewReportProjectCode] = useState('');
  const [newReportTemplateId, setNewReportTemplateId] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerTitle, setNewOwnerTitle] = useState('');
  const [newProgramStatus, setNewProgramStatus] = useState('On Track');
  const [newPercentCompleted, setNewPercentCompleted] = useState('0');
  const [newProjectLead, setNewProjectLead] = useState('');
  const [newProjectPriority, setNewProjectPriority] = useState('Medium');
  const [newProjectStatus, setNewProjectStatus] = useState('Not Started');
  const [newBudgetPlanned, setNewBudgetPlanned] = useState('0');
  const [newBudgetActual, setNewBudgetActual] = useState('0');
  const [newMilestones, setNewMilestones] = useState('');
  const [newCriticalRisks, setNewCriticalRisks] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newAdditionalNotes, setNewAdditionalNotes] = useState('');
  const [newReportFile, setNewReportFile] = useState<File | null>(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Edit Report Modal State
  const [editingReport, setEditingReport] = useState<ReportItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCat, setEditCat] = useState('Executive');
  const [editPreparedBy, setEditPreparedBy] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editType, setEditType] = useState('');
  const [editProjectCode, setEditProjectCode] = useState('');
  const [editReportTemplateId, setEditReportTemplateId] = useState('');
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editOwnerTitle, setEditOwnerTitle] = useState('');
  const [editProgramStatus, setEditProgramStatus] = useState('On Track');
  const [editPercentCompleted, setEditPercentCompleted] = useState('0');
  const [editProjectLead, setEditProjectLead] = useState('');
  const [editProjectPriority, setEditProjectPriority] = useState('Medium');
  const [editProjectStatus, setEditProjectStatus] = useState('Not Started');
  const [editBudgetPlanned, setEditBudgetPlanned] = useState('0');
  const [editBudgetActual, setEditBudgetActual] = useState('0');
  const [editMilestones, setEditMilestones] = useState('');
  const [editCriticalRisks, setEditCriticalRisks] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editAdditionalNotes, setEditAdditionalNotes] = useState('');
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
  const [tplProjectCode, setTplProjectCode] = useState('');
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

  const appendReportFields = (formData: FormData, values: Record<string, string>) => {
    Object.entries(values).forEach(([key, value]) => formData.append(key, value));
  };

  const isUuid = (value: string | undefined) => Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));

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
    const selectedProject = projects.find((project) => project.code === newReportProjectCode);
    if (!newReportTitle.trim() || !newReportTemplateId || !selectedProject) {
      return showToast('Template, project, and title are required');
    }
    const percentCompleted = Number(newPercentCompleted);
    if (!Number.isFinite(percentCompleted) || percentCompleted < 0 || percentCompleted > 100) {
      return showToast('Percent completed must be between 0 and 100');
    }

    setIsSubmittingReport(true);
    const formData = new FormData();
    formData.append('title', newReportTitle);
    formData.append('description', newReportDesc);
    formData.append('category', newReportCat);
    formData.append('preparedBy', newReportPreparedBy);
    formData.append('startDate', newReportStartDate);
    formData.append('endDate', newReportEndDate);
    formData.append('type', newReportType);
    formData.append('format', 'Excel');
    if (isUuid(selectedProject.id)) formData.append('projectId', selectedProject.id);
    formData.append('projectName', selectedProject.name);
    formData.append('projectCode', selectedProject.code);
    formData.append('status', 'Published');
    appendReportFields(formData, {
      templateId: newReportTemplateId,
      ownerName: newOwnerName,
      ownerTitle: newOwnerTitle,
      programStatus: newProgramStatus,
      percentCompleted: newPercentCompleted,
      projectLead: newProjectLead,
      projectPriority: newProjectPriority,
      projectStatus: newProjectStatus,
      overallProjectStatus: newProjectStatus,
      progress: newPercentCompleted,
      budgetPlanned: newBudgetPlanned,
      budgetActual: newBudgetActual,
      budgetVariance: String(Number(newBudgetPlanned || 0) - Number(newBudgetActual || 0)),
      milestones: newMilestones,
      criticalRisks: newCriticalRisks,
      summary: newSummary,
      additionalNotes: newAdditionalNotes,
    });
    if (newReportFile) formData.append('file', newReportFile);

    try {
      const created = await createReportApi(formData);
      if (created && onReportsChange) {
        onReportsChange([created, ...reports]);
        showToast('✓ Report created and published successfully');
        setNewReportTitle('');
        setNewReportDesc('');
        setNewReportFile(null);
        setNewReportTemplateId('');
        setNewOwnerName('');
        setNewOwnerTitle('');
        setNewProjectLead('');
        setNewMilestones('');
        setNewCriticalRisks('');
        setNewSummary('');
        setNewAdditionalNotes('');
        setActiveTab('All Reports');
      } else {
        showToast('❌ Report could not be submitted to the database');
      }
    } catch (err: any) {
      showToast(`❌ ${err.message || 'Error submitting report'}`);
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
    setEditStartDate(report.startDate || '');
    setEditEndDate(report.endDate || '');
    setEditType(report.type || 'Executive Summary');
    setEditProjectCode(report.projectCode || '');
    setEditReportTemplateId(report.templateId || '');
    setEditOwnerName(report.ownerName || '');
    setEditOwnerTitle(report.ownerTitle || '');
    setEditProgramStatus(report.programStatus || 'On Track');
    setEditPercentCompleted(String(report.percentCompleted ?? report.progress ?? 0));
    setEditProjectLead(report.projectLead || '');
    setEditProjectPriority(report.projectPriority || 'Medium');
    setEditProjectStatus(report.projectStatus || report.overallProjectStatus || 'Not Started');
    setEditBudgetPlanned(String(report.budgetPlanned ?? 0));
    setEditBudgetActual(String(report.budgetActual ?? 0));
    setEditMilestones(report.milestones || '');
    setEditCriticalRisks(report.criticalRisks || '');
    setEditSummary(report.summary || '');
    setEditAdditionalNotes(report.additionalNotes || '');
    setEditStatus(report.status || 'Published');
    setEditFile(null);
  };

  const handleSaveEditReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReport?.id) return showToast('Report ID is missing');
    if (!editTitle.trim()) return showToast('Report title is required');
    const editPercent = Number(editPercentCompleted);
    if (!Number.isFinite(editPercent) || editPercent < 0 || editPercent > 100) {
      return showToast('Percent completed must be between 0 and 100');
    }

    setIsUpdatingReport(true);
    const formData = new FormData();
    formData.append('title', editTitle);
    formData.append('description', editDesc);
    formData.append('category', editCat);
    formData.append('preparedBy', editPreparedBy);
    formData.append('startDate', editStartDate);
    formData.append('endDate', editEndDate);
    formData.append('type', editType);
    formData.append('status', editStatus);
    formData.append('format', 'Excel');
    appendReportFields(formData, {
      ownerName: editOwnerName,
      ownerTitle: editOwnerTitle,
      programStatus: editProgramStatus,
      percentCompleted: editPercentCompleted,
      projectLead: editProjectLead,
      projectPriority: editProjectPriority,
      projectStatus: editProjectStatus,
      overallProjectStatus: editProjectStatus,
      progress: editPercentCompleted,
      budgetPlanned: editBudgetPlanned,
      budgetActual: editBudgetActual,
      budgetVariance: String(Number(editBudgetPlanned || 0) - Number(editBudgetActual || 0)),
      milestones: editMilestones,
      criticalRisks: editCriticalRisks,
      summary: editSummary,
      additionalNotes: editAdditionalNotes,
    });
    if (/^\d+$/.test(editReportTemplateId)) {
      formData.append('templateId', editReportTemplateId);
    } else if (editingReport.templateId) {
      formData.append('templateId', editingReport.templateId);
    }
    const selectedProject = projects.find((project) => project.code === editProjectCode);
    if (selectedProject) {
      formData.append('projectId', selectedProject.id);
      formData.append('projectName', selectedProject.name);
      formData.append('projectCode', selectedProject.code);
    } else if (editingReport.projectId && isUuid(editingReport.projectId)) {
      formData.append('projectId', editingReport.projectId);
      formData.append('projectName', editingReport.projectName || '');
      formData.append('projectCode', editingReport.projectCode || '');
    }
    if (editFile) formData.append('file', editFile);

    try {
      const updated = await updateReportApi(editingReport.id, formData);
      if (updated && onReportsChange) {
        onReportsChange(reports.map((r) => (r.id === updated.id ? updated : r)));
        showToast('✓ Report updated successfully');
        setEditingReport(null);
      }
    } catch (err: any) {
      showToast(`❌ ${err.response?.data?.message || err.message || 'Error updating report'}`);
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
    setTplProjectCode('');
    setTplFile(null);
    setEditTemplateId(null);
    setShowTemplateForm(false);
  };

  const handleEditTemplate = (tpl: ReportTemplate) => {
    setTplName(tpl.name);
    setTplDesc(tpl.description || '');
    setTplCat(tpl.category || 'Executive');
    setTplVersion(tpl.version || '1.0');
    setTplProjectCode(tpl.projectCode || '');
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
    formData.append('title', tplName);
    formData.append('templateCode', templates.find((template) => template.id === editTemplateId)?.code || `TPL-${Date.now()}`);
    formData.append('description', tplDesc);
    formData.append('category', tplCat);
    formData.append('version', tplVersion);
    const selectedProject = projects.find((project) => project.code === tplProjectCode);
    if (selectedProject) {
      formData.append('projectName', selectedProject.name);
      formData.append('projectCode', selectedProject.code);
    }
    if (tplFile) formData.append('file', tplFile);

    try {
      if (editTemplateId) {
        const updated = await updateTemplateApi(editTemplateId, formData);
        if (updated && onTemplatesChange) {
          onTemplatesChange(templates.map((t) => (t.id === updated.id ? updated : t)));
          showToast('✓ Template updated successfully');
        } else {
          showToast('❌ Template could not be saved to the database');
        }
      } else {
        const created = await createTemplateApi(formData);
        if (created && onTemplatesChange) {
          onTemplatesChange([created, ...templates]);
          showToast('✓ Template created successfully');
        } else {
          showToast('❌ Template could not be saved to the database');
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

  // If team member, only show reports related to their assigned projects or prepared by them
  const visibleReports = currentPersona?.roleType === 'TEAM_MEMBER'
    ? reports.filter(r => {
        const assigned = currentPersona?.assignedProjectCodes || [];
        // report may include projectCode or relatedProject fields
        const projectCode = (r as any).projectCode || (r as any).relatedProject || '';
        return assigned.includes(projectCode) || r.preparedBy === currentPersona?.name || r.preparedBy === currentPersona?.email;
      })
    : reports;

  const filteredReports = visibleReports.filter((r) => {
    return selectedReportCategory === 'All' || r.category === selectedReportCategory;
  });

  const safeNumber = (value: unknown) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  };
  const projectStatus = (project: Project) => {
    if (project.status === 'COMPLETED') return 'Complete';
    if (project.status === 'DELAYED' || project.health === 'RED') return 'Delayed';
    if (project.status === 'PLANNING') return 'Not Started';
    if (project.health === 'YELLOW') return 'At Risk';
    return 'On Track';
  };
  const statusCounts = projects.reduce<Record<string, number>>((counts, project) => {
    const status = projectStatus(project);
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});
  const totalProjects = projects.length;
  const onTrackProjects = statusCounts['On Track'] || 0;
  const atRiskProjects = (statusCounts['At Risk'] || 0) + (statusCounts['Delayed'] || 0) + (statusCounts['Off Track'] || 0);
  const onTrackPercentage = totalProjects ? Math.round((onTrackProjects / totalProjects) * 100) : 0;
  const plannedBudget = budgets.length
    ? budgets.reduce((total, budget) => total + safeNumber(budget.allocated), 0)
    : projects.reduce((total, project) => total + safeNumber(project.budget), 0);
  const actualBudget = budgets.length
    ? budgets.reduce((total, budget) => total + safeNumber(budget.actualSpent), 0)
    : projects.reduce((total, project) => total + safeNumber(project.spent), 0);
  const budgetVariance = plannedBudget - actualBudget;
  const statusColors: Record<string, string> = {
    'On Track': '#16a34a',
    'At Risk': '#d97706',
    Delayed: '#dc2626',
    Complete: '#2563eb',
    'Not Started': '#94a3b8',
    'Off Track': '#991b1b',
  };
  const statusGradient = totalProjects
    ? Object.entries(statusCounts).reduce((segments, [status, count], index, entries) => {
        const start = entries.slice(0, index).reduce((sum, [, previousCount]) => sum + (previousCount / totalProjects) * 100, 0);
        const end = start + (count / totalProjects) * 100;
        return `${segments}${index ? ', ' : ''}${statusColors[status] || '#64748b'} ${start}% ${end}%`;
      }, '')
    : '';
  const resourceLoading = resources.length
    ? Math.round(resources.reduce((total, resource) => total + safeNumber(resource.percentage), 0) / resources.length)
    : 0;
  const scheduledProjects = projects.filter((project) => {
    const scheduleProject = project as Project & { startDate?: string; endDate?: string };
    return Boolean(scheduleProject.startDate && scheduleProject.endDate);
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
            PMO Report and Submit Report
          </h1>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {(['All Reports', 'Submit Report', 'Templates', 'Report History'] as ReportSubTab[]).map((tab) => (
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
          <section className="space-y-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">PMO portfolio control center</span>
              <h2 className="text-xl font-black text-slate-900">Project Management Office</h2>
              <p className="text-xs text-slate-500">Live delivery, financial, risk, task, and resource signals from the PMO data set.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                ['Total Projects', totalProjects, 'bg-slate-900 text-white'],
                ['On Track', onTrackProjects, 'bg-emerald-50 text-emerald-800'],
                ['On Track %', `${onTrackPercentage}%`, 'bg-blue-50 text-blue-800'],
                ['At Risk', atRiskProjects, 'bg-amber-50 text-amber-800'],
              ].map(([label, value, className]) => (
                <div key={label as string} className={`rounded-xl border border-slate-200/80 p-4 shadow-2xs ${className}`}>
                  <span className="block text-[10px] font-bold uppercase tracking-wider opacity-70">{label as string}</span>
                  <strong className="mt-2 block text-2xl font-black">{value as string | number}</strong>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-black text-slate-900">Project Schedule</h3>
                    <p className="text-[11px] text-slate-500">Timeline rendered from stored project start and end dates.</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">{scheduledProjects.length} scheduled</span>
                </div>
                {scheduledProjects.length ? (
                  <div className="space-y-3">
                    {scheduledProjects.map((project) => {
                      const scheduleProject = project as Project & { startDate?: string; endDate?: string };
                      const start = new Date(scheduleProject.startDate as string).getTime();
                      const end = new Date(scheduleProject.endDate as string).getTime();
                      const duration = Math.max(end - start, 1);
                      const progress = Math.min(100, Math.max(0, safeNumber(project.progress)));
                      return (
                        <div key={project.id} className="grid grid-cols-[minmax(110px,1fr)_2fr_52px] items-center gap-3 text-[11px]">
                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-800">{project.name || '-'}</p>
                            <p className="text-[10px] text-slate-400">{scheduleProject.startDate} to {scheduleProject.endDate}</p>
                          </div>
                          <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.max(progress, 8)}%` }} title={`${progress}% complete`} />
                          </div>
                          <span className="text-right font-bold text-slate-600">{Math.round((duration / 86400000))}d</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500">No project schedule dates available.</div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
                <h3 className="font-black text-slate-900">Resources</h3>
                <p className="text-[11px] text-slate-500 mb-4">Actual department loading from the resource service.</p>
                {resources.length ? (
                  <div className="flex items-center gap-5">
                    <div className="h-28 w-28 shrink-0 rounded-full" style={{ background: `conic-gradient(#2563eb ${resourceLoading}%, #e2e8f0 ${resourceLoading}% 100%)` }}>
                      <div className="m-3 flex h-20 w-20 items-center justify-center rounded-full bg-white text-lg font-black text-slate-900">{resourceLoading}%</div>
                    </div>
                    <div className="space-y-2 text-xs">
                      <p><span className="font-bold text-blue-700">{resources.reduce((total, resource) => total + safeNumber(resource.headcount), 0)}</span> loaded headcount</p>
                      <p className="text-slate-500">Available: -</p>
                      <p className="text-slate-500">Overallocated: -</p>
                    </div>
                  </div>
                ) : <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500">No resource data available.</div>}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
                <h3 className="font-black text-slate-900">Project Status</h3>
                <p className="text-[11px] text-slate-500 mb-4">Distribution calculated from current project status and health.</p>
                {totalProjects ? <div className="flex items-center gap-5">
                  <div className="h-28 w-28 shrink-0 rounded-full" style={{ background: `conic-gradient(${statusGradient})` }}>
                    <div className="m-3 flex h-20 w-20 items-center justify-center rounded-full bg-white text-lg font-black text-slate-900">{totalProjects}</div>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    {Object.entries(statusCounts).map(([status, count]) => <p key={status} className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: statusColors[status] || '#64748b' }} />{status}: <b>{count}</b></p>)}
                  </div>
                </div> : <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500">No project status data available.</div>}
              </div>

              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
                <h3 className="font-black text-slate-900">Budget</h3>
                <p className="text-[11px] text-slate-500 mb-4">Planned and actual values from budgets or project records.</p>
                {(plannedBudget || actualBudget) ? <div className="space-y-3 text-xs">
                  <p className="flex justify-between"><span className="text-slate-500">Planned</span><b>${plannedBudget.toLocaleString()}</b></p>
                  <p className="flex justify-between"><span className="text-slate-500">Actual</span><b>${actualBudget.toLocaleString()}</b></p>
                  <p className={`flex justify-between border-t border-slate-100 pt-3 ${budgetVariance < 0 ? 'text-red-600' : 'text-emerald-700'}`}><span>Variance</span><b>${budgetVariance.toLocaleString()}</b></p>
                  <p className="flex justify-between font-bold"><span>Total Budget</span><span>${plannedBudget.toLocaleString()}</span></p>
                </div> : <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500">No budget data available.</div>}
              </div>

              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
                <h3 className="font-black text-slate-900">Risks</h3>
                <p className="text-[11px] text-slate-500 mb-3">Current risks from the risk module.</p>
                {risks.length ? <div className="max-h-36 space-y-2 overflow-y-auto">{risks.slice(0, 6).map((risk) => <div key={risk.id} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 text-xs"><span className="truncate font-semibold text-slate-700">{risk.subject || '-'}</span><span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">{risk.severity || '-'}</span></div>)}</div> : <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500">No risk data available.</div>}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
              <div className="mb-3 flex items-center justify-between"><div><h3 className="font-black text-slate-900">Tasks</h3><p className="text-[11px] text-slate-500">Live delivery tasks across the accessible project set.</p></div><span className="text-[10px] font-bold uppercase text-slate-400">{tasks.length} total</span></div>
              {tasks.length ? <div className="overflow-x-auto"><table className="w-full min-w-155 text-left text-xs"><thead className="border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-400"><tr><th className="pb-2">Task</th><th className="pb-2">Assignee</th><th className="pb-2">Due Date</th><th className="pb-2">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{tasks.slice(0, 8).map((task) => <tr key={task.id}><td className="py-2 font-semibold text-slate-700">{task.title || '-'}</td><td className="py-2 text-slate-600">{task.assignee || '-'}</td><td className="py-2 text-slate-500">{task.dueDate || '-'}</td><td className="py-2 font-bold text-blue-700">{task.status || '-'}</td></tr>)}</tbody></table></div> : <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500">No task data available.</div>}
            </div>
          </section>

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
              onClick={() => setActiveTab('Submit Report')}
              className="px-4 py-2 bg-[#00174b] hover:bg-indigo-950 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>
              New Report
            </button>
          </div>

          {/* Report Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportsLoading ? (
              <div className="col-span-full py-12 text-center text-sm text-slate-500 bg-white rounded-xl border border-slate-200">Loading saved reports...</div>
            ) : reportsError ? (
              <div className="col-span-full py-12 text-center text-sm text-red-600 bg-red-50 rounded-xl border border-red-200">{reportsError}</div>
            ) : filteredReports.map((report) => {
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
                        <button
                          onClick={() => setViewingReport(report)}
                          className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-md transition-colors cursor-pointer"
                          title="View Report"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
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
                    <p className="text-[11px] font-bold text-blue-700">Project: {report.projectName || 'All projects'}</p>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{report.description || 'No description provided.'}</p>

                    <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 space-y-1 text-[11px]">
                      {/* PREPARED BY */}
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="text-slate-400 font-bold uppercase text-[9px]">Prepared By:</span>
                        <span className="font-bold text-slate-900">{report.preparedBy || 'PMO Directorate'}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="text-slate-400 font-bold uppercase text-[9px]">Period:</span>
                        <span className="font-semibold text-slate-800">{report.period || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="text-slate-400 font-bold uppercase text-[9px]">Date Range:</span>
                        <span className="font-semibold text-slate-800">
                          {report.startDate || 'Not set'} - {report.endDate || 'Not set'}
                        </span>
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

            {!reportsLoading && !reportsError && filteredReports.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500 text-sm bg-white rounded-xl border border-slate-200">
                No reports found in this category. Click &quot;New Report&quot; to generate or upload an Excel report.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: GENERATE / UPLOAD REPORT */}
      {activeTab === 'Submit Report' && (
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
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Template</label>
                <select value={newReportTemplateId} onChange={(e) => setNewReportTemplateId(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900">
                  <option value="">No template selected</option>
                  {templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Project Name</label>
                <select value={newReportProjectCode} onChange={(e) => setNewReportProjectCode(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-medium">
                  <option value="">All projects</option>
                  {projects.map((project) => <option key={project.id} value={project.code}>{project.name} ({project.code})</option>)}
                </select>
              </div>
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

            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Owner Name</label>
                <input value={newOwnerName} onChange={(e) => setNewOwnerName(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-xs" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Owner Title</label>
                <input value={newOwnerTitle} onChange={(e) => setNewOwnerTitle(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-xs" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Project Status</label>
                <select value={newProjectStatus} onChange={(e) => setNewProjectStatus(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-xs">
                  {['Not Started', 'On Track', 'Complete', 'Delayed', 'At Risk', 'Off Track'].map((status) => <option key={status}>{status}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Priority</label>
                <select value={newProjectPriority} onChange={(e) => setNewProjectPriority(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-xs">
                  {['Low', 'Medium', 'High'].map((priority) => <option key={priority}>{priority}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Percent Completed</label>
                <input type="number" min="0" max="100" value={newPercentCompleted} onChange={(e) => setNewPercentCompleted(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Planned Budget</label>
                <input type="number" min="0" step="0.01" value={newBudgetPlanned} onChange={(e) => setNewBudgetPlanned(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-xs" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Actual Budget</label>
                <input type="number" min="0" step="0.01" value={newBudgetActual} onChange={(e) => setNewBudgetActual(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-xs" />
                <span className="text-[10px] text-slate-500">Variance: {(Number(newBudgetPlanned || 0) - Number(newBudgetActual || 0)).toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Start Date</label>
                <input
                  type="date"
                  value={newReportStartDate}
                  onChange={(e) => setNewReportStartDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">End Date</label>
                <input
                  type="date"
                  value={newReportEndDate}
                  min={newReportStartDate || undefined}
                  onChange={(e) => setNewReportEndDate(e.target.value)}
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

            <div className="grid grid-cols-2 gap-4">
              {[
                ['Critical Risks and Roadblocks', newCriticalRisks, setNewCriticalRisks],
              ].map(([label, value, setter]) => (
                <div key={label as string}>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">{label as string}</label>
                  <textarea rows={2} value={value as string} onChange={(e) => (setter as React.Dispatch<React.SetStateAction<string>>)(e.target.value)} placeholder="Enter one item per line" className="w-full border border-slate-300 rounded-lg p-2.5 text-xs" />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Summary</label>
                <textarea rows={3} value={newSummary} onChange={(e) => setNewSummary(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-xs" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Additional Notes</label>
                <textarea rows={3} value={newAdditionalNotes} onChange={(e) => setNewAdditionalNotes(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-xs" />
              </div>
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
                {isSubmittingReport ? 'Submitting Report...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'Report History' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-x-auto animate-fadeIn">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Report History</h2>
            <p className="text-xs text-slate-500 mt-1">Previously submitted reports from the PMO database.</p>
          </div>
          {filteredReports.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Report</th>
                  <th className="px-5 py-3">Project</th>
                  <th className="px-5 py-3">Format</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-bold text-slate-900">{report.title}</td>
                    <td className="px-5 py-3 text-slate-700">{report.projectName || 'All projects'}</td>
                    <td className="px-5 py-3 font-mono text-slate-600">{report.format || 'Excel'}</td>
                    <td className="px-5 py-3 text-emerald-700 font-semibold">{report.status || 'Published'}</td>
                    <td className="px-5 py-3 text-slate-500">{report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Not available'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-sm text-slate-500">No submitted reports found.</div>
          )}
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
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Project Name</label>
                      <select value={tplProjectCode} onChange={(e) => setTplProjectCode(e.target.value)} className="w-full border p-2 rounded-lg text-xs font-medium">
                        <option value="">All projects</option>
                        {projects.map((project) => <option key={project.id} value={project.code}>{project.name} ({project.code})</option>)}
                      </select>
                    </div>
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
                        <span className="text-[11px] font-bold text-blue-700">Project: {tpl.projectName || 'All projects'}</span>
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

      {viewingReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 rounded-xl border border-slate-300 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Saved PMO Report</p>
                <h3 className="font-black text-slate-900 text-lg">{viewingReport.title || '-'}</h3>
                <p className="text-slate-500">{viewingReport.projectName || 'Project unavailable'}</p>
              </div>
              <button onClick={() => setViewingReport(null)} className="text-slate-400 hover:text-slate-700 text-sm">✕</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ['Program Status', viewingReport.programStatus],
                ['Percent Complete', viewingReport.percentCompleted == null ? '-' : `${viewingReport.percentCompleted}%`],
                ['Project Status', viewingReport.projectStatus || viewingReport.overallProjectStatus],
                ['Owner', viewingReport.ownerName],
              ].map(([label, value]) => <div key={label as string} className="rounded-lg bg-slate-50 border border-slate-200 p-3"><span className="block text-[9px] uppercase font-bold text-slate-400">{label as string}</span><strong className="block mt-1 text-slate-800">{value || '-'}</strong></div>)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><h4 className="font-bold text-slate-800 mb-1">Summary</h4><p className="whitespace-pre-wrap text-slate-600">{viewingReport.summary || viewingReport.description || 'No summary provided.'}</p></div>
              <div><h4 className="font-bold text-slate-800 mb-1">Additional Notes</h4><p className="whitespace-pre-wrap text-slate-600">{viewingReport.additionalNotes || 'No additional notes.'}</p></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><h4 className="font-bold text-slate-800 mb-1">Budget</h4><p className="text-slate-600">Planned: ${safeNumber(viewingReport.budgetPlanned).toLocaleString()} • Actual: ${safeNumber(viewingReport.budgetActual).toLocaleString()} • Variance: ${safeNumber(viewingReport.budgetVariance).toLocaleString()}</p></div>
              <div><h4 className="font-bold text-slate-800 mb-1">Risks and Roadblocks</h4><p className="whitespace-pre-wrap text-slate-600">{viewingReport.criticalRisks || 'No risks recorded.'}</p></div>
            </div>
            <div className="flex justify-end border-t border-slate-100 pt-3"><button onClick={() => setViewingReport(null)} className="px-4 py-2 bg-[#00174b] text-white font-bold rounded-lg">Close</button></div>
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

              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Start Date</label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full border p-2 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">End Date</label>
                  <input
                    type="date"
                    value={editEndDate}
                    min={editStartDate || undefined}
                    onChange={(e) => setEditEndDate(e.target.value)}
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
