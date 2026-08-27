import React, { useState } from 'react';
import { DiscussionItem } from '../../types';

interface CollaborationViewProps {
  discussions: DiscussionItem[];
  onAddDiscussion: (discussion: DiscussionItem) => void;
}

export const CollaborationView: React.FC<CollaborationViewProps> = ({
  discussions,
  onAddDiscussion
}) => {
  const [newContent, setNewContent] = useState('');
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [projectTag, setProjectTag] = useState('PRJ-DELTA');

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const item: DiscussionItem = {
      id: `d-${Date.now()}`,
      author: 'Executive Office',
      role: 'PMO Admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      content: newContent,
      timestamp: 'Just now',
      repliesCount: 0,
      projectTag
    };

    onAddDiscussion(item);
    setNewContent('');
  };

  const filteredDiscussions = discussions.filter(
    (d) => selectedTag === 'ALL' || d.projectTag === selectedTag
  );

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <nav className="flex items-center gap-1 text-[#45464d] font-bold text-[11px] tracking-wider uppercase mb-1">
          <span>STAKEHOLDER HUB</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-[#00174b]">PORTFOLIO COLLABORATION</span>
        </nav>
        <h2 className="text-[26px] font-bold tracking-tight text-[#191c1e]">
          Steering Discussions &amp; Cross-Team Bulletins
        </h2>
      </div>

      {/* New Post Box */}
      <form onSubmit={handlePost} className="bg-white border border-slate-200/80 p-4 rounded-sm shadow-2xs space-y-3">
        <div className="flex justify-between items-center">
          <label className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[18px]">chat</span>
            Post Executive Announcement or Update
          </label>
          <select
            value={projectTag}
            onChange={(e) => setProjectTag(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-sm px-2 py-1 text-xs font-mono font-bold"
          >
            <option value="PRJ-DELTA">PRJ-DELTA</option>
            <option value="PRJ-ALPHA">PRJ-ALPHA</option>
            <option value="PRJ-SIGMA">PRJ-SIGMA</option>
            <option value="PRJ-ERP">PRJ-ERP</option>
            <option value="PRJ-COMP">PRJ-COMP</option>
          </select>
        </div>

        <textarea
          rows={3}
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Share milestone achievements, blockages, or steering committee notes..."
          className="w-full border border-slate-200 rounded-sm p-3 text-xs outline-none focus:border-blue-600 focus:bg-slate-50/50"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 bg-[#00174b] text-white font-bold text-xs rounded-sm hover:bg-indigo-950 uppercase tracking-wider shadow-2xs"
          >
            Publish Bulletin
          </button>
        </div>
      </form>

      {/* Tag Filters */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
        <span>Filter Project:</span>
        {['ALL', 'PRJ-DELTA', 'PRJ-ALPHA', 'PRJ-SIGMA', 'PRJ-COMP'].map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1 rounded-xs font-mono text-[11px] ${
              selectedTag === tag ? 'bg-[#00174b] text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Discussions Feed */}
      <div className="space-y-4">
        {filteredDiscussions.map((item) => (
          <div key={item.id} className="bg-white border border-slate-200/80 p-5 rounded-sm shadow-2xs space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <img
                  src={item.avatar}
                  alt={item.author}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{item.author}</h4>
                  <p className="text-[10px] text-slate-500 font-medium">{item.role} • {item.timestamp}</p>
                </div>
              </div>

              <span className="font-mono text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded-xs">
                {item.projectTag}
              </span>
            </div>

            <p className="text-xs text-slate-800 leading-relaxed">{item.content}</p>

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-500">
              <span className="flex items-center gap-1 font-semibold hover:text-blue-600 cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">reply</span>
                {item.repliesCount} Responses
              </span>
              <span className="cursor-pointer hover:text-slate-800">Share Link</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
