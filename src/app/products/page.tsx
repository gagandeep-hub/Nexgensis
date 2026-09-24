'use client';

import React, { useState, Suspense } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import Navbar from '@/components/layout/Navbar';
import ProductToolbar from '@/components/products/ProductToolbar';
import ProductTable from '@/components/products/ProductTable';
import ProductCardGrid from '@/components/products/ProductCardGrid';
import Pagination from '@/components/products/Pagination';
import ProductModal from '@/components/products/ProductModal';
import DeleteModal from '@/components/products/DeleteModal';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/types';

function DashboardContent() {
  const {
    products,
    total,
    loading,
    error,
    page,
    limit,
    q,
    category,
    sortBy,
    order,
    totalPages,
    setSearch,
    setCategory,
    setPage,
    setLimit,
    setSorting,
    clearFilters,
    retry,
  } = useProducts();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (product: Product) => {
    setDeletingProduct(product);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title & Breadcrumb */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Product Management
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage inventory, update catalog items, and track stock levels
            </p>
          </div>
        </div>

        {/* Toolbar: Search, Filters, Sorting, Add Button */}
        <ProductToolbar
          searchQuery={q}
          category={category}
          sortBy={sortBy}
          order={order}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
          onSortChange={setSorting}
          onOpenAddModal={handleOpenAdd}
          onClearFilters={clearFilters}
        />

        {/* Content View States */}
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={retry} />
        ) : products.length === 0 ? (
          <EmptyState
            title={q || category ? 'No matching products found' : 'No products available'}
            message={
              q || category
                ? `No products matched your criteria "${q || category}". Try resetting filters or using a broader term.`
                : 'There are currently no products in the catalog.'
            }
            onReset={q || category ? clearFilters : undefined}
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <ProductTable
              products={products}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />

            {/* Mobile Card Grid View */}
            <ProductCardGrid
              products={products}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />

            {/* Pagination Controls */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={total}
              pageSize={limit}
              onPageChange={setPage}
              onPageSizeChange={setLimit}
            />
          </>
        )}
      </main>

      {/* Add / Edit Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productToEdit={editingProduct}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={Boolean(deletingProduct)}
        product={deletingProduct}
        onClose={() => setDeletingProduct(null)}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<LoadingSkeleton />}>
        <DashboardContent />
      </Suspense>
    </AuthGuard>
  );
}
