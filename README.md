# CHARINI Stories — QR Connect & Newsletter

A mobile-first, luxury fashion digital touchpoint and newsletter subscription platform for **CHARINI Stories**, accessed via in-store QR codes.

## Features

- **Mobile-First Luxury Editorial Aesthetic**: Designed for phones, reflecting the quiet luxury and bespoke craft of CHARINI Stories.
- **Brand Channels**:
  - Instagram: [@charini.stories](https://www.instagram.com/charini.stories/)
  - Website: [Visit CHARINI Stories](https://charini-resortwear.vercel.app/stories)
  - WhatsApp: Instant concierge messaging (+94 77 817 8799)
  - Contact: Direct touchpoint dialer (+94 77 817 8799)
  - Store Location: Shop 36, Level 2, One Galle Face
- **Newsletter Subscription**:
  - Multi-select interest preferences (New Prints, Cuts & Styles, Collections, Limited Drops, Promotions, Events).
  - Validation: Email syntax and required preference selection.
  - Duplicate Handling: Automatic preference updates without database errors.
  - QR Source Tracking: Records attribution (e.g. `?source=qr_store`, `qr_packaging`).
- **Supabase Integration**:
  - Secure server-side API endpoint (`/api/newsletter`).
  - Row Level Security (RLS) policies protecting customer emails.
  - In-memory development fallback for instant local testing.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Motion**: Framer Motion
- **Database**: Supabase (PostgreSQL + RLS)

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Environment (Optional for Local)
```bash
cp .env.example .env.local
```
Add your Supabase project credentials in `.env.local` to enable persistent cloud storage.

### 3. Database Schema
Execute the SQL statements in `supabase/schema.sql` in your Supabase SQL editor.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000/connect?source=qr_store](http://localhost:3000/connect?source=qr_store) in your browser.
