"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, TrendingDown, MousePointer, Eye, ShoppingCart, DollarSign, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

const kpis = [
  { label: "Total Clicks", value: "1,247", change: "+18.2%", up: true, icon: MousePointer, color: "bg-blue-500" },
  { label: "Total Views", value: "4,891", change: "+12.5%", up: true, icon: Eye, color: "bg-purple-500" },
  { label: "Conversions", value: "89", change: "+7.3%", up: true, icon: ShoppingCart, color: "bg-green-500" },
  { label: "Est. Revenue", value: "₹12,450", change: "-3.1%", up: false, icon: DollarSign, color: "bg-amber-500" },
];

const topProducts = [
  { name: "Wireless Earbuds Pro", clicks: 245, views: 890, conversions: 32, revenue: 4150 },
  { name: "Silk Saree Collection", clicks: 198, views: 720, conversions: 18, revenue: 3240 },
  { name: "Face Serum Combo", clicks: 156, views: 580, conversions: 15, revenue: 2025 },
  { name: "Kitchen Organizer Set", clicks: 134, views: 490, conversions: 12, revenue: 1680 },
  { name: "Smart Watch Band", clicks: 89, views: 340, conversions: 8, revenue: 1080 },
];

const chartData = [65, 40, 85, 30, 70, 95, 55, 80, 45, 90, 60, 75, 50, 85, 40, 70, 95, 55, 80, 65, 90, 45, 75, 60, 85, 50, 70, 40, 65, 80];

const referrers = [
  { source: "Camera", visits: 1240, pct: 42 },
  { source: "YouTube", visits: 780, pct: 26 },
  { source: "Direct", visits: 520, pct: 17 },
  { source: "Twitter", visits: 290, pct: 10 },
  { source: "Other", visits: 150, pct: 5 },
];

export default function AnalyticsPage() {
  const [range, setRange] = useState("30d");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track your affiliate marketing performance</p>
        </div>
        <div className="flex gap-2">
          {["7d", "30d", "90d"].map((r) => (
            <Button key={r} size="sm" variant={range === r ? "default" : "outline"} onClick={() => setRange(r)}>{r}</Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${kpi.color} flex items-center justify-center`}>
                    <kpi.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${kpi.up ? "text-green-600" : "text-red-500"}`}>
                    {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {kpi.change}
                  </div>
                </div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{kpi.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader><CardTitle>Clicks Over Time</CardTitle></CardHeader>
        <CardContent>
          <div className="h-48 flex items-end gap-1">
            {chartData.map((val, i) => (
              <div key={i} className="flex-1 rounded-t-sm gradient-bg opacity-70 hover:opacity-100 transition-opacity cursor-pointer" style={{ height: `${val}%` }}
                title={`Day ${i + 1}: ${val} clicks`} />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span>1</span><span>10</span><span>20</span><span>30</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Top Performing Products</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Conversions</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((p) => (
                  <TableRow key={p.name}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.clicks}</TableCell>
                    <TableCell><Badge variant="success">{p.conversions}</Badge></TableCell>
                    <TableCell className="font-semibold">{formatCurrency(p.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Referrers */}
        <Card>
          <CardHeader><CardTitle>Traffic Sources</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {referrers.map((r) => (
              <div key={r.source}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{r.source}</span>
                  <span className="text-slate-500">{r.visits} ({r.pct}%)</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                  <div className="h-full rounded-full gradient-bg transition-all" style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
