import React from 'react';
import { FileBarChart, Download, Users, CreditCard, CalendarCheck, FileSpreadsheet } from 'lucide-react';
import Button from '../../components/common/Button';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ReportsOverview = () => {
  const reports = [
    {
      title: 'Student Admissions & Master Roster',
      description: 'Complete student directory with B-Form, emergency contact, class & roll number',
      icon: Users,
      color: 'text-blue-600 bg-blue-50',
      downloadUrl: `${apiBase}/api/v1/reports/students/excel`
    },
    {
      title: 'Fee Collection & Outstanding Ledger',
      description: 'Comprehensive fee voucher status, payments, discounts and pending defaulter balances',
      icon: CreditCard,
      color: 'text-emerald-600 bg-emerald-50',
      downloadUrl: `${apiBase}/api/v1/reports/fees/excel`
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Reports & Data Exports</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate print-friendly reports and download structured Excel spreadsheets
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reports.map((rep, idx) => {
          const Icon = rep.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-3 rounded-xl ${rep.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{rep.title}</h3>
                    <span className="text-[11px] font-semibold text-slate-400">Microsoft Excel (.xlsx)</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">{rep.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <a
                  href={rep.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Excel Report</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReportsOverview;

