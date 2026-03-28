import type { Metadata } from "next";
import { ThemeProvider } from "@/context/theme-context";
import { AuthProvider } from "@/context/auth-context";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "AffiliFlow AI - AI-Powered Affiliate Marketing Automation",
  description:
    "Automate your affiliate marketing with AI-generated content, social media scheduling, and performance analytics.",
  keywords: [
    "affiliate marketing",
    "AI automation",
    "social media marketing",
    "content generation",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
