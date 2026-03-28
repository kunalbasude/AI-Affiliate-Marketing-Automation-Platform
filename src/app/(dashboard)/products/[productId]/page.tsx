"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, Save, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { CATEGORIES } from "@/types";
import { formatCurrency, calculateSellingPrice } from "@/lib/utils";

export default function EditProductPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "Wireless Earbuds Pro", description: "Premium wireless earbuds with noise cancellation and 24-hour battery life.",
    category: "Electronics", originalPrice: 999, marginPercent: 30,
    affiliateLink: "https://meesho.com/earbuds-pro", imageURL: "", sourcePlatform: "Meesho",
    commissionRate: 12, tags: "electronics, earbuds, wireless", isPublished: true,
  });
  const [loading, setLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const sellingPrice = calculateSellingPrice(form.originalPrice, form.marginPercent);
  const update = (field: string, value: string | number | boolean) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast("Product updated successfully!", "success");
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Link href="/products" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Edit Product</h1>
          <div className="flex gap-2">
            <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)}>
              <Trash2 className="w-4 h-4" /> Delete
            </Button>
            <Button loading={loading} onClick={handleSave}>
              <Save className="w-4 h-4" /> Save Changes
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Product Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Product Name" value={form.name} onChange={(e) => update("name", e.target.value)} />
            <Textarea label="Description" value={form.description} onChange={(e) => update("description", e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Category" options={CATEGORIES.map((c) => ({ value: c, label: c }))} value={form.category} onChange={(e) => update("category", e.target.value)} />
              <Input label="Commission Rate (%)" type="number" value={form.commissionRate} onChange={(e) => update("commissionRate", Number(e.target.value))} />
            </div>
            <Input label="Affiliate Link" type="url" value={form.affiliateLink} onChange={(e) => update("affiliateLink", e.target.value)} />
            <a href={form.affiliateLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
              Open affiliate link <ExternalLink className="w-3 h-3" />
            </a>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="published" checked={form.isPublished} onChange={(e) => update("isPublished", e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              <label htmlFor="published" className="text-sm font-medium">Published to store</label>
            </div>
          </CardContent>
        </Card>

        <Card className="sticky top-24 h-fit">
          <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Base Price (₹)" type="number" value={form.originalPrice} onChange={(e) => update("originalPrice", Number(e.target.value))} />
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Margin: {form.marginPercent}%</label>
              <input type="range" min={0} max={200} value={form.marginPercent} onChange={(e) => update("marginPercent", Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 dark:bg-slate-700 accent-indigo-600" />
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-slate-500">Base</span><span>{formatCurrency(form.originalPrice)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Margin</span><span className="text-green-600">+{formatCurrency(sellingPrice - form.originalPrice)}</span></div>
              <hr className="border-slate-200 dark:border-slate-600" />
              <div className="flex justify-between font-bold"><span>Selling</span><span className="text-lg">{formatCurrency(sellingPrice)}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDelete(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2">Delete Product?</h3>
            <p className="text-sm text-slate-500 mb-4">This action cannot be undone. The product will be removed from your store.</p>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setShowDelete(false)}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={() => { toast("Product deleted", "success"); setShowDelete(false); }}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
