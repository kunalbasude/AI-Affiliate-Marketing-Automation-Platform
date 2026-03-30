"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Camera,
  PlayCircle,
  CheckCircle,
  XCircle,
  Link2,
  Unlink,
  ExternalLink,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { SocialAccount } from "@/types";

export default function SocialAccountsPage() {
  const { getIdToken } = useAuth();
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // Instagram connection state
  const [igToken, setIgToken] = useState("");
  const [igConnecting, setIgConnecting] = useState(false);
  const [igError, setIgError] = useState<string | null>(null);
  const [igSuccess, setIgSuccess] = useState<string | null>(null);

  // YouTube connection state
  const [ytLoading, setYtLoading] = useState(false);
  const [ytError, setYtError] = useState<string | null>(null);
  const [ytSuccess, setYtSuccess] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    const token = await getIdToken();
    const res = await fetch("/api/social/accounts", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setAccounts(data.accounts ?? []);
    }
    setLoading(false);
  }, [getIdToken]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Handle YouTube OAuth callback code
  useEffect(() => {
    const code = searchParams.get("youtube_code");
    const error = searchParams.get("youtube_error");
    if (code) handleYouTubeCode(code);
    if (error) setYtError(`YouTube authorization failed: ${error}`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const igAccount = accounts.find((a) => a.platform === "instagram");
  const ytAccount = accounts.find((a) => a.platform === "youtube");

  // ─── Instagram ────────────────────────────────────────────────────────────
  const connectInstagram = async () => {
    if (!igToken.trim()) {
      setIgError("Please enter your Instagram access token");
      return;
    }
    setIgConnecting(true);
    setIgError(null);
    try {
      const token = await getIdToken();
      const res = await fetch("/api/social/instagram/connect", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accessToken: igToken.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setIgError(data.error ?? "Connection failed");
      } else {
        setIgSuccess(`Connected as @${data.accountName}`);
        setIgToken("");
        await fetchAccounts();
      }
    } catch {
      setIgError("Network error. Please try again.");
    } finally {
      setIgConnecting(false);
    }
  };

  const disconnectInstagram = async () => {
    const token = await getIdToken();
    await fetch("/api/social/instagram/connect", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setIgSuccess(null);
    await fetchAccounts();
  };

  // ─── YouTube ──────────────────────────────────────────────────────────────
  const startYouTubeOAuth = async () => {
    setYtLoading(true);
    setYtError(null);
    try {
      const token = await getIdToken();
      const res = await fetch("/api/social/youtube/connect", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        setYtError("Failed to get YouTube authorization URL");
        setYtLoading(false);
      }
    } catch {
      setYtError("Network error. Please try again.");
      setYtLoading(false);
    }
  };

  const handleYouTubeCode = async (code: string) => {
    setYtLoading(true);
    setYtError(null);
    try {
      const token = await getIdToken();
      const res = await fetch("/api/social/youtube/connect", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setYtError(data.error ?? "YouTube connection failed");
      } else {
        setYtSuccess(`Connected to channel: ${data.channelName}`);
        await fetchAccounts();
      }
    } catch {
      setYtError("Failed to exchange YouTube token");
    } finally {
      setYtLoading(false);
    }
  };

  const disconnectYouTube = async () => {
    const token = await getIdToken();
    await fetch("/api/social/youtube/connect", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setYtSuccess(null);
    await fetchAccounts();
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Link2 className="w-6 h-6 text-indigo-600" />
          Social Accounts
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Connect Instagram and YouTube to auto-post your dropshipping content
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Instagram */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold">Instagram</p>
                  {igAccount ? (
                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Connected as {igAccount.accountName}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400">Not connected</p>
                  )}
                </div>
              </div>
              {igAccount && (
                <button
                  onClick={disconnectInstagram}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition"
                >
                  <Unlink className="w-3 h-3" /> Disconnect
                </button>
              )}
            </div>

            {!igAccount && (
              <div className="space-y-3">
                {/* Already professional — short path */}
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-600" />
                  <p>Your account is already a <strong>Professional / Monetized</strong> account — you just need the access token below.</p>
                </div>

                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300 space-y-2">
                  <p className="font-semibold">Get your token in 3 steps:</p>
                  <ol className="list-decimal pl-4 space-y-1.5">
                    <li>
                      Open{" "}
                      <a
                        href="https://developers.facebook.com/tools/explorer"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-medium inline-flex items-center gap-0.5"
                      >
                        Meta Graph API Explorer <ExternalLink className="w-3 h-3" />
                      </a>
                      {" "}→ select your Facebook App (create one free if needed)
                    </li>
                    <li>
                      Click <strong>Generate Access Token</strong> and tick these permissions:
                      <div className="mt-1 flex flex-wrap gap-1">
                        {["instagram_basic", "instagram_content_publish", "pages_read_engagement", "pages_show_list"].map((p) => (
                          <code key={p} className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 font-mono text-[10px]">{p}</code>
                        ))}
                      </div>
                    </li>
                    <li>
                      Exchange for a <strong>Long-Lived Token</strong> (60-day expiry) — call this URL once:
                      <div className="mt-1 p-1.5 rounded bg-blue-100 dark:bg-blue-900 font-mono text-[10px] break-all select-all">
                        GET graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&amp;client_id=APP_ID&amp;client_secret=APP_SECRET&amp;fb_exchange_token=SHORT_TOKEN
                      </div>
                    </li>
                  </ol>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 pt-1">
                    Your Instagram username: <strong>@truth_of_the_journey</strong> — make sure it is linked to your Facebook Page before generating the token.
                  </p>
                </div>
                <input
                  type="password"
                  value={igToken}
                  onChange={(e) => setIgToken(e.target.value)}
                  placeholder="Paste your Instagram long-lived access token"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                {igError && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {igError}
                  </p>
                )}
                {igSuccess && (
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> {igSuccess}
                  </p>
                )}
                <button
                  onClick={connectInstagram}
                  disabled={igConnecting}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
                >
                  {igConnecting ? "Connecting..." : "Connect Instagram"}
                </button>
              </div>
            )}
          </motion.div>

          {/* YouTube */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center">
                  <PlayCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold">YouTube</p>
                  {ytAccount ? (
                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> {ytAccount.accountName}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400">Not connected</p>
                  )}
                </div>
              </div>
              {ytAccount && (
                <button
                  onClick={disconnectYouTube}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition"
                >
                  <Unlink className="w-3 h-3" /> Disconnect
                </button>
              )}
            </div>

            {!ytAccount && (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
                  Connect your YouTube channel via Google OAuth. You will be redirected to Google to
                  authorize access to upload videos.
                </div>
                {ytError && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> {ytError}
                  </p>
                )}
                {ytSuccess && (
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> {ytSuccess}
                  </p>
                )}
                <button
                  onClick={startYouTubeOAuth}
                  disabled={ytLoading}
                  className="w-full py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {ytLoading ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Connecting...</>
                  ) : (
                    <><PlayCircle className="w-4 h-4" /> Connect YouTube Channel</>
                  )}
                </button>
              </div>
            )}
          </motion.div>

          {/* Requirements note */}
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300 space-y-1">
            <p className="font-medium">Requirements for auto-posting:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Instagram: Business or Creator account linked to a Facebook Page</li>
              <li>YouTube: Channel must be in good standing (no strikes)</li>
              <li>Videos for Reels/Shorts are generated via Shotstack (requires API key in settings)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
