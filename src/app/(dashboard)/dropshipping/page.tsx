"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  ShoppingCart,
  TrendingUp,
  Camera,
  PlayCircle,
  Package,
  Play,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Video,
  BarChart2,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { AutomationRun } from "@/types";

interface Stats {
  totalProductsScraped: number;
  totalVideosCreated: number;
  totalInstagramPosts: number;
  totalYoutubeUploads: number;
  lastRunAt?: string;
  todayPosts: number;
}

const STAT_CARDS = [
  { key: "totalProductsScraped", label: "Products Scraped", icon: Package, color: "indigo" },
  { key: "totalVideosCreated", label: "Videos Created", icon: Video, color: "purple" },
  { key: "totalInstagramPosts", label: "Instagram Posts", icon: Camera, color: "pink" },
  { key: "totalYoutubeUploads", label: "YouTube Shorts", icon: PlayCircle, color: "red" },
] as const;

export default function DropshippingPage() {
  const { user, getIdToken } = useAuth();
  const [runs, setRuns] = useState<AutomationRun[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalProductsScraped: 0,
    totalVideosCreated: 0,
    totalInstagramPosts: 0,
    totalYoutubeUploads: 0,
    todayPosts: 0,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [runError, setRunError] = useState<string | null>(null);
  const [runSuccess, setRunSuccess] = useState<string | null>(null);

  const fetchRuns = useCallback(async () => {
    const token = await getIdToken();
    const res = await fetch("/api/automation/run", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const data = await res.json();
    const fetchedRuns: AutomationRun[] = data.runs ?? [];
    setRuns(fetchedRuns);

    // Aggregate stats from all runs
    const agg: Stats = {
      totalProductsScraped: 0,
      totalVideosCreated: 0,
      totalInstagramPosts: 0,
      totalYoutubeUploads: 0,
      todayPosts: 0,
    };
    const today = new Date().toDateString();
    for (const run of fetchedRuns) {
      agg.totalProductsScraped += run.stats.productsScraped;
      agg.totalVideosCreated += run.stats.videosCreated;
      agg.totalInstagramPosts += run.stats.instagramPosted;
      agg.totalYoutubeUploads += run.stats.youtubeUploaded;

      const runDate = run.startedAt ? new Date(run.startedAt).toDateString() : "";
      if (runDate === today) {
        agg.todayPosts += run.stats.instagramPosted + run.stats.youtubeUploaded;
      }
    }
    if (fetchedRuns[0]?.startedAt) agg.lastRunAt = fetchedRuns[0].startedAt;
    setStats(agg);
  }, [getIdToken]);

  useEffect(() => {
    fetchRuns().finally(() => setLoading(false));
  }, [fetchRuns]);

  const handleRunPipeline = async () => {
    setIsRunning(true);
    setRunError(null);
    setRunSuccess(null);
    try {
      const token = await getIdToken();
      const res = await fetch("/api/automation/run", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setRunError(data.error ?? "Pipeline failed");
      } else {
        const s = data.stats;
        setRunSuccess(
          `Done! Added ${s.productsAdded} products, created ${s.videosCreated} videos, posted ${s.instagramPosted} to Instagram, uploaded ${s.youtubeUploaded} to YouTube.`
        );
        await fetchRuns();
      }
    } catch {
      setRunError("Network error. Please try again.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-indigo-600" />
            Dropshipping Automation
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Scrape viral products from Meesho, auto-generate reels and post to Instagram & YouTube
          </p>
        </div>
        <button
          onClick={handleRunPipeline}
          disabled={isRunning}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg text-white font-semibold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Running Pipeline...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run Automation
            </>
          )}
        </button>
      </div>

      {/* Alerts */}
      {runSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800"
        >
          <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-emerald-800 dark:text-emerald-200">{runSuccess}</p>
        </motion.div>
      )}
      {runError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"
        >
          <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-800 dark:text-red-200">{runError}</p>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, color }) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800"
          >
            <div className={`w-10 h-10 rounded-xl bg-${color}-50 dark:bg-${color}-950 flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 text-${color}-600`} />
            </div>
            <p className="text-2xl font-bold">{loading ? "—" : stats[key]}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Today's summary */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 rounded-2xl p-5 border border-indigo-100 dark:border-indigo-900 flex flex-wrap gap-6 items-center">
        <TrendingUp className="w-8 h-8 text-indigo-600" />
        <div>
          <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{stats.todayPosts}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">Posts today</p>
        </div>
        <div className="h-10 w-px bg-indigo-200 dark:bg-indigo-800 hidden sm:block" />
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Last run</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {stats.lastRunAt ? new Date(stats.lastRunAt).toLocaleString() : "Never"}
          </p>
        </div>
        <div className="ml-auto">
          <a href="/automation" className="text-sm font-semibold text-indigo-600 hover:underline">
            Configure settings →
          </a>
        </div>
      </div>

      {/* Pipeline steps diagram */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-base font-semibold mb-5 flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-600" />
          Automation Pipeline
        </h2>
        <div className="flex flex-wrap gap-3 items-center">
          {[
            { icon: Package, label: "Scrape Meesho", sub: "Find viral products", color: "indigo" },
            { icon: BarChart2, label: "Filter & Score", sub: "Rating + orders", color: "blue" },
            { icon: Zap, label: "AI Content", sub: "Captions + scripts", color: "violet" },
            { icon: Video, label: "Generate Reel", sub: "Shotstack render", color: "purple" },
            { icon: Camera, label: "Post Instagram", sub: "Reel + caption", color: "pink" },
            { icon: PlayCircle, label: "Upload YouTube", sub: "#Shorts", color: "red" },
            { icon: ShoppingCart, label: "Add to Store", sub: "Auto-published", color: "emerald" },
          ].map((step, i, arr) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-10 h-10 rounded-xl bg-${step.color}-50 dark:bg-${step.color}-950 flex items-center justify-center`}>
                  <step.icon className={`w-5 h-5 text-${step.color}-600`} />
                </div>
                <p className="text-xs font-medium text-center leading-tight">{step.label}</p>
                <p className="text-[10px] text-slate-400 text-center">{step.sub}</p>
              </div>
              {i < arr.length - 1 && (
                <div className="text-slate-300 dark:text-slate-700 text-lg font-light hidden sm:block">→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent runs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold text-sm">Recent Runs</h2>
          <button onClick={fetchRuns} className="text-slate-400 hover:text-slate-600 transition">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400">Loading...</div>
        ) : runs.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No runs yet. Click "Run Automation" to start.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {runs.map((run) => (
              <div key={run.id} className="px-6 py-4 flex flex-wrap gap-4 items-start">
                <div className="flex items-center gap-2 min-w-[140px]">
                  <StatusIcon status={run.status} />
                  <div>
                    <p className="text-xs font-medium capitalize">{run.status}</p>
                    <p className="text-[11px] text-slate-400">
                      {run.startedAt ? new Date(run.startedAt).toLocaleString() : ""}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-400">
                  <span><b>{run.stats.productsScraped}</b> scraped</span>
                  <span><b>{run.stats.productsAdded}</b> added</span>
                  <span><b>{run.stats.videosCreated}</b> videos</span>
                  <span><b>{run.stats.instagramPosted}</b> IG</span>
                  <span><b>{run.stats.youtubeUploaded}</b> YT</span>
                  {run.stats.errors > 0 && (
                    <span className="text-red-500"><b>{run.stats.errors}</b> errors</span>
                  )}
                </div>
                {run.errors?.length > 0 && (
                  <details className="w-full">
                    <summary className="text-xs text-red-500 cursor-pointer">
                      {run.errors.length} error(s)
                    </summary>
                    <ul className="mt-1 text-xs text-red-400 space-y-0.5 pl-4">
                      {run.errors.slice(0, 5).map((e, i) => (
                        <li key={i} className="list-disc">{e}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: AutomationRun["status"] }) {
  if (status === "completed") return <CheckCircle className="w-4 h-4 text-emerald-500" />;
  if (status === "failed") return <XCircle className="w-4 h-4 text-red-500" />;
  if (status === "running") return <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin" />;
  return <AlertCircle className="w-4 h-4 text-amber-500" />;
}
