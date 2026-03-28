"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Store, ShoppingBag, ExternalLink, Zap } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

interface StoreProduct {
  id: string;
  name: string;
  description: string;
  sellingPrice: number;
  imageURL: string;
  category: string;
  affiliateLink: string;
}

interface StoreData {
  username: string;
  displayName: string;
  storeName: string;
  bio: string;
  accentColor: string;
}

export default function PublicStorePage({ params }: { params: { username: string } }) {
  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStore() {
      try {
        const res = await fetch(`/api/store/${params.username}`);
        if (!res.ok) throw new Error("Store not found");
        const data = await res.json();
        setStore(data.store);
        setProducts(data.products);
      } catch {
        setError("Store not found");
      } finally {
        setLoading(false);
      }
    }
    fetchStore();
  }, [params.username]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <Store className="w-16 h-16 text-slate-300" />
      <h1 className="text-2xl font-bold">Store Not Found</h1>
      <p className="text-slate-500">The store you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/" className="text-indigo-600 hover:underline">Go to homepage</Link>
    </div>
  );

  const trackAndRedirect = async (productId: string, affiliateLink: string) => {
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: params.username, productId, type: "click" }),
    }).catch(() => {});
    window.open(affiliateLink, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Store Header */}
      <div className="text-white py-12 px-4" style={{ background: `linear-gradient(135deg, ${store?.accentColor || "#4f46e5"}, #7c3aed)` }}>
        <div className="max-w-5xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mx-auto mb-4 flex items-center justify-center">
            <Store className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">{store?.storeName || store?.displayName}</h1>
          {store?.bio && <p className="text-white/80 max-w-md mx-auto">{store.bio}</p>}
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-sm text-slate-500 mb-6">{products.length} products available</p>
        {products.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No products available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="h-48 bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  {product.imageURL ? (
                    <img src={product.imageURL} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingBag className="w-12 h-12 text-slate-300" />
                  )}
                </div>
                <div className="p-4">
                  <span className="text-xs text-slate-500">{product.category}</span>
                  <h3 className="font-semibold mt-1 group-hover:text-indigo-600 transition">{product.name}</h3>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xl font-bold">{formatCurrency(product.sellingPrice)}</span>
                    <button
                      onClick={() => trackAndRedirect(product.id, product.affiliateLink)}
                      className="px-4 py-2 rounded-xl text-white text-sm font-medium hover:opacity-90 transition flex items-center gap-1"
                      style={{ backgroundColor: store?.accentColor || "#4f46e5" }}
                    >
                      Buy Now <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Affiliate Disclosure */}
      <div className="max-w-5xl mx-auto px-4 pb-4">
        <p className="text-xs text-slate-400 text-center border-t border-slate-200 dark:border-slate-700 pt-4">
          This page contains affiliate links. We may earn a commission at no extra cost to you when you purchase through these links.
        </p>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 border-t border-slate-200 dark:border-slate-800">
        <Link href="/" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition">
          Powered by <Zap className="w-3 h-3" /> AffiliFlow AI
        </Link>
      </footer>
    </div>
  );
}
