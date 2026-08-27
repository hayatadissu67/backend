import React, { useState } from 'react';
import { ActivityItem } from '../types';

interface ActivityFeedProps {
  activities: ActivityItem[];
  onAddActivity?: (newAct: ActivityItem) => void;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  const [items, setItems] = useState<ActivityItem[]>(activities);
  const [hasLoadedMore, setHasLoadedMore] = useState(false);

  const handleLoadMore = () => {
    if (!hasLoadedMore) {
      setHasLoadedMore(true);
    }
  };

  const getBadgeIcon = (badgeType: ActivityItem['badgeType']) => {
    switch (badgeType) {
      case 'check':
        return (
          <div className="w-6 h-6 bg-white border border-[#00174b] rounded-full flex items-center justify-center z-10">
            <span className="material-symbols-filled text-[#00174b] text-[14px]">
              check_circle
            </span>
          </div>
        );
      case 'warning':
        return (
          <div className="w-6 h-6 bg-white border border-red-600 rounded-full flex items-center justify-center z-10">
            <span className="material-symbols-outlined text-red-600 text-[14px]">
              warning
            </span>
          </div>
        );
      case 'document':
        return (
          <div className="w-6 h-6 bg-white border border-slate-400 rounded-full flex items-center justify-center z-10">
            <span className="material-symbols-outlined text-slate-500 text-[14px]">
              description
            </span>
          </div>
        );
      case 'person':
        return (
          <div className="w-6 h-6 bg-white border border-[#00174b] rounded-full flex items-center justify-center z-10">
            <span className="material-symbols-outlined text-[#00174b] text-[14px]">
              person_add
            </span>
          </div>
        );
      case 'chat':
        return (
          <div className="w-6 h-6 bg-white border border-[#00174b] rounded-full flex items-center justify-center z-10">
            <span className="material-symbols-outlined text-[#00174b] text-[14px]">
              chat_bubble_outline
            </span>
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 bg-white border border-slate-400 rounded-full flex items-center justify-center z-10">
            <span className="material-symbols-outlined text-slate-500 text-[14px]">
              notifications
            </span>
          </div>
        );
    }
  };

  return (
    <section className="bg-white border border-slate-200/80 p-6 h-full flex flex-col justify-between">
      <div>
        <h3 className="text-[16px] font-semibold text-[#191c1e] uppercase tracking-wide mb-6">
          Recent Activity
        </h3>

        <div className="space-y-6 relative before:content-[''] before:absolute before:left-3 before:top-0 before:bottom-0 before:w-px before:bg-slate-200">
          {items.map((item) => (
            <div key={item.id} className="relative pl-8 group cursor-pointer">
              <div className="absolute left-0 top-1">
                {getBadgeIcon(item.badgeType)}
              </div>
              <p className="text-[13px] text-[#191c1e] font-bold leading-tight group-hover:text-blue-700 transition-colors">
                {item.title}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                {item.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleLoadMore}
        disabled={hasLoadedMore}
        className={`w-full mt-8 py-2 text-center font-bold text-[11px] tracking-wider uppercase border border-slate-200 transition-colors ${
          hasLoadedMore
            ? 'text-slate-400 bg-slate-50 cursor-not-allowed'
            : 'text-slate-600 hover:bg-slate-50 hover:text-black cursor-pointer'
        }`}
      >
        {hasLoadedMore ? 'ALL ACTIVITIES LOADED' : 'LOAD MORE ACTIVITY'}
      </button>
    </section>
  );
};
