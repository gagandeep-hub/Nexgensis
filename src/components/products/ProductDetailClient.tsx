'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import Navbar from '@/components/layout/Navbar';
import { Product } from '@/types';
import { productService } from '@/services/product.service';
import { useProductContext } from '@/context/ProductContext';
import {
  ArrowLeft,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Loader2,
  AlertCircle,
  Calendar,
} from 'lucide-react';

interface ProductDetailClientProps {
  productId: string;
}

export default function ProductDetailClient({ productId }: ProductDetailClientProps) {
  const router = useRouter();

  const { getLocalProductOverride, isDeletedLocally } = useProductContext();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const idNum = parseInt(productId, 10);

    // If ID is completely invalid or was deleted by the user locally
    if (isNaN(idNum) || isDeletedLocally(idNum)) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    // Check if it's a locally added product
    const localProduct = getLocalProductOverride(idNum) as Product | null;
    if (localProduct && localProduct.isLocal) {
      setProduct(localProduct);
      setSelectedImage(
        localProduct.images?.[0] || localProduct.thumbnail || 'https://dummyjson.com/image/400x400?text=No+Image'
      );
      setLoading(false);
      return;
    }

    // Otherwise fetch from DummyJSON API
    let isCancelled = false;
    const controller = new AbortController();

    setLoading(true);
    setNotFound(false);
    setErrorMessage(null);

    productService
      .getProductById(productId, controller.signal)
      .then((data) => {
        if (isCancelled) return;

        // Apply any local edits
        const override = getLocalProductOverride(idNum);
        const finalProduct = override ? { ...data, ...override } : data;

        setProduct(finalProduct);
        setSelectedImage(
          finalProduct.images?.[0] || finalProduct.thumbnail || 'https://dummyjson.com/image/400x400?text=No+Image'
        );
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (isCancelled) return;
        // Check for 404 / not found
        const message = err instanceof Error ? err.message : '';
        if (
          message.toLowerCase().includes('not found') ||
          message.toLowerCase().includes('404') ||
          (err as { response?: { status?: number } })?.response?.status === 404
        ) {
          setNotFound(true);
        } else {
          setErrorMessage(message || 'Failed to load product details');
        }
        setLoading(false);
      });

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [productId, getLocalProductOverride, isDeletedLocally]);

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Navigation */}
          <div className="mb-6">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Products</span>
            </Link>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
              <p className="text-sm font-medium text-slate-500">Loading product information...</p>
            </div>
          )}

          {/* Not Found 404 State */}
          {!loading && notFound && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center max-w-xl mx-auto shadow-xs">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Product Not Found</h2>
              <p className="text-slate-600 text-sm mb-6">
                The product with ID <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700 font-mono">{productId}</code> could not be found or does not exist.
              </p>
              <button
                onClick={() => router.push('/products')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Products Catalog</span>
              </button>
            </div>
          )}

          {/* Error State */}
          {!loading && !notFound && errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-xl mx-auto">
              <p className="text-red-700 font-medium mb-4">{errorMessage}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* Product Details Content */}
          {!loading && !notFound && product && (
            <div className="space-y-8">
              {/* Product Hero: Images & Key Specs */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  {/* Left: Image Gallery */}
                  <div className="space-y-4">
                    {/* Main Image */}
                    <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center">
                      <img
                        src={selectedImage}
                        alt={product.title}
                        className="w-full h-full object-contain p-4"
                      />
                    </div>

                    {/* Image Thumbnails Carousel */}
                    {product.images && product.images.length > 1 && (
                      <div className="flex gap-2.5 overflow-x-auto pb-2">
                        {product.images.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImage(img)}
                            className={`w-20 h-20 rounded-xl border-2 overflow-hidden shrink-0 transition-all cursor-pointer bg-slate-50 ${
                              selectedImage === img
                                ? 'border-indigo-600 ring-2 ring-indigo-100'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <img
                              src={img}
                              alt={`${product.title} thumbnail ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: Product Details & Buying Info */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full capitalize border border-slate-200">
                        {product.category}
                      </span>
                      {product.brand && (
                        <span className="text-xs font-semibold text-slate-500">
                          Brand: <strong className="text-slate-700">{product.brand}</strong>
                        </span>
                      )}
                      {product.isLocal && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white uppercase tracking-wider">
                          Locally Added
                        </span>
                      )}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      {product.title}
                    </h1>

                    {/* Price & Rating */}
                    <div className="flex items-center gap-4 py-2 border-y border-slate-100">
                      <div className="text-3xl font-bold text-slate-900">
                        ${product.price?.toFixed(2)}
                      </div>
                      {product.discountPercentage && (
                        <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          {product.discountPercentage}% OFF
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 ml-auto bg-amber-50 border border-amber-200/60 px-3 py-1 rounded-xl">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-bold text-slate-800">
                          {product.rating ? Number(product.rating).toFixed(1) : 'N/A'}
                        </span>
                        <span className="text-xs text-slate-500">
                          ({product.reviews?.length || 0} reviews)
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                        Description
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                        {product.description || 'No description provided.'}
                      </p>
                    </div>

                    {/* Specifications Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs text-slate-500 block">Stock Status</span>
                        <span className="text-sm font-semibold text-slate-800">
                          {product.stock > 0 ? `${product.stock} units` : 'Out of Stock'}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs text-slate-500 block">SKU</span>
                        <span className="text-sm font-semibold text-slate-800">
                          {product.sku || 'N/A'}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs text-slate-500 block">Weight</span>
                        <span className="text-sm font-semibold text-slate-800">
                          {product.weight ? `${product.weight}g` : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Value propositions */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>{product.shippingInformation || 'Standard Shipping'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>{product.warrantyInformation || '1 Year Warranty'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <RotateCcw className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>{product.returnPolicy || '30-Day Return'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-slate-900">Customer Reviews</h2>
                  <span className="text-xs font-medium text-slate-500">
                    Total {product.reviews?.length || 0} reviews
                  </span>
                </div>

                {!product.reviews || product.reviews.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    No customer reviews available for this product yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.reviews.map((rev, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-slate-800">
                            {rev.reviewerName}
                          </span>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < rev.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed italic">
                          &ldquo;{rev.comment}&rdquo;
                        </p>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(rev.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
