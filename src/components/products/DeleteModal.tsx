'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import { productService } from '@/services/product.service';
import { useProductContext } from '@/context/ProductContext';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onDeleted?: (id: number) => void;
}

export default function DeleteModal({
  isOpen,
  product,
  onClose,
  onDeleted,
}: DeleteModalProps) {
  const { markProductDeleted } = useProductContext();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const handleConfirmDelete = async () => {
    if (isDeleting) return; // Prevent multiple requests

    try {
      setIsDeleting(true);
      setError(null);

      // Call API (simulated on DummyJSON)
      await productService.deleteProduct(product.id);

      // Update local context to remove product across the application
      markProductDeleted(product.id);

      if (onDeleted) {
        onDeleted(product.id);
      }

      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 overflow-hidden">
        {/* Warning Icon */}
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        {/* Text */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Product</h3>
          <p className="text-sm text-slate-600">
            Are you sure you want to delete{' '}
            <strong className="text-slate-900">&ldquo;{product.title}&rdquo;</strong>?
          </p>
          <p className="text-xs text-slate-400 mt-2">
            This action cannot be reversed.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 px-4 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
