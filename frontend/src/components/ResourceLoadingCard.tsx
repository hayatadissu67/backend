import React from 'react';
import { ResourceLoading } from '../types';

interface ResourceLoadingCardProps {
  resources: ResourceLoading[];
  onManageResources?: () => void;
}

export const ResourceLoadingCard: React.FC<ResourceLoadingCardProps> = ({
  resources,
  onManageResources
}) => {
  return (
    <section className="bg-white border border-slate-200/80 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[16px] font-semibold text-[#191c1e] uppercase tracking-wide">
          Resource Loading
        </h3>
        {onManageResources && (
          <button
            onClick={onManageResources}
            className="text-[11px] font-bold text-[#00174b] hover:underline uppercase"
          >
            Manage
          </button>
        )}
      </div>

      <div className="space-y-4">
        {resources.map((res) => {
          const isOverloaded = res.percentage >= 90;
          return (
            <div key={res.department}>
              <div className="flex justify-between mb-1.5 text-[11px] font-bold text-slate-600">
                <span className="tracking-wider">{res.department}</span>
                <span className={isOverloaded ? 'text-red-600 font-bold' : ''}>
                  {res.percentage}%
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isOverloaded ? 'bg-red-600' : 'bg-[#00174b]'
                  }`}
                  style={{ width: `${res.percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
