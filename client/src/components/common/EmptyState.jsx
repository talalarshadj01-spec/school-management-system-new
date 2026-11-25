import React from 'react';
import { Inbox, RefreshCw, Users, FileText, CreditCard, BookOpen } from 'lucide-react';

const iconMap = {
  students: Users,
  teachers: Users,
  fees: CreditCard,
  reports: FileText,
  books: BookOpen,
  default: Inbox,
};

const EmptyState = ({
  icon: Icon,
  iconKey = 'default',
  title = 'No data found',
  description = 'There are no records to display.',
  action = null,
  onRetry = null,
  retryLabel = 'Retry',
}) => {
  const ResolvedIcon = Icon || iconMap[iconKey] || iconMap.default;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="p-4 bg-slate-100 rounded-full mb-4">
        <ResolvedIcon className="w-10 h-10 text-slate-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-700 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      <div className="flex items-center gap-3 flex-wrap justify-center">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {retryLabel}
          </button>
        )}
        {action}
      </div>
    </div>
  );
};

export default EmptyState;

