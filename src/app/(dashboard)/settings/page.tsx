"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, User, CreditCard, Key, Check, Crown, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    displayName: user?.displayName || "",
    email: user?.email || "",
    username: user?.username || "",
  });
  const [apiKeys, setApiKeys] = useState({ anthropic: "", openai: "" });
  const [showKeys, setShowKeys] = useState({ anthropic: false, openai: false });

  const freeFeatures = ["10 products", "20 AI generations/month", "5 scheduled posts", "Basic analytics", "Public store"];
  const proFeatures = ["Unlimited products", "500 AI generations/month", "Unlimited scheduling", "Advanced analytics", "Custom store branding", "Trend detection", "Priority support"];

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your account and preferences</p>
      </motion.div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile"><User className="w-4 h-4 mr-1" /> Profile</TabsTrigger>
          <TabsTrigger value="plan"><CreditCard className="w-4 h-4 mr-1" /> Plan</TabsTrigger>
          <TabsTrigger value="api"><Key className="w-4 h-4 mr-1" /> API Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle>Profile Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center text-white text-xl font-bold">
                  {profile.displayName.charAt(0) || "U"}
                </div>
                <div>
                  <p className="font-semibold">{profile.displayName || "User"}</p>
                  <Badge variant={user?.plan === "pro" ? "info" : "default"}>
                    {user?.plan === "pro" ? <><Crown className="w-3 h-3 mr-1" />Pro</> : "Free Plan"}
                  </Badge>
                </div>
              </div>
              <Input label="Full Name" value={profile.displayName} onChange={(e) => setProfile((p) => ({ ...p, displayName: e.target.value }))} />
              <Input label="Email" value={profile.email} disabled helperText="Email cannot be changed" />
              <Input label="Username" value={profile.username} onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))} helperText={`Your store URL: yourdomain.com/store/${profile.username}`} />
              <Button onClick={() => toast("Profile updated!", "success")}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plan">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className={user?.plan !== "pro" ? "ring-2 ring-indigo-500" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Free</CardTitle>
                  {user?.plan !== "pro" && <Badge variant="success">Current</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold mb-4">₹0<span className="text-sm text-slate-500 font-normal">/forever</span></p>
                <ul className="space-y-2">
                  {freeFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-green-500" />{f}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className={user?.plan === "pro" ? "ring-2 ring-indigo-500" : "border-indigo-200 dark:border-indigo-800"}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><Crown className="w-5 h-5 text-amber-500" /> Pro</CardTitle>
                  {user?.plan === "pro" && <Badge variant="success">Current</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold mb-4">₹999<span className="text-sm text-slate-500 font-normal">/month</span></p>
                <ul className="space-y-2 mb-6">
                  {proFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-green-500" />{f}</li>
                  ))}
                </ul>
                {user?.plan !== "pro" && (
                  <Button className="w-full" onClick={() => toast("Upgrade coming soon!", "info")}>
                    <Crown className="w-4 h-4" /> Upgrade to Pro
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader><CardTitle>Usage This Month</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Products", used: 6, max: 10 },
                { label: "AI Generations", used: 12, max: 20 },
                { label: "Scheduled Posts", used: 3, max: 5 },
              ].map((u) => (
                <div key={u.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{u.label}</span>
                    <span className="text-slate-500">{u.used}/{u.max}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className="h-full rounded-full gradient-bg transition-all" style={{ width: `${(u.used / u.max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <p className="text-sm text-slate-500 mt-1">Configure your AI provider API keys for content generation</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Anthropic API Key</label>
                <div className="flex gap-2">
                  <input
                    type={showKeys.anthropic ? "text" : "password"}
                    value={apiKeys.anthropic}
                    onChange={(e) => setApiKeys((p) => ({ ...p, anthropic: e.target.value }))}
                    placeholder="sk-ant-..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Button variant="outline" onClick={() => setShowKeys((p) => ({ ...p, anthropic: !p.anthropic }))}>
                    {showKeys.anthropic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">OpenAI API Key</label>
                <div className="flex gap-2">
                  <input
                    type={showKeys.openai ? "text" : "password"}
                    value={apiKeys.openai}
                    onChange={(e) => setApiKeys((p) => ({ ...p, openai: e.target.value }))}
                    placeholder="sk-..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Button variant="outline" onClick={() => setShowKeys((p) => ({ ...p, openai: !p.openai }))}>
                    {showKeys.openai ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <Button onClick={() => toast("API keys saved!", "success")}>Save API Keys</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
