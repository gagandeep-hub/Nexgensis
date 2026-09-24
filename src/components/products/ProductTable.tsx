'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { Star, Edit2, Trash2, ExternalLink } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export default function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  return (
    <div className="hidden md:block overflow-hidden bg-white rounded-2xl border border-slate-200/80 shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th scope="col" className="py-3.5 pl-6 pr-3">Product</th>
              <th scope="col" className="py-3.5 px-3">Category</th>
              <th scope="col" className="py-3.5 px-3">Price</th>
              <th scope="col" className="py-3.5 px-3">Rating</th>
              <th scope="col" className="py-3.5 px-3">Stock</th>
              <th scope="col" className="py-3.5 pl-3 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {products.map((product) => {
              const stockStatus =
                product.stock <= 0
                  ? { label: 'Out of Stock', color: 'bg-red-50 text-red-700 border-red-200' }
                  : product.stock < 10
                  ? { label: `Low (${product.stock})`, color: 'bg-amber-50 text-amber-700 border-amber-200' }
                  : { label: `${product.stock} in stock`, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };

              return (
                <tr
                  key={product.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Thumbnail & Title */}
                  <td className="py-4 pl-6 pr-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/60 overflow-hidden shrink-0 flex items-center justify-center">
                        <img
                          src={product.thumbnail || (product.images && product.images[0]) || 'https://dummyjson.com/image/100x100?text=No+Image'}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          loading="lazy"
                        />
                      </div>
                      <div className="min-w-0 max-w-xs">
                        <Link
                          href={`/products/${product.id}`}
                          className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors truncate block"
                          title={product.title}
                        >
                          {product.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          {product.brand && (
                            <span className="text-xs text-slate-500 font-medium truncate">
                              {product.brand}
                            </span>
                          )}
                          {product.isLocal && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                              New
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-4 px-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60 capitalize">
                      {product.category}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="py-4 px-3 font-semibold text-slate-900">
                    ${product.price?.toFixed(2)}
                  </td>

                  {/* Rating */}
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                      <span className="font-medium text-xs">
                        {product.rating ? Number(product.rating).toFixed(1) : 'N/A'}
                      </span>
                    </div>
                  </td>

                  {/* Stock */}
                  <td className="py-4 px-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${stockStatus.color}`}
                    >
                      {stockStatus.label}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 pl-3 pr-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/products/${product.id}`}
                        title="View details"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => onEdit(product)}
                        title="Edit product"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(product)}
                        title="Delete product"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
