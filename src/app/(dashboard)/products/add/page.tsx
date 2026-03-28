"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { CATEGORIES } from "@/types";
import { formatCurrency, calculateSellingPrice } from "@/lib/utils";

export default function AddProductPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "", description: "", category: "", originalPrice: 0, marginPercent: 20,
    affiliateLink: "", imageURL: "", sourcePlatform: "Meesho", commissionRate: 0, tags: "", isPublished: true,
  });
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const sellingPrice = calculateSellingPrice(form.originalPrice, form.marginPercent);
  const profit = sellingPrice - form.originalPrice;

  const update = (field: string, value: string | number | boolean) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // API call would go here
      await new Promise((r) => setTimeout(r, 1000));
      toast("Product added successfully!", "success");
    } catch {
      toast("Failed to add product", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Link href="/products" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
        <h1 className="text-2xl font-bold">Add Product</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Add a new affiliate product to your catalog</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Product Details</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Product Name" placeholder="e.g., Wireless Earbuds Pro" value={form.name} onChange={(e) => update("name", e.target.value)} required />
                <Textarea label="Description" placeholder="Describe the product features and benefits..." value={form.description} onChange={(e) => update("description", e.target.value)} required />
                <div className="grid grid-cols-2 gap-4">
                  <Select label="Category" options={CATEGORIES.map((c) => ({ value: c, label: c }))} placeholder="Select category" value={form.category} onChange={(e) => update("category", e.target.value)} />
                  <Select label="Source Platform" options={[
                    { value: "Meesho", label: "Meesho" }, { value: "Amazon", label: "Amazon" },
                    { value: "Flipkart", label: "Flipkart" }, { value: "Other", label: "Other" },
                  ]} value={form.sourcePlatform} onChange={(e) => update("sourcePlatform", e.target.value)} />
                </div>
                <Input label="Affiliate Link" type="url" placeholder="https://..." value={form.affiliateLink} onChange={(e) => update("affiliateLink", e.target.value)} required />
                <Input label="Image URL" type="url" placeholder="https://..." value={form.imageURL} onChange={(e) => update("imageURL", e.target.value)} />
                <Input label="Commission Rate (%)" type="number" min={0} max={100} value={form.commissionRate || ""} onChange={(e) => update("commissionRate", Number(e.target.value))} />
                <Input label="Tags (comma separated)" placeholder="electronics, gadgets, trending" value={form.tags} onChange={(e) => update("tags", e.target.value)} />
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="published" checked={form.isPublished} onChange={(e) => update("isPublished", e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  <label htmlFor="published" className="text-sm font-medium">Publish to store</label>
                </div>
                <Button type="submit" loading={loading} className="w-full">Add Product</Button>
              </form>
            </CardContent>
          </Card>

          {/* CSV Import */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5" /> CSV Import</CardTitle></CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:border-indigo-500 transition cursor-pointer"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); setCsvFile(e.dataTransfer.files[0]); }}
                onClick={() => document.getElementById("csv-input")?.click()}
              >
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                <p className="text-sm font-medium mb-1">{csvFile ? csvFile.name : "Drop your CSV file here"}</p>
                <p className="text-xs text-slate-500">or click to browse</p>
                <input id="csv-input" type="file" accept=".csv" className="hidden" onChange={(e) => setCsvFile(e.target.files?.[0] || null)} />
              </div>
              {csvFile && <Button variant="secondary" className="mt-4 w-full" onClick={() => toast("CSV import processing...", "info")}>Import Products</Button>}
              <p className="text-xs text-slate-500 mt-3">Required columns: name, price, affiliate_link. Optional: description, category, image_url, margin</p>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Calculator Sidebar */}
        <div>
          <Card className="sticky top-24">
            <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="w-5 h-5" /> Pricing</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input label="Base Price (₹)" type="number" min={0} value={form.originalPrice || ""} onChange={(e) => update("originalPrice", Number(e.target.value))} />
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Margin: {form.marginPercent}%</label>
                <input type="range" min={0} max={200} value={form.marginPercent} onChange={(e) => update("marginPercent", Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 dark:bg-slate-700 accent-indigo-600" />
                <div className="flex justify-between text-xs text-slate-500 mt-1"><span>0%</span><span>100%</span><span>200%</span></div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-slate-500">Base Price</span><span>{formatCurrency(form.originalPrice)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Margin ({form.marginPercent}%)</span><span className="text-green-600">+{formatCurrency(profit)}</span></div>
                <hr className="border-slate-200 dark:border-slate-600" />
                <div className="flex justify-between font-bold"><span>Selling Price</span><span className="text-lg">{formatCurrency(sellingPrice)}</span></div>
              </div>
              <Badge variant="success" className="w-full justify-center py-2 text-sm">Profit per sale: {formatCurrency(profit)}</Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
