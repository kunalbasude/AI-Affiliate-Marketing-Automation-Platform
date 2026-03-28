# AffiliFlow AI

AI-Powered Affiliate Marketing Automation Platform

## Overview

AffiliFlow AI is a full-stack SaaS platform that automates affiliate marketing workflows. Import products from platforms like Meesho, Amazon, and Flipkart — add your custom margin, generate viral marketing content with AI, schedule social media posts, and track performance with analytics.

## Features

- **Product Import System** — Manual add, CSV import, custom margin pricing
- **AI Content Generator** — Instagram captions, reel scripts, carousel content, YouTube scripts, shorts, hashtags, product descriptions powered by Claude AI
- **Social Media Scheduler** — Calendar view, post queue, multi-platform scheduling
- **Public Affiliate Store** — Branded store page with affiliate link redirect and click tracking
- **Analytics Dashboard** — Clicks, views, conversions, revenue tracking with charts
- **User Plans** — Free (10 products, 20 AI generations/month) and Pro tiers
- **Dark/Light Mode** — Full theme support with smooth transitions
- **Responsive Design** — Mobile-first, works on all devices

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, Tailwind CSS, Framer Motion
- **Backend:** Next.js API Routes
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth (Email/Password + Google)
- **AI:** Anthropic Claude API
- **Hosting:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase project
- Anthropic API key

### Installation

```bash
git clone <repo-url>
cd AI-Affiliate-Marketing-Automation-Platform
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_FIREBASE_*` — Firebase client config
- `FIREBASE_ADMIN_*` — Firebase Admin SDK credentials
- `ANTHROPIC_API_KEY` — Claude AI API key

### Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable **Authentication** (Email/Password + Google providers)
3. Enable **Firestore Database**
4. Copy config values to `.env.local`
5. Generate a service account key for Admin SDK

### Test Login Credentials

- **Email:** `testuser@affiliflow.com`
- **Password:** `Test@1234`

### Development

```bash
npm run dev
```

Open http://localhost:3000

### Build

```bash
npm run build
npm start
```

### Deploy to Vercel

```bash
npx vercel
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Login, Register pages
│   ├── (dashboard)/       # Dashboard pages (protected)
│   │   ├── dashboard/     # Overview
│   │   ├── products/      # Product management
│   │   ├── content/       # AI content library & generator
│   │   ├── scheduler/     # Social media scheduler
│   │   ├── store/         # Store settings
│   │   ├── analytics/     # Performance analytics
│   │   └── settings/      # User settings & plans
│   ├── store/             # Public affiliate store
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Reusable UI primitives
│   ├── layout/           # Sidebar, topbar, navigation
│   ├── auth/             # Auth forms
│   └── theme/            # Theme toggle
├── lib/                   # Utilities and services
│   ├── firebase/         # Firebase config & helpers
│   ├── ai/               # AI client, prompts, generation
│   └── csv/              # CSV parser
├── context/              # React context providers
├── hooks/                # Custom React hooks
└── types/                # TypeScript types
```

## Legal Compliance

- Only uses official APIs or user-provided product data
- No scraping of protected content
- Affiliate links are clearly labeled with disclosure
- Respects platform policies

## License

MIT
