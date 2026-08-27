import React from 'react';

export const DocumentsView: React.FC = () => {
  const docs = [
    { id: 'd1', title: 'Q3 Portfolio Strategic Financial Report.pdf', type: 'PDF Report', size: '4.2 MB', date: '2026-07-20', author: 'Sarah Jenkins' },
    { id: 'd2', title: 'Enterprise PMO Gate 3 Review Charter.docx', type: 'Word Document', size: '1.8 MB', date: '2026-07-15', author: 'PMO Governance' },
    { id: 'd3', title: 'Project Delta Cost Overrun Variance Analysis.xlsx', type: 'Spreadsheet', size: '2.5 MB', date: '2026-07-22', author: 'M. Thompson' },
    { id: 'd4', title: 'Data Migration API Architecture Master Diagram.pdf', type: 'Architecture Diagram', size: '8.1 MB', date: '2026-07-10', author: 'S. Gupta' },
    { id: 'd5', title: 'ISO 27001 Cybersecurity Audit Checklist.pdf', type: 'Audit Document', size: '3.0 MB', date: '2026-07-08', author: 'J. Baker' },
  ];

  const handleDownload = (filename: string) => {
    alert(`Downloading strategic document: ${filename}`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-[24px] font-bold text-[#191c1e]">Portfolio Document Repository</h2>
        <p className="text-xs text-slate-500">Central repository for project charters, audit reviews, architectural diagrams, and financial reports.</p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-sm overflow-x-auto shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#f2f4f6] text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200/80">
              <th className="px-6 py-3">Document Title</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Size</th>
              <th className="px-6 py-3">Uploaded Date</th>
              <th className="px-6 py-3">Author</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60 font-sans">
            {docs.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-[#191c1e] flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-[18px]">description</span>
                  {d.title}
                </td>
                <td className="px-6 py-4 text-slate-600">{d.type}</td>
                <td className="px-6 py-4 font-mono text-slate-500">{d.size}</td>
                <td className="px-6 py-4 text-slate-600">{d.date}</td>
                <td className="px-6 py-4 text-slate-700 font-medium">{d.author}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDownload(d.title)}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] rounded-xs uppercase tracking-wider flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">download</span>
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
