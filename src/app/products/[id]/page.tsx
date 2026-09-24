import React from 'react';
import ProductDetailClient from '@/components/products/ProductDetailClient';

export async function generateStaticParams() {
  // Pre-render product IDs 1 through 200 for static export
  return Array.from({ length: 200 }, (_, i) => ({
    id: (i + 1).toString(),
  }));
}

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const resolvedParams = await params;
  return <ProductDetailClient productId={resolvedParams.id} />;
}
