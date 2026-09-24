import React from 'react';
import { PackageSearch } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  onReset?: () => void;
}

export default function EmptyState({
  title = 'No products found',
  message = 'Try adjusting your search query or category filters to find what you are looking for.',
  onReset,
}: EmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs my-6">
      <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <PackageSearch className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">{message}</p>
      {onReset && (
        <button
          onClick={onReset}
          className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium rounded-xl transition-colors cursor-pointer"
        >
          Reset All Filters
        </button>
      )}
    </div>
  );
}
