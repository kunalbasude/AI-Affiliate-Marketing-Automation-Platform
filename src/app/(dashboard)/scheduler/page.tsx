"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Plus, Clock, Camera, PlayCircle, Twitter, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const platformIcons: Record<string, typeof Camera> = { instagram: Camera, youtube: PlayCircle, twitter: Twitter };

const demoSchedules = [
  { id: "1", productName: "Wireless Earbuds Pro", platform: "instagram", caption: "🔥 These earbuds are going viral...", scheduledAt: "2026-03-29T10:00", status: "scheduled" as const },
  { id: "2", productName: "Silk Saree Collection", platform: "youtube", caption: "HOOK: This saree costs less than...", scheduledAt: "2026-03-29T14:00", status: "scheduled" as const },
  { id: "3", productName: "Face Serum Combo", platform: "instagram", caption: "Your skin is going to thank you...", scheduledAt: "2026-03-28T09:00", status: "posted" as const },
  { id: "4", productName: "Kitchen Organizer", platform: "twitter", caption: "Transform your kitchen with this...", scheduledAt: "2026-03-27T16:00", status: "posted" as const },
  { id: "5", productName: "Smart Watch Band", platform: "instagram", caption: "Best budget smartwatch band of 2026!", scheduledAt: "2026-03-26T11:00", status: "missed" as const },
];

const statusConfig = {
  scheduled: { icon: Clock, color: "info" as const, label: "Scheduled" },
  posted: { icon: CheckCircle, color: "success" as const, label: "Posted" },
  missed: { icon: AlertCircle, color: "warning" as const, label: "Missed" },
  cancelled: { icon: XCircle, color: "danger" as const, label: "Cancelled" },
};

const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

export default function SchedulerPage() {
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [currentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);
  const monthName = currentMonth.toLocaleString("default", { month: "long", year: "numeric" });

  const getSchedulesForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return demoSchedules.filter((s) => s.scheduledAt.startsWith(dateStr));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Content Scheduler</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Plan and schedule your social media posts</p>
        </div>
        <Button onClick={() => setShowModal(true)}><Plus className="w-4 h-4" /> Schedule Post</Button>
      </div>

      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <Card>
            <CardHeader><CardTitle>{monthName}</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-700 rounded-xl overflow-hidden">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="bg-slate-50 dark:bg-slate-800 p-2 text-center text-xs font-medium text-slate-500">{d}</div>
                ))}
                {Array.from({ length: startDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="bg-white dark:bg-slate-800/50 p-2 min-h-[80px]" />
                ))}
                {Array.from({ length: totalDays }).map((_, i) => {
                  const day = i + 1;
                  const schedules = getSchedulesForDay(day);
                  const isToday = day === new Date().getDate() && month === new Date().getMonth();
                  return (
                    <div key={day} className={`bg-white dark:bg-slate-800/50 p-2 min-h-[80px] ${isToday ? "ring-2 ring-inset ring-indigo-500" : ""}`}>
                      <span className={`text-xs font-medium ${isToday ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500"}`}>{day}</span>
                      <div className="mt-1 space-y-1">
                        {schedules.map((s) => {
                          const conf = statusConfig[s.status];
                          return (
                            <div key={s.id} className="text-xs p-1 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 truncate">
                              {s.productName.slice(0, 15)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {demoSchedules.map((schedule) => {
                  const PlatformIcon = platformIcons[schedule.platform] || Camera;
                  const conf = statusConfig[schedule.status];
                  const StatusIcon = conf.icon;
                  return (
                    <div key={schedule.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <div className="flex items-center gap-4">
                        <PlatformIcon className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-sm font-medium">{schedule.productName}</p>
                          <p className="text-xs text-slate-500 truncate max-w-xs">{schedule.caption}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-500">{new Date(schedule.scheduledAt).toLocaleString()}</span>
                        <Badge variant={conf.color}><StatusIcon className="w-3 h-3 mr-1" />{conf.label}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Schedule Post" size="md">
        <div className="space-y-4">
          <Select label="Content" options={demoSchedules.map((s) => ({ value: s.id, label: s.productName }))} placeholder="Select content to schedule" />
          <Select label="Platform" options={[
            { value: "instagram", label: "Camera" }, { value: "youtube", label: "YouTube" }, { value: "twitter", label: "Twitter" },
          ]} placeholder="Select platform" />
          <Input label="Date & Time" type="datetime-local" />
          <Textarea label="Notes (optional)" placeholder="Any notes for this post..." />
          <Button className="w-full" onClick={() => { toast("Post scheduled!", "success"); setShowModal(false); }}>Schedule</Button>
        </div>
      </Modal>
    </div>
  );
}
