"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ShoppingBag, Sparkles, Calendar, BarChart3, TrendingUp, ArrowUpRight, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";

const stats = [
  { label: "Total Products", value: "24", change: "+3", trend: "up", icon: ShoppingBag, color: "bg-blue-500" },
  { label: "AI Content", value: "156", change: "+12", trend: "up", icon: Sparkles, color: "bg-purple-500" },
  { label: "Scheduled Posts", value: "8", change: "+2", trend: "up", icon: Calendar, color: "bg-amber-500" },
  { label: "Total Clicks", value: "1,247", change: "+18%", trend: "up", icon: BarChart3, color: "bg-green-500" },
];

const recentProducts = [
  { id: "1", name: "Wireless Earbuds Pro", category: "Electronics", sellingPrice: 1299, clicks: 145 },
  { id: "2", name: "Silk Saree Collection", category: "Fashion", sellingPrice: 2499, clicks: 98 },
  { id: "3", name: "Smart Watch Band", category: "Electronics", sellingPrice: 899, clicks: 76 },
  { id: "4", name: "Kitchen Organizer Set", category: "Home & Kitchen", sellingPrice: 599, clicks: 54 },
  { id: "5", name: "Face Serum Combo", category: "Beauty", sellingPrice: 449, clicks: 42 },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.displayName?.split(" ")[0] || "User"} 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Here&apos;s what&apos;s happening with your affiliate marketing today.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
                    <TrendingUp className="w-3 h-3" />
                    {stat.change}
                  </div>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions & Recent Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/products/add">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Plus className="w-4 h-4" /> Add Product
              </Button>
            </Link>
            <Link href="/content/generate">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Sparkles className="w-4 h-4" /> Generate Content
              </Button>
            </Link>
            <Link href="/scheduler">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Calendar className="w-4 h-4" /> Schedule Post
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="outline" className="w-full justify-start gap-2">
                <BarChart3 className="w-4 h-4" /> View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Products */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Products</CardTitle>
            <Link href="/products" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <Badge variant="default">{product.category}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(product.sellingPrice)}</p>
                    <p className="text-xs text-slate-500">{product.clicks} clicks</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
