import React, { useState } from 'react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  insights?: string[];
  timestamp: string;
}

export const AIAssistantModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: 'Hello, I am your Strategic PMO AI Assistant. I can analyze risk metrics, draft executive gate summaries, or recommend resource reallocations.',
      timestamp: 'Just now'
    }
  ]);

  const presetChips = [
    'Summarize Critical Risks',
    'Draft Steering Committee Update',
    'Resource Loading Optimization',
    'Project Delta Mitigation Plan'
  ];

  const handleSend = async (queryText?: string) => {
    const prompt = queryText || input;
    if (!prompt.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    setTimeout(() => {
      let replyText = '';
      let insightsList: string[] = [];

      const lower = prompt.toLowerCase();
      if (lower.includes('risk') || lower.includes('summarize')) {
        replyText = `### Strategic Risk Assessment\n\n- **Active Portfolio Risk Score**: 82% Health Index\n- **Critical Risk (R-2041)**: Budget overrun on Project Delta ($1.45M baseline vs $1.68M projected).\n- **Resource Bottleneck (R-1982)**: Engineering lead capacity running at 94% across 5 active stage-gate initiatives.`;
        insightsList = [
          'Reallocate 15% engineering capacity from Project Gamma to Delta',
          'Schedule Gate 3 audit review with Steering Committee',
          'Approve Change Request CR-104 for additional infrastructure funding'
        ];
      } else if (lower.includes('committee') || lower.includes('update') || lower.includes('draft')) {
        replyText = `### Executive Steering Committee Briefing\n\n- **Gate Sign-offs**: 4 projects approved for Gate 2 rollout this quarter.\n- **Capital Allocation**: Total budget utilization at 68% ($14.2M of $21.0M pool).\n- **Compliance & Governance**: 100% audit compliance recorded across all Stage-Gate reviews.`;
        insightsList = [
          'Present Project Delta budget variance at Friday PMO session',
          'Finalize credential access approvals for 3 pending team members',
          'Review resource load threshold for Q3 onboarding'
        ];
      } else if (lower.includes('resource') || lower.includes('capacity') || lower.includes('loading')) {
        replyText = `### Resource Capacity & Loading Analysis\n\n- **Engineering**: 94% Capacity (Overloaded)\n- **Product Management**: 82% Capacity (Optimal)\n- **UX / UI Design**: 68% Capacity (Available)\n- **Quality Assurance**: 88% Capacity (Near Threshold)`;
        insightsList = [
          'Shift 2 UX Designers to assist with Frontend Gate 2 deliverables',
          'Hire or assign contract support for Engineering backend team',
          'Cap maximum active project assignments to 3 per lead engineer'
        ];
      } else {
        replyText = `### PMO Strategic Advisor Analysis\n\nRegarding **"${prompt}"**:\n\n- **Portfolio Impact**: Direct alignment with Enterprise Digital Modernization goals.\n- **Recommended Next Step**: Review Stage-Gate criteria in the Projects Hub and verify team clearance levels.`;
        insightsList = [
          'Perform Gate 1 Charter verification in Projects Hub',
          'Confirm budget line item with Finance Admin',
          'Assign designated Project Lead in Team Members view'
        ];
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        insights: insightsList,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
      setLoading(false);
    }, 600);
  };

  return (
    <>
      {/* Floating AI Assistant Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#191c1e] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all group z-50 border border-slate-700"
        title="Ask PMO AI Assistant"
      >
        <span className="material-symbols-outlined text-[28px] group-hover:rotate-12 transition-transform">
          auto_awesome
        </span>
        <div className="absolute right-full mr-4 bg-white px-4 py-2 rounded-sm border border-slate-200 shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
          <p className="text-[13px] font-bold text-[#191c1e]">Ask PMO AI Assistant</p>
        </div>
      </button>

      {/* Slide-over / Popup Drawer */}
      {isOpen && (
        <div className="fixed bottom-24 right-8 w-[420px] max-w-[calc(100vw-2rem)] h-[560px] bg-white border border-slate-300 rounded-md shadow-2xl z-50 flex flex-col overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="bg-[#131b2e] text-white p-4 flex justify-between items-center border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-400 text-[20px]">
                auto_awesome
              </span>
              <div>
                <h3 className="font-bold text-[14px] leading-tight">PMO AI Assistant</h3>
                <p className="text-[10px] text-slate-400">Gemini Strategic Portfolio Intelligence</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Quick Preset Chips */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex gap-2 overflow-x-auto custom-scroll">
            {presetChips.map((chip) => (
              <button
                key={chip}
                onClick={() => handleSend(chip)}
                className="whitespace-nowrap text-[11px] font-medium bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-800 border border-slate-200 px-2.5 py-1 rounded-full transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto custom-scroll space-y-4 bg-slate-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-md text-[13px] leading-relaxed shadow-2xs ${
                    m.sender === 'user'
                      ? 'bg-[#00174b] text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  {m.insights && (
                    <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                      <p className="text-[11px] font-bold text-blue-900 uppercase">Recommended Actions:</p>
                      {m.insights.map((ins, idx) => (
                        <p key={idx} className="text-[11px] text-slate-700">
                          • {ins}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-500 text-xs p-2">
                <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                Analyzing portfolio telemetry...
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask PMO AI about risks, gates, budgets..."
              className="flex-1 text-[13px] border border-slate-200 rounded-sm px-3 py-2 outline-none focus:border-blue-600 bg-white"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="bg-[#00174b] hover:bg-indigo-900 disabled:opacity-50 text-white px-3 py-2 rounded-sm text-xs font-bold transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
