'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, Filter, ArrowUpDown, Plus, Sparkles } from 'lucide-react';
import { CategoryItem, SortField, SortOrder } from '@/types';
import { productService } from '@/services/product.service';
import { useDebounce } from '@/hooks/useDebounce';

interface ProductToolbarProps {
  searchQuery: string;
  category: string;
  sortBy: SortField;
  order: SortOrder;
  onSearchChange: (q: string) => void;
  onCategoryChange: (cat: string) => void;
  onSortChange: (sortBy: SortField, order: SortOrder) => void;
  onOpenAddModal: () => void;
  onClearFilters: () => void;
}

export default function ProductToolbar({
  searchQuery,
  category,
  sortBy,
  order,
  onSearchChange,
  onCategoryChange,
  onSortChange,
  onOpenAddModal,
  onClearFilters,
}: ProductToolbarProps) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debouncedSearch = useDebounce(localSearch, 350);

  // Sync prop changes into local input (e.g. on URL navigation/clear)
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // When debounced value changes and differs from URL param, propagate
  useEffect(() => {
    if (debouncedSearch !== searchQuery) {
      onSearchChange(debouncedSearch);
    }
  }, [debouncedSearch, searchQuery, onSearchChange]);

  // Load category list once
  useEffect(() => {
    let mounted = true;
    productService
      .getCategories()
      .then((cats) => {
        if (mounted) setCategories(cats);
      })
      .catch((err) => {
        console.error('Failed to load categories:', err);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleSortSelect = (val: string) => {
    if (!val || val === 'default') {
      onSortChange('id', 'asc');
      return;
    }
    const [field, sortOrder] = val.split('-') as [SortField, SortOrder];
    onSortChange(field, sortOrder);
  };

  const currentSortValue = sortBy === 'id' ? 'default' : `${sortBy}-${order}`;
  const hasActiveFilters = Boolean(searchQuery || category || (sortBy && sortBy !== 'id'));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs mb-6 space-y-4">
      {/* Top row: Search and Add Button */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search input with debounce */}
        <div className="relative flex-1 max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search products by title, brand, or description..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
          {localSearch && (
            <button
              onClick={() => {
                setLocalSearch('');
                onSearchChange('');
              }}
              title="Clear search"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Primary Add Product Action */}
        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs shadow-indigo-100 transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Bottom row: Filters and Sorting controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="py-2 pl-3 pr-8 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={currentSortValue}
              onChange={(e) => handleSortSelect(e.target.value)}
              className="py-2 pl-3 pr-8 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="default">Sort by: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Rating: High to Low</option>
              <option value="title-asc">Title: A to Z</option>
              <option value="title-desc">Title: Z to A</option>
            </select>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer py-1.5 px-2 hover:bg-slate-100 rounded-lg"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Simultaneous Search & Category Banner note */}
        {category && searchQuery && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-xs text-amber-800 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Searching inside &ldquo;{category}&rdquo;</span>
          </div>
        )}
      </div>
    </div>
  );
}
