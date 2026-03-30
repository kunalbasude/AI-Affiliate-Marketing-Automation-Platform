"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Plus, Copy, Calendar, Trash2, Camera, PlayCircle, Twitter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const platformIcons: Record<string, typeof Camera> = { instagram: Camera, youtube: PlayCircle, twitter: Twitter };

const demoContent = [
  { id: "1", type: "instagram_caption", platform: "instagram", productName: "Wireless Earbuds Pro", tone: "urgent", preview: "🔥 These ₹999 earbuds are SELLING OUT! Premium wireless earbuds with 24hr battery. Now at just ₹1,299 — limited stock! 🎧\n\n#WirelessEarbuds #TechDeals #BudgetGadgets", createdAt: "2 hours ago" },
  { id: "2", type: "youtube_shorts", platform: "youtube", productName: "Silk Saree Collection", tone: "luxury", preview: "HOOK: \"This saree costs less than your coffee order for a week\"\nSCENE 1: Unboxing the premium silk saree...", createdAt: "5 hours ago" },
  { id: "3", type: "hashtags", platform: "instagram", productName: "Smart Watch Band", tone: "casual", preview: "#SmartWatch #WatchBand #TechAccessories #GadgetLovers #FitnessWatch #AffordableTech #OnlineShopping #BestDeals...", createdAt: "1 day ago" },
  { id: "4", type: "instagram_reel", platform: "instagram", productName: "Face Serum Combo", tone: "friendly", preview: "HOOK (0-3s): \"Your skin is going to thank you for this!\"\nSCENE 1: Show the serum bottles with morning light...", createdAt: "1 day ago" },
  { id: "5", type: "product_description", platform: "instagram", productName: "Kitchen Organizer Set", tone: "professional", preview: "Transform Your Kitchen with the Ultimate Organizer Set\n\nTired of cluttered countertops? This premium kitchen organizer...", createdAt: "2 days ago" },
];

const typeLabels: Record<string, string> = {
  instagram_caption: "Caption", instagram_reel: "Reel Script", instagram_carousel: "Carousel",
  youtube_script: "YT Script", youtube_shorts: "YT Shorts", hashtags: "Hashtags", product_description: "Description",
};

export default function ContentPage() {
  const { toast } = useToast();
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? demoContent : demoContent.filter((c) => c.platform === filter);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast("Copied to clipboard!", "success");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">AI Content</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Your AI-generated marketing content library</p>
        </div>
        <Link href="/content/generate">
          <Button><Sparkles className="w-4 h-4" /> Generate New</Button>
        </Link>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="instagram">Camera</TabsTrigger>
          <TabsTrigger value="youtube">YouTube</TabsTrigger>
        </TabsList>

        {["all", "instagram", "youtube"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(tab === "all" ? demoContent : demoContent.filter((c) => c.platform === tab)).map((content, i) => {
                const PlatformIcon = platformIcons[content.platform] || Camera;
                return (
                  <motion.div key={content.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <PlatformIcon className="w-4 h-4 text-slate-400" />
                            <Badge variant="info">{typeLabels[content.type] || content.type}</Badge>
                            <Badge variant="default">{content.tone}</Badge>
                          </div>
                          <span className="text-xs text-slate-500">{content.createdAt}</span>
                        </div>
                        <p className="text-sm font-medium mb-2">{content.productName}</p>
                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 mb-3">
                          <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line line-clamp-4">{content.preview}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="secondary" onClick={() => copyToClipboard(content.preview)}>
                            <Copy className="w-3 h-3" /> Copy
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Calendar className="w-3 h-3" /> Schedule
                          </Button>
                          <Button size="sm" variant="ghost" className="ml-auto text-red-500 hover:text-red-600">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
