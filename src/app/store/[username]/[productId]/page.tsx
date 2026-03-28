"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, ExternalLink, Shield, Zap } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";

export default function PublicProductPage({ params }: { params: { username: string; productId: string } }) {
  const [product, setProduct] = useState<any>(null);
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/store/${params.username}`);
        if (!res.ok) return;
        const data = await res.json();
        setStore(data.store);
        const found = data.products.find((p: any) => p.id === params.productId);
        setProduct(found);
      } catch {
        // noop
      } finally {
        setLoading(false);
      }
    }
    fetchData();

    // Track view
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: params.username, productId: params.productId, type: "view" }),
    }).catch(() => {});
  }, [params.username, params.productId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  if (!product) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <h1 className="text-2xl font-bold">Product Not Found</h1>
      <Link href={`/store/${params.username}`} className="text-indigo-600 hover:underline">Back to store</Link>
    </div>
  );

  const handleBuy = async () => {
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: params.username, productId: params.productId, type: "click" }),
    }).catch(() => {});
    window.open(product.affiliateLink, "_blank");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href={`/store/${params.username}`} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to {store?.storeName || "store"}
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
            {product.imageURL ? (
              <img src={product.imageURL} alt={product.name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <ShoppingBag className="w-20 h-20 text-slate-300" />
            )}
          </div>

          <div>
            <Badge variant="default" className="mb-2">{product.category}</Badge>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">{product.description}</p>
            <p className="text-4xl font-extrabold mb-6">{formatCurrency(product.sellingPrice)}</p>

            <button
              onClick={handleBuy}
              className="w-full py-4 rounded-xl text-white text-lg font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
              style={{ backgroundColor: store?.accentColor || "#4f46e5" }}
            >
              Buy Now <ExternalLink className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mt-4 text-sm text-slate-500">
              <Shield className="w-4 h-4" /> Secure checkout via affiliate partner
            </div>
          </div>
        </div>

        <div className="mt-12 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-500">
          <p><strong>Affiliate Disclosure:</strong> This page contains affiliate links. When you click &quot;Buy Now,&quot; you will be redirected to the product on our affiliate partner&apos;s website. We may earn a commission at no extra cost to you.</p>
        </div>
      </div>

      <footer className="text-center py-6 border-t border-slate-200 dark:border-slate-800">
        <Link href="/" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition">
          Powered by <Zap className="w-3 h-3" /> AffiliFlow AI
        </Link>
      </footer>
    </div>
  );
}
