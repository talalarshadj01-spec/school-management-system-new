import React from 'react';

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <div className="space-y-3 p-1">
    {/* Header row */}
    <div className="flex gap-4 pb-2">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    {/* Data rows */}
    {Array.from({ length: rows }).map((_, rowIdx) => (
      <div key={rowIdx} className="flex gap-4 py-2 border-t border-slate-100">
        {Array.from({ length: cols }).map((_, colIdx) => (
          <Skeleton key={colIdx} className="h-5 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const CardSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    ))}
  </div>
);

export const ProfileSkeleton = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-xl p-6 border border-slate-200 flex items-center space-x-6">
      <Skeleton className="h-24 w-24 rounded-full shrink-0" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-2 mt-3">
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>
      </div>
    </div>
    <div className="bg-white rounded-xl p-6 border border-slate-200 space-y-4">
      <Skeleton className="h-5 w-32" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-36" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <CardSkeleton count={4} />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 space-y-3">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 4 }).map((_, j) => (
            <div key={j} className="flex items-center gap-3 py-2 border-t border-slate-100">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const FormSkeleton = ({ fields = 4 }) => (
  <div className="space-y-4">
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="space-y-1.5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    ))}
    <div className="flex gap-3 pt-2">
      <Skeleton className="h-10 w-28 rounded-lg" />
      <Skeleton className="h-10 w-20 rounded-lg" />
    </div>
  </div>
);

export const ListItemSkeleton = ({ count = 5 }) => (
  <div className="space-y-2">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    ))}
  </div>
);

export default Skeleton;

