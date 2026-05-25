# LVM Tracking — BranchX KC Pulogadung

Tracker akuisisi **Livin' & Livin' Merchant** untuk tim BranchX KC Pulogadung. Dibangun dengan Next.js 16, shadcn/ui, Tailwind v4, Cloudflare D1 (via HTTP), Drizzle ORM, dan Google Gemini.

## Fitur

- 🔐 Login per-user (username + password) dengan role **admin** / **staff**. Admin punya halaman `/admin/users` untuk kelola anggota tim. Session pakai JWT (signed dengan `JWT_SECRET`).
- 📋 Daftar merchant dengan filter status dan pencarian.
- 🗺️ Peta interaktif (Leaflet + OpenStreetMap) dengan pin berwarna per status.
- ✍️ Catat kunjungan: dikte suara (Web Speech API, `id-ID`) **+** ekstraksi insight otomatis pakai Gemini (pain points, bank yang dipakai, merchant app yang dipakai, kebutuhan, referral merchant lain).
- 📈 Pipeline 5 tahap: Lead → Livin' aktif (tunggu H+1 / Percepatan) → Merchant aktif → Selesai (kartu/QRIS diantar).
- 📊 Dashboard: progress harian vs target 10 merchant, KPI, dan daftar follow-up.

## Setup lokal

### 1. Install dependencies

```bash
bun install
```

### 2. Siapkan environment

Salin `.env.example` ke `.env.local` lalu isi:

```env
JWT_SECRET=ganti-dengan-string-acak-minimal-32-karakter

# Gemini
GEMINI_API_KEY=your-gemini-api-key

# Cloudflare D1 (HTTP API)
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_D1_DATABASE_ID=your-cloudflare-d1-database-id
CLOUDFLARE_D1_TOKEN=your-cloudflare-api-token-with-d1-edit-permission

# Hanya dipakai untuk membuat admin pertama via `bun run db:seed`
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ganti-dengan-password-yang-kuat
ADMIN_NAME=Admin BranchX
```

**Cara dapat Cloudflare API token:**

1. Buka https://dash.cloudflare.com/profile/api-tokens
2. **Create Token** → custom token
3. Permission: **Account → D1 → Edit**
4. Account Resource: pilih akun yang punya database D1
5. Copy token-nya ke `CLOUDFLARE_D1_TOKEN`.

**Cara dapat Account ID:** ada di kanan dashboard Cloudflare saat lihat database D1.

### 3. Apply schema ke D1

```bash
bun run db:push
```

Script idempotent: baca semua file SQL di `drizzle/`, lacak yang sudah pernah dijalankan di tabel `_migrations`, push lewat HTTP API D1.

### 4. Buat admin pertama

```bash
bun run db:seed
```

Pakai `ADMIN_USERNAME` + `ADMIN_PASSWORD` dari `.env.local` untuk membuat user admin pertama. Idempotent — aman dijalankan ulang. Setelah admin ada, kelola semua user dari UI `/admin/users`.

### 5. Jalankan dev

```bash
bun run dev
```

Buka http://localhost:3000 → akan redirect ke `/login`. Masuk dengan username + password admin tadi. Sebagai admin, klik ikon perisai 🛡️ di kanan-atas untuk membuka **Manajemen User** dan tambah anggota tim lain.

## Workflow lapangan

1. **Tambah merchant baru** dari tab **Tambah** (capture lokasi GPS langsung).
2. Catat kunjungan: tulis manual atau **tap ikon mic** untuk dikte Bahasa Indonesia.
3. Klik **Ekstrak insight dengan Gemini** — AI ekstrak pain points, bank yang dipakai, kebutuhan, referral. Bisa diedit sebelum disimpan.
4. Pilih jenis aktivitas (Survei, Daftar Livin', Daftar Merchant, Antar kartu, dll) — status pipeline ikut update otomatis.
5. Pantau **Dashboard** untuk progress harian dan daftar follow-up (yang sudah tunggu H+1).
6. **Peta** menampilkan semua merchant berlokasi dengan pin per status.

## Deploy ke Vercel

1. Push repo ini ke GitHub.
2. **Import project** di Vercel → pilih repo.
3. **Environment Variables** — tambahkan semua var dari `.env.local`.
4. Build settings: default (Next.js auto-detected).
5. Deploy.

Tidak perlu wrangler / Workers binding — query D1 lewat REST API.

## Struktur proyek

```
src/
├── app/
│   ├── (app)/                ← layout berisi bottom nav, semua route auth-protected
│   │   ├── dashboard/        ← KPI harian
│   │   ├── daftar/           ← list + filter
│   │   ├── peta/             ← Leaflet map
│   │   ├── tambah/           ← form add merchant
│   │   └── merchants/[id]/
│   │       ├── page.tsx      ← detail merchant + timeline
│   │       └── kunjungan/    ← form catat kunjungan + Gemini extract
│   ├── login/                ← halaman login
│   ├── logout/               ← route handler
│   ├── layout.tsx
│   └── page.tsx              ← redirect ke /dashboard
├── components/
│   ├── ui/                   ← shadcn primitives
│   ├── voice-textarea.tsx    ← textarea + mic Web Speech
│   ├── merchant-map.tsx      ← Leaflet map (client only)
│   └── ...
├── lib/
│   ├── auth.ts               ← jose JWT cookie session
│   ├── db/
│   │   ├── client.ts         ← Drizzle sqlite-proxy ↔ D1 HTTP
│   │   └── schema.ts
│   ├── gemini.ts             ← Gemini extraction
│   ├── queries.ts            ← server-only DB queries
│   └── constants.ts          ← label, warna, target harian
└── proxy.ts                  ← Next 16 middleware (replaces middleware.ts)

drizzle/                      ← migrations
scripts/migrate.ts            ← push migrations ke D1 lewat HTTP
```

## Catatan teknis

- **Next.js 16:** middleware sekarang disebut **proxy** dan filenya `proxy.ts` (di dalam `src/` kalau pakai `src/` layout).
- **Tailwind v4:** semua token di `globals.css` via `@theme inline`. shadcn/ui pakai gaya New York.
- **D1 via HTTP:** pakai `drizzle-orm/sqlite-proxy` + REST API Cloudflare — jadi tidak butuh Workers binding. Latency ~150ms ekstra dibanding binding native.
- **Gemini model:** `gemini-2.5-flash` dengan response schema (structured JSON output).
- **Voice input:** Web Speech API hanya jalan di Chromium-based browser (Chrome/Edge/Brave) di mobile & desktop.
