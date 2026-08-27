import React, { useState } from 'react';
import { Project, RiskItem } from '../../types';

interface AIProjectViewProps {
  projects: Project[];
  risks: RiskItem[];
}

export const AIProjectView: React.FC<AIProjectViewProps> = ({ projects, risks }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);

  const handleGenerateCharter = () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setGeneratedResult(null);

    setTimeout(() => {
      setLoading(false);
      setGeneratedResult(`
### EXECUTIVE PROJECT CHARTER BLUEPRINT
**Project Title:** ${prompt}
**Strategic Pillar:** Digital Transformation & Enterprise Scalability
**Target Completion:** Q2 2027
**Recommended CAPEX Allocation:** $1,450,000

#### 1. Strategic Objectives
- Establish end-to-end telemetry and automated data pipelines across all operational business units.
- Reduce manual approval lead time by 40% using automated governance gate tracking.

#### 2. Risk Mitigation & Governance Profile
- **Primary Identified Risk:** Resource bottleneck in Core Engineering & Security compliance clearance.
- **Mitigation Strategy:** Pre-allocate 15% contingency hours from Infrastructure pool; schedule early ISO 27001 readiness review.

#### 3. Recommended Gate Pass Criteria
- Gate 1 (Charter Approval): Business case sign-off + Architecture Review Board endorsement.
- Gate 2 (Build Readiness): Security vulnerability assessment score < 2.0 CVSS.
      `);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <nav className="flex items-center gap-1 text-[#45464d] font-bold text-[11px] tracking-wider uppercase mb-1">
          <span>INTELLIGENCE</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-[#00174b]">AI PROJECT ADVISOR &amp; GENERATOR</span>
        </nav>
        <h2 className="text-[26px] font-bold tracking-tight text-[#191c1e] flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-500 text-[32px]">auto_awesome</span>
          AI Portfolio Intelligence &amp; Charter Synthesizer
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Leverage Gemini AI models to synthesize project charters, predict schedule slippage, and optimize resource allocation.
        </p>
      </div>

      {/* Interactive AI Generator Input */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-sm shadow-2xs space-y-4 text-xs">
        <h3 className="font-bold text-slate-900 text-sm">Synthesize Strategic Project Charter</h3>
        <p className="text-slate-600">
          Enter a high-level initiative description (e.g. "Cloud Data Lake Migration for Financial Auditing"), and the AI will build a complete PMO charter blueprint.
        </p>

        <div className="space-y-3">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Enterprise Microservices Architecture Modernization..."
            className="w-full border border-slate-300 rounded-sm p-3 outline-none focus:border-blue-600 font-sans"
          />

          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="font-bold text-slate-700">Quick Prompt Suggestions:</span>
              <button
                onClick={() => setPrompt('AI-Driven Customer Churn Analytics Platform')}
                className="bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-xs text-slate-700 font-medium"
              >
                Churn AI Platform
              </button>
              <button
                onClick={() => setPrompt('Zero-Trust Cybersecurity Framework Migration')}
                className="bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-xs text-slate-700 font-medium"
              >
                Zero-Trust Migration
              </button>
            </div>

            <button
              onClick={handleGenerateCharter}
              disabled={loading || !prompt.trim()}
              className="px-5 py-2.5 bg-[#00174b] disabled:bg-slate-300 text-white font-bold rounded-sm uppercase tracking-wider hover:bg-indigo-950 flex items-center gap-2 shadow-2xs"
            >
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              {loading ? 'Synthesizing...' : 'Generate AI Charter'}
            </button>
          </div>
        </div>
      </div>

      {/* Generated Result Output */}
      {generatedResult && (
        <div className="bg-slate-900 text-slate-100 p-6 rounded-sm border border-slate-800 shadow-xl space-y-4 text-xs font-mono leading-relaxed animate-fadeIn">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              Generated Project Charter
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(generatedResult)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xs text-[11px] flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">content_copy</span>
              Copy Text
            </button>
          </div>

          <div className="whitespace-pre-wrap text-slate-200">{generatedResult}</div>
        </div>
      )}

      {/* Portfolio Telemetry Snapshot */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
        <div className="bg-white p-4 border border-slate-200/80 rounded-sm">
          <h4 className="font-bold text-slate-900 text-xs mb-2">AI Health Summary</h4>
          <p className="text-xs text-slate-600">
            Portfolio currently contains <strong>{projects.length} projects</strong>. Risk density stands at{' '}
            <strong className="text-amber-600">{risks.length} open items</strong>. AI recommends prioritizing budget reallocation to Project Delta.
          </p>
        </div>

        <div className="bg-white p-4 border border-slate-200/80 rounded-sm">
          <h4 className="font-bold text-slate-900 text-xs mb-2">Recommended Actions</h4>
          <ul className="text-xs text-slate-600 list-disc list-inside space-y-1">
            <li>Approve CR-104 budget increase for Gate 2 readiness.</li>
            <li>Re-balance Engineering team capacity from 94% to 85%.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
