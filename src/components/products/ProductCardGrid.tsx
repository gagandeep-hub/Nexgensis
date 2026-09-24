'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { Star, Edit2, Trash2, ArrowRight } from 'lucide-react';

interface ProductCardGridProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export default function ProductCardGrid({ products, onEdit, onDelete }: ProductCardGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
      {products.map((product) => {
        const stockStatus =
          product.stock <= 0
            ? { label: 'Out of Stock', color: 'bg-red-50 text-red-700 border-red-200' }
            : product.stock < 10
            ? { label: `Low (${product.stock})`, color: 'bg-amber-50 text-amber-700 border-amber-200' }
            : { label: `${product.stock} in stock`, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };

        return (
          <div
            key={product.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
          >
            <div>
              {/* Image & Header */}
              <div className="relative aspect-video rounded-xl bg-slate-100 overflow-hidden mb-3 border border-slate-100">
                <img
                  src={product.thumbnail || (product.images && product.images[0]) || 'https://dummyjson.com/image/200x200?text=No+Image'}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute top-2 left-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/90 backdrop-blur-xs text-slate-800 border border-slate-200/50 shadow-xs capitalize">
                    {product.category}
                  </span>
                </div>
                {product.isLocal && (
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white uppercase tracking-wider shadow-xs">
                      New
                    </span>
                  </div>
                )}
              </div>

              {/* Title & Brand */}
              <div className="mb-2">
                <Link
                  href={`/products/${product.id}`}
                  className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1 block text-base"
                >
                  {product.title}
                </Link>
                {product.brand && (
                  <p className="text-xs text-slate-500 font-medium">{product.brand}</p>
                )}
              </div>

              {/* Price & Rating */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-slate-900">
                  ${product.price?.toFixed(2)}
                </span>
                <div className="flex items-center gap-1 text-slate-700 bg-amber-50/80 border border-amber-200/60 px-2 py-0.5 rounded-md">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-semibold">
                    {product.rating ? Number(product.rating).toFixed(1) : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Stock Status */}
              <div className="mb-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${stockStatus.color}`}
                >
                  {stockStatus.label}
                </span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <Link
                href={`/products/${product.id}`}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEdit(product)}
                  title="Edit product"
                  className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(product)}
                  title="Delete product"
                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
