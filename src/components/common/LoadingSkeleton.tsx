import React from 'react';

export default function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Table header placeholder */}
      <div className="h-12 bg-slate-200 rounded-xl" />

      {/* Rows */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-16 bg-white rounded-xl border border-slate-100 flex items-center px-6 gap-6 shadow-xs"
        >
          <div className="w-12 h-12 bg-slate-200 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded-sm w-1/3" />
            <div className="h-3 bg-slate-100 rounded-sm w-1/4" />
          </div>
          <div className="h-4 bg-slate-200 rounded-sm w-20 hidden md:block" />
          <div className="h-4 bg-slate-200 rounded-sm w-16" />
          <div className="h-4 bg-slate-200 rounded-sm w-16 hidden sm:block" />
          <div className="w-24 h-8 bg-slate-200 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
