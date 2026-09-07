import React, { useEffect, useState } from 'react';
import {
  ExecutiveTemplate,
  ExecutiveTemplateRequest,
  Project,
  NavigationTab,
  LoggedInPersona
} from '../types';
import { createTemplateApi, deleteTemplateApi, fetchTemplatesApi, updateTemplateApi, fetchPendingExecutiveRequestsApi, fetchExecutiveAuditLogApi, createExecutiveRequestApi, approveExecutiveRequestApi, rejectExecutiveRequestApi } from '../services/api';

interface TemplatesViewProps {
  projects?: Project[];
  onNavigate?: (tab: NavigationTab) => void;
  currentPersona?: LoggedInPersona | null;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({ projects = [], currentPersona }) => {
  const [activeSubTab, setActiveSubTab] = useState<'Library' | 'Requests' | 'Audit Log'>('Library');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const mapApiTemplate = (template: any): ExecutiveTemplate => ({
    id: String(template.id),
    title: template.title || template.name,
    code: template.code || template.templateCode,
    version: template.version || '1.0',
    category: template.category || 'Executive Charter',
    description: template.description || '',
    requiredApproverRole: template.requiredApproverRole || template.requiredSignOff || 'Executive Sponsor',
    icon: template.icon || 'verified_user',
    isExecutiveOnly: true,
    projectName: template.projectName,
    projectCode: template.projectCode,
    createdAt: template.createdAt || new Date().toISOString(),
    versions: template.versions || [],
    fields: template.fields || []
  });

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const apiTemplates = await fetchTemplatesApi();
        if (Array.isArray(apiTemplates)) {
          setTemplates(apiTemplates.map(mapApiTemplate));
        } else {
          setTemplates([]);
        }
      } catch (err) {
        console.error('Failed to load templates from backend:', err);
        showToast('Failed to load templates from the database.');
      }
    };
    loadTemplates();
  }, []);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const apiRequests = await fetchPendingExecutiveRequestsApi();
        if (Array.isArray(apiRequests)) {
          setRequests(apiRequests);
        } else {
          setRequests([]);
        }
      } catch (err) {
        console.error('Failed to load pending requests:', err);
      }
    };
    loadRequests();
  }, []);

  useEffect(() => {
    const loadAuditLog = async () => {
      try {
        const apiAudit = await fetchExecutiveAuditLogApi();
        if (Array.isArray(apiAudit)) {
          setAuditLogs(apiAudit);
        } else {
          setAuditLogs([]);
        }
      } catch (err) {
        console.error('Failed to load executive audit log:', err);
      }
    };
    loadAuditLog();
  }, []);

  const [templates, setTemplates] = useState<ExecutiveTemplate[]>([]);
  const [auditLogs, setAuditLogs] = useState<ExecutiveTemplateRequest[]>([]);

  // Request Submissions State
  const [requests, setRequests] = useState<ExecutiveTemplateRequest[]>([]);

  // New Request Form State
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [newRequestTemplateId, setNewRequestTemplateId] = useState('');
  const [newRequestProjectCode, setNewRequestProjectCode] = useState('');
  const [newRequestApproverRole, setNewRequestApproverRole] = useState('Executive Sponsor');
  const [newRequestFieldValues, setNewRequestFieldValues] = useState<Record<string, string | boolean>>({});

  // Modals & Action States
  const [isCreatingNewTemplate, setIsCreatingNewTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ExecutiveTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<ExecutiveTemplate | null>(null);
  const [versioningTemplate, setVersioningTemplate] = useState<ExecutiveTemplate | null>(null);
  const [historyTemplate, setHistoryTemplate] = useState<ExecutiveTemplate | null>(null);
  const [uploadingTemplate, setUploadingTemplate] = useState<ExecutiveTemplate | null>(null);

  // Form State for Template Creation / Editing
  const [formTitle, setFormTitle] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCategory, setFormCategory] = useState<ExecutiveTemplate['category']>('Executive Charter');
  const [formDescription, setFormDescription] = useState('');
  const [formApprover, setFormApprover] = useState<ExecutiveTemplate['requiredApproverRole']>('Executive Sponsor');
  const [formVersion, setFormVersion] = useState('1.0');
  const [formProjectCode, setFormProjectCode] = useState('');

  // Version Bump State
  const [bumpVersionNumber, setBumpVersionNumber] = useState('');
  const [bumpChangeNotes, setBumpChangeNotes] = useState('');
  const [bumpFile, setBumpFile] = useState<File | null>(null);

  // Upload State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ---- CRUD HANDLERS ----
  const handleOpenCreateModal = () => {
    setFormTitle('');
    setFormCode(`EXEC-TPL-${Date.now()}`);
    setFormCategory('Executive Charter');
    setFormDescription('');
    setFormApprover('Executive Sponsor');
    setFormVersion('1.0');
    setFormProjectCode('');
    setIsCreatingNewTemplate(true);
  };

  const handleOpenEditModal = (tpl: ExecutiveTemplate) => {
    setEditingTemplate(tpl);
    setFormTitle(tpl.title);
    setFormCode(tpl.code);
    setFormCategory(tpl.category);
    setFormDescription(tpl.description);
    setFormApprover(tpl.requiredApproverRole);
    setFormVersion(tpl.version || '1.0');
    setFormProjectCode(tpl.projectCode || '');
  };

  const handleSaveTemplateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingTemplate) {
      // Edit Template
      const updatedList = templates.map((t) => {
        if (t.id === editingTemplate.id) {
          return {
            ...t,
            title: formTitle,
            code: formCode,
            category: formCategory,
            description: formDescription,
            requiredApproverRole: formApprover,
            projectName: projects.find((project) => project.code === formProjectCode)?.name,
            projectCode: formProjectCode || undefined,
            version: formVersion,
          };
        }
        return t;
      });
      const formData = new FormData();
      formData.append('title', formTitle);
      formData.append('templateCode', formCode);
      formData.append('category', formCategory);
      formData.append('description', formDescription);
      formData.append('requiredSignOff', formApprover);
      formData.append('requiredFields', String(editingTemplate.fields?.length || 2));
      formData.append('version', formVersion);
      if (formProjectCode) {
        formData.append('projectCode', formProjectCode);
        formData.append('projectName', projects.find((project) => project.code === formProjectCode)?.name || '');
      }
      const updated = await updateTemplateApi(editingTemplate.id, formData);
      if (!updated) {
        showToast('Failed to save template to the database.');
        return;
      }
      setTemplates((current) => current.map((template) => template.id === editingTemplate.id ? mapApiTemplate(updated) : template));
      setEditingTemplate(null);
      showToast(`✓ Template "${formTitle}" updated successfully!`);
    } else {
      // Create Template; the database generates the numeric ID.
      const templateCode = formCode || `EXEC-TPL-${Date.now()}`;
      const templateDescription = formDescription || 'Custom executive governance template created by PMO Admin.';
      const formData = new FormData();
      formData.append('title', formTitle);
      formData.append('templateCode', templateCode);
      formData.append('category', formCategory);
      formData.append('description', templateDescription);
      formData.append('requiredSignOff', formApprover);
      formData.append('requiredFields', '2');
      formData.append('version', formVersion || '1.0');
      if (formProjectCode) {
        formData.append('projectCode', formProjectCode);
        formData.append('projectName', projects.find((project) => project.code === formProjectCode)?.name || '');
      }
      const created = await createTemplateApi(formData);
      if (!created) {
        showToast('Failed to save template to the database.');
        return;
      }
      setTemplates((current) => [mapApiTemplate(created), ...current]);
      setIsCreatingNewTemplate(false);
      showToast(`✓ New Executive Action Template "${formTitle}" created!`);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;
    const deleted = await deleteTemplateApi(templateToDelete.id);
    if (!deleted) {
      showToast('Failed to delete template from the database.');
      return;
    }
    setTemplates((current) => current.filter((template) => template.id !== templateToDelete.id));
    showToast(`✓ Template "${templateToDelete.title}" deleted.`);
    setTemplateToDelete(null);
  };

  // ---- VERSION MANAGEMENT ----
  const handleOpenVersionModal = (tpl: ExecutiveTemplate) => {
    setVersioningTemplate(tpl);
    const currentVer = parseFloat(tpl.version || '1.0');
    setBumpVersionNumber((currentVer + 0.1).toFixed(1));
    setBumpChangeNotes('');
    setBumpFile(null);
  };

  const handleSaveVersionBump = (e: React.FormEvent) => {
    e.preventDefault();
    if (!versioningTemplate) return;

    const nextVerInt = (versioningTemplate.versions?.length || 1) + 1;

    const newVersionEntry = {
      id: `ver-${Date.now()}`,
      versionNumber: nextVerInt,
      fileUrl: bumpFile ? URL.createObjectURL(bumpFile) : versioningTemplate.fileUrl || '',
      uploadedBy: currentPersona?.name || 'PMO Admin',
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updatedList = templates.map((t) => {
      if (t.id === versioningTemplate.id) {
        return {
          ...t,
          version: bumpVersionNumber,
          fileName: bumpFile ? bumpFile.name : t.fileName,
          versions: [newVersionEntry, ...(t.versions || [])]
        };
      }
      return t;
    });

    setTemplates(updatedList);
    setVersioningTemplate(null);
    showToast(`✓ Version ${bumpVersionNumber} created for "${versioningTemplate.title}"`);
  };

  // ---- DOWNLOAD TEMPLATE ----
  const handleDownloadTemplate = (tpl: ExecutiveTemplate) => {
    const templateData = {
      templateName: tpl.title,
      code: tpl.code,
      version: tpl.version || '1.0',
      category: tpl.category,
      approverRole: tpl.requiredApproverRole,
      description: tpl.description,
      fields: tpl.fields,
      exportedAt: new Date().toLocaleString(),
      exportedBy: currentPersona?.name || 'PMO User'
    };

    const blob = new Blob([JSON.stringify(templateData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tpl.code}_${tpl.title.replace(/[^a-zA-Z0-9]/g, '_')}_v${tpl.version || '1.0'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`✓ Template document downloaded: ${tpl.title}`);
  };

  // ---- UPLOAD TEMPLATE FILE ----
  const handleSaveUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadingTemplate || !uploadedFile) return;

    const updatedList = templates.map((t) => {
      if (t.id === uploadingTemplate.id) {
        return {
          ...t,
          fileName: uploadedFile.name,
          fileUrl: URL.createObjectURL(uploadedFile)
        };
      }
      return t;
    });

    setTemplates(updatedList);
    setUploadingTemplate(null);
    setUploadedFile(null);
    showToast(`✓ Document "${uploadedFile.name}" attached to template!`);
  };

  // ---- EXECUTIVE REQUEST HANDLERS ----
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequestTemplateId) return showToast('Template is required');
    if (!newRequestApproverRole) return showToast('Approver role is required');

    setIsSubmittingRequest(true);
    try {
      const selectedTemplate = templates.find((t) => t.id === newRequestTemplateId);
      const selectedProject = projects.find((p) => p.code === newRequestProjectCode);
      const created = await createExecutiveRequestApi({
        templateId: newRequestTemplateId,
        templateTitle: selectedTemplate?.title || '',
        category: selectedTemplate?.category || 'Executive Charter',
        projectId: selectedProject?.id,
        projectCode: selectedProject?.code,
        projectName: selectedProject?.name,
        approverRole: newRequestApproverRole,
        fieldValues: newRequestFieldValues,
      });
      if (created && created.id) {
        setRequests((current) => [created, ...current]);
        showToast('✓ Executive request submitted for approval');
        setNewRequestTemplateId('');
        setNewRequestProjectCode('');
        setNewRequestApproverRole('Executive Sponsor');
        setNewRequestFieldValues({});
      } else {
        showToast('❌ Failed to submit executive request');
      }
    } catch (err: any) {
      showToast(`❌ ${err.message || 'Error submitting request'}`);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const refreshAuditLog = async () => {
    const apiAudit = await fetchExecutiveAuditLogApi();
    if (Array.isArray(apiAudit)) setAuditLogs(apiAudit);
  };

  const handleApproveRequest = async (id: string) => {
    try {
      const updated = await approveExecutiveRequestApi(id);
      if (updated && updated.id) {
        setRequests((current) => current.map((r) => (String(r.id) === String(id) ? updated : r)));
        showToast('✓ Request approved');
        await refreshAuditLog();
      }
    } catch (err: any) {
      showToast(`❌ ${err.message || 'Error approving request'}`);
    }
  };

  const handleRejectRequest = async (id: string) => {
    const reason = window.prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      const updated = await rejectExecutiveRequestApi(id, reason);
      if (updated && updated.id) {
        setRequests((current) => current.map((r) => (String(r.id) === String(id) ? updated : r)));
        showToast('✓ Request rejected');
        await refreshAuditLog();
      }
    } catch (err: any) {
      showToast(`❌ ${err.message || 'Error rejecting request'}`);
    }
  };

  // Filter templates
  const filteredTemplates = templates.filter((tpl) => {
    const matchesCategory = selectedCategoryFilter === 'ALL' || tpl.category === selectedCategoryFilter;
    const matchesSearch =
      tpl.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpl.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const pendingRequestsCount = requests.filter((r) => r.status === 'Pending').length;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#00174b] text-white px-4 py-3 rounded-lg shadow-xl font-bold text-xs flex items-center gap-2 border border-amber-400/50 animate-bounce">
          <span className="material-symbols-outlined text-[18px] text-amber-400">verified</span>
          {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <nav className="flex items-center gap-1 text-[#45464d] font-bold text-[11px] tracking-wider uppercase mb-1">
            <span>{currentPersona?.roleType === 'TEAM_MEMBER' ? 'TEMPLATES' : 'EXECUTIVE GOVERNANCE'}</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#00174b]">{currentPersona?.roleType === 'TEAM_MEMBER' ? 'ACTION TEMPLATES LIBRARY' : 'EXECUTIVE ACTION TEMPLATES &amp; APPROVALS'}</span>
          </nav>
          <h2 className="text-[26px] font-bold tracking-tight text-[#191c1e]">
            {currentPersona?.roleType === 'TEAM_MEMBER' ? 'Action Templates Library' : 'Executive Action Templates Engine'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentPersona?.roleType === 'TEAM_MEMBER'
              ? 'Download and use approved action templates relevant to your assigned tasks. Creation and management are restricted to administrators.'
              : 'Standardized templates with version control, document upload, and one-click download for Stage-Gate governance.'}
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {currentPersona?.roleType !== 'TEAM_MEMBER' && (
            <button
              onClick={handleOpenCreateModal}
              className="px-3.5 py-1.5 bg-[#00174b] hover:bg-indigo-950 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">post_add</span>
              <span>Create Action Template</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex flex-wrap items-center gap-1">
          {currentPersona?.roleType === 'TEAM_MEMBER' ? (
            <>
              <button
                onClick={() => setActiveSubTab('Library')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeSubTab === 'Library' ? 'bg-[#00174b] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">collections_bookmark</span>
                <span>Action Templates Library</span>
                <span className="bg-indigo-500/20 text-indigo-900 px-1.5 py-0.2 rounded-full font-mono text-[10px]">{templates.length}</span>
              </button>
            </>
          ) : (
            <>
              {[
                { key: 'Library', label: 'Action Templates Library', icon: 'collections_bookmark', badge: templates.length },
                { key: 'Requests', label: 'Pending Executive Queue', icon: 'pending_actions', badge: pendingRequestsCount },
                { key: 'Audit Log', label: 'Executive Audit Log', icon: 'verified', badge: auditLogs.length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveSubTab(tab.key as any)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeSubTab === tab.key
                      ? 'bg-[#00174b] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className="bg-indigo-500/20 text-indigo-900 px-1.5 py-0.2 rounded-full font-mono text-[10px]">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </>
          )}
        </div>

        <div className="relative w-64">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search templates..."
            className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-600"
          />
        </div>
      </div>

      {/* SUB-TAB 1: LIBRARY */}
      {activeSubTab === 'Library' && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold mr-1">Filter Category:</span>
            {['ALL', 'Executive Charter', 'Financial & Budget', 'Stage-Gate Governance', 'Security & Access', 'Architecture Exception'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  selectedCategoryFilter === cat
                    ? 'bg-[#00174b] text-white font-bold'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTemplates.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-4 flex flex-col justify-between hover:border-blue-300 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {tpl.code}
                      </span>
                      <span className="font-mono text-[10px] font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                        v{tpl.version || '1.0'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* EDIT / VERSION / DELETE actions disabled for Team Members */}
                      {currentPersona?.roleType !== 'TEAM_MEMBER' && (
                        <>
                          <button
                            onClick={() => handleOpenEditModal(tpl)}
                            className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-md transition-colors cursor-pointer"
                            title="Edit Template"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>

                          <button
                            onClick={() => setUploadingTemplate(tpl)}
                            className="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded-md transition-colors cursor-pointer"
                            title="Upload/Attach Template File"
                          >
                            <span className="material-symbols-outlined text-[16px]">upload_file</span>
                          </button>

                          <button
                            onClick={() => handleOpenVersionModal(tpl)}
                            className="text-amber-600 hover:bg-amber-50 p-1.5 rounded-md transition-colors cursor-pointer"
                            title="Create New Version"
                          >
                            <span className="material-symbols-outlined text-[16px]">published_with_changes</span>
                          </button>

                          <button
                            onClick={() => setTemplateToDelete(tpl)}
                            className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors cursor-pointer"
                            title="Delete Template"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-indigo-900 text-[20px]">{tpl.icon || 'description'}</span>
                      {tpl.title}
                      <span className="block text-[11px] font-bold text-blue-700 mt-1">Project: {tpl.projectName || 'All projects'}</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{tpl.description}</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-lg space-y-1.5 text-xs">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500 font-bold uppercase text-[9px]">Required Sign-off:</span>
                      <strong className="text-indigo-950 font-semibold">{tpl.requiredApproverRole}</strong>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500 font-bold uppercase text-[9px]">Input Fields:</span>
                      <strong className="text-slate-800 font-mono">{tpl.fields?.length || 2} Form Fields</strong>
                    </div>
                    {tpl.fileName && (
                      <div className="flex justify-between text-[11px] pt-1 border-t border-slate-200 text-emerald-800 font-medium">
                        <span className="text-[9px] uppercase font-bold text-slate-400">Attached File:</span>
                        <span className="truncate max-w-[160px] font-mono text-[10px]">{tpl.fileName}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setHistoryTemplate(tpl)}
                    className="text-[11px] font-bold text-indigo-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">history</span>
                    Versions ({tpl.versions?.length || 1})
                  </button>

                  {/* DOWNLOAD BUTTON */}
                  <button
                    onClick={() => handleDownloadTemplate(tpl)}
                    className="px-3 py-1.5 bg-[#00174b] hover:bg-indigo-950 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                    title="Download Template Schema / Document"
                  >
                    <span className="material-symbols-outlined text-[14px]">download</span>
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE / EDIT TEMPLATE MODAL */}
      {(isCreatingNewTemplate || editingTemplate) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white max-w-lg w-full p-6 rounded-xl border border-slate-300 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingTemplate ? `Edit Template: ${editingTemplate.title}` : 'Create Action Template'}
              </h3>
              <button
                onClick={() => {
                  setIsCreatingNewTemplate(false);
                  setEditingTemplate(null);
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTemplateForm} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Template Title *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Executive Charter & Capital Release"
                  className="w-full border p-2 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Project Name</label>
                <select
                  value={formProjectCode}
                  onChange={(e) => setFormProjectCode(e.target.value)}
                  className="w-full border p-2 rounded-lg text-xs font-medium"
                >
                  <option value="">All projects</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.code}>{project.name} ({project.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Template Code</label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full border p-2 rounded-lg text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Version Number</label>
                  <input
                    type="text"
                    value={formVersion}
                    onChange={(e) => setFormVersion(e.target.value)}
                    className="w-full border p-2 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full border p-2 rounded-lg text-xs font-medium"
                  >
                    <option value="Executive Charter">Executive Charter</option>
                    <option value="Financial & Budget">Financial &amp; Budget</option>
                    <option value="Stage-Gate Governance">Stage-Gate Governance</option>
                    <option value="Security & Access">Security &amp; Access</option>
                    <option value="Architecture Exception">Architecture Exception</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Required Approver</label>
                  <select
                    value={formApprover}
                    onChange={(e) => setFormApprover(e.target.value as any)}
                    className="w-full border p-2 rounded-lg text-xs font-medium"
                  >
                    <option value="Executive Sponsor">Executive Sponsor</option>
                    <option value="CFO / Financial Controller">CFO / Financial Controller</option>
                    <option value="CTO / Chief Architect">CTO / Chief Architect</option>
                    <option value="PMO Director">PMO Director</option>
                    <option value="Steering Committee">Steering Committee</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Explain governance rules and requirements for this template..."
                  className="w-full border p-2 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNewTemplate(false);
                    setEditingTemplate(null);
                  }}
                  className="px-4 py-2 border rounded-lg font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00174b] text-white font-bold rounded-lg uppercase tracking-wider hover:bg-indigo-950"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {templateToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white max-w-md w-full p-6 rounded-xl border border-slate-300 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center gap-3 text-red-700">
              <span className="material-symbols-outlined text-[32px]">warning</span>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Delete Action Template</h3>
                <p className="text-slate-500 text-[11px]">Confirmation Required</p>
              </div>
            </div>

            <p className="text-slate-700 leading-relaxed">
              Are you sure you want to permanently delete template <strong className="text-slate-900">{templateToDelete.title}</strong> ({templateToDelete.code})? All associated version history and schemas will be removed.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setTemplateToDelete(null)}
                className="px-4 py-2 border rounded-lg font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTemplate}
                className="px-4 py-2 bg-red-700 text-white font-bold rounded-lg uppercase tracking-wider hover:bg-red-800"
              >
                Delete Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW VERSION MODAL */}
      {versioningTemplate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white max-w-md w-full p-6 rounded-xl border border-slate-300 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Publish New Template Version</h3>
                <p className="text-slate-500 text-[11px]">{versioningTemplate.title}</p>
              </div>
              <button onClick={() => setVersioningTemplate(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSaveVersionBump} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">New Version Number *</label>
                <input
                  type="text"
                  required
                  value={bumpVersionNumber}
                  onChange={(e) => setBumpVersionNumber(e.target.value)}
                  placeholder="e.g. 1.1 or 2.0"
                  className="w-full border p-2 rounded-lg font-mono font-bold text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Version Change Notes</label>
                <textarea
                  rows={3}
                  value={bumpChangeNotes}
                  onChange={(e) => setBumpChangeNotes(e.target.value)}
                  placeholder="Describe what changed in this version..."
                  className="w-full border p-2 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Attach Updated File (Optional)</label>
                <input
                  type="file"
                  accept=".xlsx,.xls,.docx,.doc,.json,.pdf"
                  onChange={(e) => setBumpFile(e.target.files?.[0] || null)}
                  className="w-full border border-dashed p-2 rounded-lg bg-slate-50 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setVersioningTemplate(null)}
                  className="px-4 py-2 border rounded-lg font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00174b] text-white font-bold rounded-lg uppercase tracking-wider hover:bg-indigo-950"
                >
                  Publish Version
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VERSION HISTORY MODAL */}
      {historyTemplate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white max-w-md w-full p-6 rounded-xl border border-slate-300 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Version History</h3>
                <p className="text-slate-500 text-[11px]">{historyTemplate.title}</p>
              </div>
              <button onClick={() => setHistoryTemplate(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(historyTemplate.versions && historyTemplate.versions.length > 0) ? (
                historyTemplate.versions.map((v) => (
                  <div key={v.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="font-bold text-indigo-950 font-mono">Version {v.versionNumber}.0</span>
                      <p className="text-[10px] text-slate-500">By {v.uploadedBy || 'PMO Admin'} • {v.createdAt}</p>
                    </div>
                    <button
                      onClick={() => handleDownloadTemplate(historyTemplate)}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded font-bold text-[11px] flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[13px]">download</span>
                      Download
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-3 bg-slate-50 text-slate-500 text-center rounded-lg">
                  Current active version: v{historyTemplate.version || '1.0'}.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setHistoryTemplate(null)}
                className="px-4 py-2 bg-[#00174b] text-white font-bold rounded-lg uppercase"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD ATTACHMENT MODAL */}
      {uploadingTemplate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white max-w-md w-full p-6 rounded-xl border border-slate-300 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Upload Template Document</h3>
                <p className="text-slate-500 text-[11px]">{uploadingTemplate.title}</p>
              </div>
              <button onClick={() => setUploadingTemplate(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSaveUpload} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Select Document File (.xlsx, .docx, .json, .pdf)
                </label>
                <input
                  type="file"
                  required
                  accept=".xlsx,.xls,.docx,.doc,.json,.pdf"
                  onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                  className="w-full border border-dashed p-3 rounded-lg bg-slate-50 text-xs cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUploadingTemplate(null)}
                  className="px-4 py-2 border rounded-lg font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!uploadedFile}
                  className="px-5 py-2 bg-[#00174b] text-white font-bold rounded-lg uppercase tracking-wider hover:bg-indigo-950 disabled:opacity-50"
                >
                  Upload File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: PENDING EXECUTIVE QUEUE */}
      {activeSubTab === 'Requests' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
            <h3 className="font-black text-slate-900 text-lg mb-1">Submit Executive Template Request</h3>
            <p className="text-xs text-slate-500 mb-4">Request executive approval to use a governance template for a specific project or initiative.</p>
            <form onSubmit={handleSubmitRequest} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Template *</label>
                <select value={newRequestTemplateId} onChange={(e) => setNewRequestTemplateId(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-xs">
                  <option value="">Select template</option>
                  {templates.map((tpl) => <option key={tpl.id} value={tpl.id}>{tpl.title} ({tpl.code})</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Project</label>
                <select value={newRequestProjectCode} onChange={(e) => setNewRequestProjectCode(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-xs">
                  <option value="">All projects</option>
                  {projects.map((project) => <option key={project.id} value={project.code}>{project.name} ({project.code})</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Approver Role *</label>
                <select value={newRequestApproverRole} onChange={(e) => setNewRequestApproverRole(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-xs">
                  <option value="Executive Sponsor">Executive Sponsor</option>
                  <option value="CFO / Financial Controller">CFO / Financial Controller</option>
                  <option value="CTO / Chief Architect">CTO / Chief Architect</option>
                  <option value="PMO Director">PMO Director</option>
                  <option value="Steering Committee">Steering Committee</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <button type="submit" disabled={isSubmittingRequest} className="px-5 py-2 bg-[#00174b] text-white font-bold rounded-lg uppercase tracking-wider hover:bg-indigo-950 disabled:opacity-60">
                  {isSubmittingRequest ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-x-auto">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-black text-slate-900">Pending Executive Queue</h3>
              <p className="text-[11px] text-slate-500 mt-1">Template usage requests awaiting executive approval.</p>
            </div>
            {requests.filter((r) => r.status === 'Pending').length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">No pending executive requests.</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Template</th>
                    <th className="px-5 py-3">Project</th>
                    <th className="px-5 py-3">Requested By</th>
                    <th className="px-5 py-3">Requested</th>
                    <th className="px-5 py-3">Approver Role</th>
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.filter((r) => r.status === 'Pending').map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-bold text-slate-900">{req.templateTitle}</td>
                      <td className="px-5 py-3 text-slate-700">{req.projectName || req.projectCode || 'All projects'}</td>
                      <td className="px-5 py-3 text-slate-600">{req.requestedBy} <span className="text-[10px] text-slate-400">({req.requestedByRole})</span></td>
                      <td className="px-5 py-3 text-slate-500">{new Date(req.requestedDate).toLocaleDateString()}</td>
                      <td className="px-5 py-3 text-slate-600">{req.approverRole}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleApproveRequest(req.id)} className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded font-bold text-[11px]">Approve</button>
                          <button onClick={() => handleRejectRequest(req.id)} className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded font-bold text-[11px]">Reject</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: EXECUTIVE AUDIT LOG */}
      {activeSubTab === 'Audit Log' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-x-auto">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-black text-slate-900">Executive Audit Log</h3>
              <p className="text-[11px] text-slate-500 mt-1">Record of executive approvals, rejections, and governance actions.</p>
            </div>
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">No audit records yet.</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Template</th>
                    <th className="px-5 py-3">Project</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Decision By</th>
                    <th className="px-5 py-3">Decision Date</th>
                    <th className="px-5 py-3">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-bold text-slate-900">{req.templateTitle}</td>
                      <td className="px-5 py-3 text-slate-700">{req.projectName || req.projectCode || 'All projects'}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{req.approverName || '-'}</td>
                      <td className="px-5 py-3 text-slate-500">{req.decisionDate ? new Date(req.decisionDate).toLocaleDateString() : '-'}</td>
                      <td className="px-5 py-3 text-slate-600">{req.rejectionReason || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
