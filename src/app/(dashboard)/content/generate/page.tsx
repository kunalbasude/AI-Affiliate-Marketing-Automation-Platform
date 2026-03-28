"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Copy, Save, RefreshCw, Instagram, Youtube, Twitter, Hash, FileText, Film, LayoutGrid } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { CONTENT_TYPES, TONES } from "@/types";

const products = [
  { id: "1", name: "Wireless Earbuds Pro", sellingPrice: 1299 },
  { id: "2", name: "Silk Saree Collection", sellingPrice: 2499 },
  { id: "3", name: "Smart Watch Band", sellingPrice: 899 },
  { id: "4", name: "Kitchen Organizer Set", sellingPrice: 599 },
  { id: "5", name: "Face Serum Combo", sellingPrice: 449 },
];

const typeIcons: Record<string, typeof Instagram> = {
  instagram_caption: Instagram, instagram_reel: Film, instagram_carousel: LayoutGrid,
  youtube_script: Youtube, youtube_shorts: Youtube, hashtags: Hash, product_description: FileText,
};

const demoResult = `🔥 These ₹999 earbuds are SELLING OUT FAST!

Premium wireless earbuds with noise cancellation & 24-hour battery life. Crystal clear sound that rivals brands 3x the price.

✅ Active Noise Cancellation
✅ 24hr Battery Life
✅ IPX5 Water Resistant
✅ Bluetooth 5.3

Now available for just ₹1,299 — but stock is running LOW! ⚡

Don't miss out — Link in bio! 🛒

#WirelessEarbuds #TechDeals #BudgetGadgets #EarbudReview #AffordableTech`;

export default function GenerateContentPage() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedTone, setSelectedTone] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState("");

  const handleGenerate = async () => {
    setGenerating(true);
    // Simulate API call - in production, this calls /api/ai/generate-caption etc.
    await new Promise((r) => setTimeout(r, 2500));
    setResult(demoResult);
    setGenerating(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    toast("Copied to clipboard!", "success");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Link href="/content" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Content
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Sparkles className="w-6 h-6 text-indigo-600" /> AI Content Generator</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Generate viral marketing content with AI</p>
      </motion.div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= s ? "gradient-bg text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500"}`}>{s}</div>
            {s < 4 && <div className={`w-12 h-0.5 ${step > s ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Select Product */}
      {step >= 1 && (
        <Card>
          <CardHeader><CardTitle>1. Select Product</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {products.map((p) => (
                <button key={p.id} onClick={() => { setSelectedProduct(p.id); setStep(Math.max(step, 2)); }}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${selectedProduct === p.id ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950" : "border-slate-200 dark:border-slate-700 hover:border-slate-300"}`}>
                  <p className="font-medium text-sm">{p.name}</p>
                  <p className="text-xs text-slate-500 mt-1">₹{p.sellingPrice}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Content Type */}
      {step >= 2 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader><CardTitle>2. Content Type</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {CONTENT_TYPES.map((ct) => {
                  const Icon = typeIcons[ct.value] || FileText;
                  return (
                    <button key={ct.value} onClick={() => { setSelectedType(ct.value); setStep(Math.max(step, 3)); }}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${selectedType === ct.value ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950" : "border-slate-200 dark:border-slate-700 hover:border-slate-300"}`}>
                      <Icon className="w-6 h-6 mx-auto mb-2 text-indigo-600 dark:text-indigo-400" />
                      <p className="text-xs font-medium">{ct.label}</p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Step 3: Tone */}
      {step >= 3 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader><CardTitle>3. Tone & Style</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {TONES.map((t) => (
                  <button key={t.value} onClick={() => { setSelectedTone(t.value); setStep(4); }}
                    className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${selectedTone === t.value ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-600" : "border-slate-200 dark:border-slate-700 hover:border-slate-300"}`}>
                    {t.label}
                  </button>
                ))}
              </div>
              <Textarea label="Custom Instructions (Optional)" placeholder="e.g., Target audience is college students, mention free delivery..." value={customInstructions} onChange={(e) => setCustomInstructions(e.target.value)} />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Step 4: Generate */}
      {step >= 4 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button onClick={handleGenerate} loading={generating} size="lg" className="w-full">
            <Sparkles className="w-5 h-5" /> {generating ? "Generating with AI..." : "Generate Content"}
          </Button>
        </motion.div>
      )}

      {/* Result */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-indigo-200 dark:border-indigo-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-indigo-600" /> Generated Content</CardTitle>
                <Badge variant="info">AI Generated</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 mb-4">
                <pre className="text-sm whitespace-pre-wrap text-slate-700 dark:text-slate-300 font-sans">{result}</pre>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={copyToClipboard}><Copy className="w-4 h-4" /> Copy</Button>
                <Button variant="secondary" onClick={() => toast("Content saved!", "success")}><Save className="w-4 h-4" /> Save</Button>
                <Button variant="outline" onClick={handleGenerate}><RefreshCw className="w-4 h-4" /> Regenerate</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
