"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Settings, Save, RefreshCw, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { AutomationSettings, Tone } from "@/types";
import { TONES } from "@/types";

const MEESHO_CATEGORIES = [
  { value: "women-kurtas", label: "Women Kurtas" },
  { value: "men-tshirts", label: "Men T-Shirts" },
  { value: "sarees", label: "Sarees" },
  { value: "leggings", label: "Leggings" },
  { value: "home-decor", label: "Home Decor" },
  { value: "kitchen-storage", label: "Kitchen & Storage" },
  { value: "beauty", label: "Beauty" },
  { value: "skin-care", label: "Skin Care" },
  { value: "mobile-accessories", label: "Mobile Accessories" },
  { value: "toys-games", label: "Toys & Games" },
  { value: "sports-fitness", label: "Sports & Fitness" },
];

const DEFAULT_SETTINGS: AutomationSettings = {
  enabled: true,
  scrapeInterval: "daily",
  maxProductsPerRun: 10,
  minRating: 3.5,
  minOrders: 100,
  categories: ["women-kurtas", "home-decor", "beauty", "mobile-accessories"],
  autoPublishToStore: true,
  autoGenerateContent: true,
  autoPostInstagram: false,
  autoUploadYoutube: false,
  contentTone: "casual",
  priceMarginPercent: 30,
  postsPerDay: 10,
};

export default function AutomationSettingsPage() {
  const { getIdToken } = useAuth();
  const [settings, setSettings] = useState<AutomationSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchSettings = useCallback(async () => {
    const token = await getIdToken();
    const res = await fetch("/api/automation/settings", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.settings) setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
    }
    setLoading(false);
  }, [getIdToken]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await getIdToken();
      await fetch("/api/automation/settings", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (cat: string) => {
    setSettings((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const set = <K extends keyof AutomationSettings>(key: K, value: AutomationSettings[K]) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-600" />
            Automation Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure your dropshipping automation pipeline
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-bg text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
        >
          {saved ? (
            <><CheckCircle className="w-4 h-4" /> Saved</>
          ) : saving ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</>
          ) : (
            <><Save className="w-4 h-4" /> Save Settings</>
          )}
        </button>
      </div>

      {/* General */}
      <Section title="General">
        <Toggle
          label="Enable Automation"
          description="Master switch for the full automation pipeline"
          checked={settings.enabled}
          onChange={(v) => set("enabled", v)}
        />
        <div className="grid grid-cols-2 gap-4">
          <LabeledSelect
            label="Scrape Interval"
            value={settings.scrapeInterval}
            onChange={(v) => set("scrapeInterval", v as AutomationSettings["scrapeInterval"])}
            options={[
              { value: "hourly", label: "Every hour" },
              { value: "every6h", label: "Every 6 hours" },
              { value: "daily", label: "Once daily" },
            ]}
          />
          <LabeledInput
            label="Posts per day"
            type="number"
            min={1}
            max={100}
            value={settings.postsPerDay}
            onChange={(v) => set("postsPerDay", Number(v))}
          />
        </div>
      </Section>

      {/* Scraper */}
      <Section title="Meesho Scraper">
        <div className="grid grid-cols-2 gap-4">
          <LabeledInput
            label="Max products per run"
            type="number"
            min={1}
            max={50}
            value={settings.maxProductsPerRun}
            onChange={(v) => set("maxProductsPerRun", Number(v))}
          />
          <LabeledInput
            label="Min margin %"
            type="number"
            min={0}
            max={200}
            value={settings.priceMarginPercent}
            onChange={(v) => set("priceMarginPercent", Number(v))}
          />
          <LabeledInput
            label="Min product rating"
            type="number"
            min={1}
            max={5}
            step={0.1}
            value={settings.minRating}
            onChange={(v) => set("minRating", Number(v))}
          />
          <LabeledInput
            label="Min orders count"
            type="number"
            min={0}
            value={settings.minOrders}
            onChange={(v) => set("minOrders", Number(v))}
          />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Scrape Categories
          </p>
          <div className="flex flex-wrap gap-2">
            {MEESHO_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => toggleCategory(cat.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  settings.categories.includes(cat.value)
                    ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Content & Publishing */}
      <Section title="Content & Publishing">
        <Toggle
          label="Auto-publish to store"
          description="Scraped products are immediately visible in your store"
          checked={settings.autoPublishToStore}
          onChange={(v) => set("autoPublishToStore", v)}
        />
        <Toggle
          label="Auto-generate AI content"
          description="Create captions, scripts, and hashtags for each product"
          checked={settings.autoGenerateContent}
          onChange={(v) => set("autoGenerateContent", v)}
        />
        <LabeledSelect
          label="Content tone"
          value={settings.contentTone}
          onChange={(v) => set("contentTone", v as Tone)}
          options={TONES.map((t) => ({ value: t.value, label: t.label }))}
        />
      </Section>

      {/* Social Media */}
      <Section title="Social Media">
        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300 mb-2">
          Connect your accounts first in{" "}
          <a href="/social-accounts" className="underline font-medium">
            Social Accounts
          </a>{" "}
          before enabling auto-posting.
        </div>
        <Toggle
          label="Auto-post to Instagram"
          description="Post reels and images automatically after video generation"
          checked={settings.autoPostInstagram}
          onChange={(v) => set("autoPostInstagram", v)}
        />
        <Toggle
          label="Auto-upload to YouTube"
          description="Upload YouTube Shorts automatically for each product"
          checked={settings.autoUploadYoutube}
          onChange={(v) => set("autoUploadYoutube", v)}
        />
      </Section>
    </div>
  );
}

// ─── Small components ─────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4"
    >
      <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-3">
        {title}
      </h2>
      {children}
    </motion.div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  type = "text",
  min,
  max,
  step,
}: {
  label: string;
  value: number | string;
  onChange: (v: string) => void;
  type?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
        {label}
      </label>
      <input
        type={type}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}

function LabeledSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
