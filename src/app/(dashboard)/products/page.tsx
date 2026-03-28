"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Search, ShoppingBag, ExternalLink, Eye, EyeOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

const demoProducts = [
  { id: "1", name: "Wireless Earbuds Pro", category: "Electronics", originalPrice: 999, sellingPrice: 1299, marginPercent: 30, isPublished: true, imageURL: "", sourcePlatform: "Meesho" },
  { id: "2", name: "Silk Saree Collection", category: "Fashion", originalPrice: 1800, sellingPrice: 2499, marginPercent: 39, isPublished: true, imageURL: "", sourcePlatform: "Meesho" },
  { id: "3", name: "Smart Watch Band", category: "Electronics", originalPrice: 650, sellingPrice: 899, marginPercent: 38, isPublished: false, imageURL: "", sourcePlatform: "Amazon" },
  { id: "4", name: "Kitchen Organizer Set", category: "Home & Kitchen", originalPrice: 400, sellingPrice: 599, marginPercent: 50, isPublished: true, imageURL: "", sourcePlatform: "Flipkart" },
  { id: "5", name: "Face Serum Combo", category: "Beauty", originalPrice: 300, sellingPrice: 449, marginPercent: 50, isPublished: true, imageURL: "", sourcePlatform: "Meesho" },
  { id: "6", name: "Yoga Mat Premium", category: "Sports", originalPrice: 500, sellingPrice: 699, marginPercent: 40, isPublished: false, imageURL: "", sourcePlatform: "Amazon" },
];

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = demoProducts.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", ...new Set(demoProducts.map((p) => p.category))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your affiliate products</p>
        </div>
        <Link href="/products/add">
          <Button><Plus className="w-4 h-4" /> Add Product</Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Add your first product to get started</p>
            <Link href="/products/add"><Button>Add Product</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((product, i) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link href={`/products/${product.id}`}>
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-0">
                    <div className="h-40 bg-slate-100 dark:bg-slate-700 rounded-t-2xl flex items-center justify-center relative">
                      <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-500" />
                      <div className="absolute top-3 right-3 flex gap-2">
                        <Badge variant={product.isPublished ? "success" : "warning"}>
                          {product.isPublished ? <><Eye className="w-3 h-3 mr-1" />Live</> : <><EyeOff className="w-3 h-3 mr-1" />Draft</>}
                        </Badge>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <Badge variant="info">{product.sourcePlatform}</Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">{product.name}</h3>
                      <Badge variant="default" className="mt-1">{product.category}</Badge>
                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <span className="text-xs text-slate-500 line-through">{formatCurrency(product.originalPrice)}</span>
                          <span className="text-lg font-bold ml-2">{formatCurrency(product.sellingPrice)}</span>
                        </div>
                        <Badge variant="success">+{product.marginPercent}%</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
