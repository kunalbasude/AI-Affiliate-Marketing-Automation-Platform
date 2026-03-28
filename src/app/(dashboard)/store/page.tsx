"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Store, Copy, ExternalLink, Eye, ShoppingBag, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";

const storeProducts = [
  { id: "1", name: "Wireless Earbuds Pro", sellingPrice: 1299, clicks: 145 },
  { id: "2", name: "Silk Saree Collection", sellingPrice: 2499, clicks: 98 },
  { id: "3", name: "Face Serum Combo", sellingPrice: 449, clicks: 42 },
  { id: "4", name: "Kitchen Organizer Set", sellingPrice: 599, clicks: 54 },
];

export default function StorePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [storeSettings, setStoreSettings] = useState({
    storeName: user?.storeSettings?.storeName || "My Store",
    bio: user?.storeSettings?.bio || "Best deals on trending products!",
    accentColor: user?.storeSettings?.accentColor || "#4f46e5",
    enabled: true,
  });

  const storeUrl = `yourdomain.com/store/${user?.username || "username"}`;
  const copyUrl = () => { navigator.clipboard.writeText(storeUrl); toast("Store URL copied!", "success"); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Store</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your public affiliate store</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Store Preview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Eye className="w-5 h-5" /> Store Preview</CardTitle>
              <Badge variant={storeSettings.enabled ? "success" : "warning"}>{storeSettings.enabled ? "Live" : "Disabled"}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Browser Mockup */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4 px-3 py-1 rounded-md bg-white dark:bg-slate-700 text-xs text-slate-500 truncate">
                  {storeUrl}
                </div>
              </div>
              <div className="p-6 bg-white dark:bg-slate-900">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: storeSettings.accentColor }}>
                    <Store className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-bold">{storeSettings.storeName}</h2>
                  <p className="text-sm text-slate-500 mt-1">{storeSettings.bio}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {storeProducts.map((p) => (
                    <div key={p.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-2">
                        <ShoppingBag className="w-6 h-6 text-slate-300" />
                      </div>
                      <p className="text-xs font-medium truncate">{p.name}</p>
                      <p className="text-sm font-bold mt-1">{formatCurrency(p.sellingPrice)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Store Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5" /> Store URL</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-slate-50 dark:bg-slate-700/50 px-3 py-2 rounded-lg truncate">{storeUrl}</code>
                <Button size="sm" variant="outline" onClick={copyUrl}><Copy className="w-4 h-4" /></Button>
              </div>
              <p className="text-xs text-slate-500 mt-2">{storeProducts.length} published products</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Store Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input label="Store Name" value={storeSettings.storeName} onChange={(e) => setStoreSettings((p) => ({ ...p, storeName: e.target.value }))} />
              <Textarea label="Bio" value={storeSettings.bio} onChange={(e) => setStoreSettings((p) => ({ ...p, bio: e.target.value }))} />
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Accent Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={storeSettings.accentColor} onChange={(e) => setStoreSettings((p) => ({ ...p, accentColor: e.target.value }))}
                    className="w-10 h-10 rounded-lg border border-slate-300 cursor-pointer" />
                  <span className="text-sm text-slate-500">{storeSettings.accentColor}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="enabled" checked={storeSettings.enabled} onChange={(e) => setStoreSettings((p) => ({ ...p, enabled: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                <label htmlFor="enabled" className="text-sm font-medium">Store enabled</label>
              </div>
              <Button className="w-full" onClick={() => toast("Store settings saved!", "success")}>Save Settings</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
