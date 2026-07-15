# PRD — "Our Love Story" Website v2
### Improvement dari Landing Page Anniversary Statis Menjadi Web App Dinamis + Admin Panel

**Versi:** 1.0
**Tanggal:** 15 Juli 2026
**Owner:** [Kamu]
**Status:** Draft — siap dieksekusi

---

## 1. Latar Belakang & Masalah

Website "2 Tahun 10 Bulan" versi sekarang sudah bagus secara emosional (envelope reveal, timeline, kuis, surat cinta), tapi punya keterbatasan teknis:

1. **Statis & hardcoded** — semua teks, foto, dan pertanyaan kuis di-hardcode langsung di HTML. Setiap mau update (foto baru, tanggal ulang tahun berikutnya, dsb) harus edit kode manual.
2. **Tidak ada tempat foto asli** — placeholder `taruh foto di sini 📷` belum bisa diisi gambar sungguhan tanpa edit HTML.
3. **Desain surat cinta masih polos** — belum terasa seperti "surat" fisik yang premium (belum ada tekstur kertas, animasi buka-lipat, dsb).
4. **Efek/animasi masih dasar** — burst hearts sudah ada, tapi transisi antar section, scroll reveal, dan micro-interaction lain belum maksimal.
5. **Tidak bisa dikelola non-teknis** — kalau nanti mau dikasih ke orang lain atau dipakai lagi tahun depan, tidak ada cara mudah untuk mengedit isi tanpa buka kode.

## 2. Tujuan Produk

| # | Tujuan | Ukuran Keberhasilan |
|---|--------|----------------------|
| G1 | Desain surat & seluruh visual naik kelas ("terasa premium", bukan template) | Review subjektif + skor Lighthouse Performance ≥ 90 |
| G2 | Animasi/efek terasa halus & "wah" tanpa mengorbankan performa | FPS animasi stabil, tidak ada jank di mobile mid-range |
| G3 | Semua konten (teks, foto, kuis, jumlah kartu timeline) bisa diedit lewat Admin Panel tanpa sentuh kode | 100% string & gambar yang tampil di publik berasal dari database, bukan hardcode |
| G4 | Bisa nambah/kurang jumlah foto & pertanyaan kuis secara dinamis (bukan jumlah tetap) | Admin bisa CRUD unlimited items |
| G5 | Live di internet dengan biaya **Rp0** | Full deploy di free tier Vercel + Supabase |

## 3. Target Pengguna

- **Public visitor** (pacar/kamu): buka link, nikmati experience, isi kuis.
- **Admin** (kamu sendiri): login ke `/admin`, edit semua konten dari dashboard sederhana.

## 4. Scope

### In-scope
- Rebuild dari HTML statis → Next.js app (public site + admin panel dalam 1 project).
- Redesain visual, terutama section **surat cinta** dan **hero envelope**.
- Tambahan animasi: scroll reveal, parallax ringan, page transition, confetti/petal effect, sound-optional toggle.
- Admin panel dengan auth sederhana untuk edit: hero text, timeline items (dinamis jumlahnya + upload foto), quiz questions (dinamis jumlahnya), love letter, footer.
- Upload gambar ke storage (bukan base64 di database).
- Deploy ke Vercel + Supabase, semuanya di free tier.

### Out of scope (v1)
- Multi-user / multi-couple (SaaS). Ini tetap single-tenant, 1 pasangan, 1 admin.
- Native mobile app.
- Payment/monetisasi.
- Komentar publik / guestbook (bisa jadi v2 kalau mau).

## 5. Analisis Website Existing (yang dipertahankan)

Yang **sudah bagus dan dipertahankan konsepnya**, hanya di-rebuild dengan data dinamis + polish visual:
- Palet warna cream/plum/rose/gold/sage — tetap dipakai sebagai design token, hanya diperhalus dengan gradient & shadow yang lebih premium.
- Flow: Hero (envelope) → Timeline → Kuis → Surat → Footer.
- Interaksi: klik amplop → burst hearts, toggle surat, quiz feedback per jawaban.
- Font: Fraunces (serif elegan) + Quicksand + Caveat (handwriting) — dipertahankan, ini kombinasi yang sudah tepat untuk vibe personal/romantis.

## 6. Tech Stack (Direkomendasikan — semua gratis)

| Layer | Pilihan | Alasan |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | 1 codebase untuk public site + admin (API routes), SSR/ISR bagus untuk SEO/share preview, native di Vercel |
| Bahasa | **TypeScript** | Type-safety untuk skema konten dinamis |
| UI Components | **shadcn/ui** | Komponen accessible & bisa dikustom penuh (bukan library berat). Saat development, kamu bisa pakai **shadcn MCP server** di Claude Code/Cursor untuk generate & install komponen langsung lewat perintah natural language — mempercepat proses build admin dashboard (tabel, form, dialog, dsb) |
| Styling | **Tailwind CSS** | Native pairing dengan shadcn, gampang bikin desain surat yang detail (border kertas sobek, tekstur, dsb) |
| Animasi | **Framer Motion (motion/react)** untuk transisi & scroll-reveal, **canvas-confetti** untuk efek taburan hati/kelopak, **GSAP (opsional)** kalau butuh animasi timeline yang lebih kompleks (misal reveal surat seperti kertas terbuka) | Kombinasi ini industry-standard, ringan, dan hasilnya "wah" tanpa berat |
| Alert/Modal cantik | **SweetAlert2** (via `sweetalert2-react-content` atau custom wrapper) | Untuk notifikasi admin (berhasil simpan, konfirmasi hapus, dsb) dan bisa juga dipakai di public site untuk pop-up kecil (misal saat skor kuis sempurna) |
| Database | **Supabase (Postgres)** | Free tier: 500MB DB, 50.000 MAU, unlimited API request, cukup jauh untuk kebutuhan ini |
| Auth Admin | **Supabase Auth** (email+password, cukup 1 akun admin) | Simpel, tidak perlu bikin auth sendiri |
| Storage Foto | **Supabase Storage** (1GB gratis) **atau Cloudinary free tier (~25GB storage + transformasi otomatis)** | Rekomendasi: pakai **Cloudinary** khusus untuk foto (auto-resize/compress, CDN cepat), Supabase tetap untuk teks/data. Ini menghindari cepat penuhnya storage 1GB Supabase kalau foto banyak & resolusi besar |
| Form handling | **react-hook-form + zod** | Validasi form admin (misal minimal 1 jawaban benar per kuis) |
| Hosting | **Vercel (Hobby/free)** | Auto-deploy dari GitHub, cocok untuk Next.js, gratis selama non-komersial (proyek personal seperti ini masuk kategori itu) |
| Drag & drop reorder | **dnd-kit** | Supaya admin bisa urutkan timeline/kuis dengan drag |

> Catatan biaya: Kombinasi Vercel Hobby + Supabase Free + Cloudinary Free = **Rp0/bulan**, cukup untuk trafik personal (dilihat berdua/keluarga terbatas). Satu hal yang perlu diperhatikan: project Supabase gratis akan **auto-pause setelah 7 hari tanpa aktivitas** — solusinya bisa pasang free uptime monitor (misal UptimeRobot) yang ping endpoint tiap beberapa hari supaya project tidak tidur.

## 7. Arsitektur Sistem

```
┌─────────────────────────────┐
│         Vercel (Hosting)     │
│  ┌────────────┐ ┌──────────┐ │
│  │ /  (public) │ │ /admin   │ │
│  │ Next.js SSR │ │ (auth'd) │ │
│  └──────┬─────┘ └────┬─────┘ │
└─────────┼─────────────┼──────┘
          │             │
          ▼             ▼
   ┌─────────────────────────┐
   │   Supabase (Postgres)    │
   │  - site_content          │
   │  - timeline_items        │
   │  - quiz_questions        │
   │  - quiz_options          │
   │  - love_letter           │
   │  - admin auth            │
   └───────────┬──────────────┘
               │
               ▼
   ┌─────────────────────────┐
   │  Cloudinary (Image CDN)  │
   │  - foto timeline         │
   │  - foto hero/opsional    │
   └─────────────────────────┘
```

## 8. Skema Data (Draft)

```sql
-- Konten global (hero, footer, dsb) — 1 row per key
site_content (
  key text primary key,        -- 'hero_title', 'hero_subtitle', 'signoff_name', dst
  value text,
  updated_at timestamptz
)

timeline_items (
  id uuid primary key default gen_random_uuid(),
  order_index int,
  date_label text,              -- "12 Januari 2023 · Momen ke-1"
  title text,
  description text,
  photo_url text,                -- nullable, dari Cloudinary
  created_at timestamptz,
  updated_at timestamptz
)

quiz_questions (
  id uuid primary key default gen_random_uuid(),
  order_index int,
  question text,
  created_at timestamptz
)

quiz_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references quiz_questions(id) on delete cascade,
  label text,
  is_correct boolean,
  order_index int
)

love_letter (
  id int primary key default 1,
  paragraphs jsonb,             -- array of string, supaya jumlah paragraf dinamis
  signoff text
)
```

Semua tabel diatur dengan **Row Level Security (RLS)**: publik hanya boleh `SELECT`, hanya admin (authenticated) yang boleh `INSERT/UPDATE/DELETE`.

## 9. Fitur Detail

### 9.1 Public Site (Redesign)
- **Hero & Envelope**: redesain amplop jadi lebih 3D (layer wax-seal animasi, flap membuka dengan easing lebih halus, subtle paper-texture background), muncul particle/confetti kelopak bunga saat dibuka (bukan cuma emoji melayang).
- **Timeline / Scrapbook**: scroll-reveal per kartu (fade + slide-up saat masuk viewport pakai Framer Motion `whileInView`), foto asli dari Cloudinary dengan efek polaroid tape/rotate ringan, lightbox saat foto diklik.
- **Kuis**: tetap seperti sekarang secara interaksi, tapi feedback jawaban benar memicu SweetAlert2 kecil / confetti mini, progress bar skor.
- **Surat Cinta (fokus utama redesain)**:
  - Tekstur kertas surat premium (subtle grain, deckle-edge border, watermark tipis).
  - Animasi "unfold" — surat terasa seperti dilipat & dibuka (bukan cuma fade), pakai Framer Motion `clipPath`/`scaleY` bertahap per lipatan, atau efek amplop-ke-surat.
  - Font handwriting untuk tanda tangan, dengan animasi "menulis" (stroke-draw via SVG/GSAP) opsional.
  - Wax seal / stamp dekoratif.
- **Micro-interactions**: cursor-follow petal di desktop (opsional, disable di mobile untuk performa), smooth scroll antar section, sedikit parallax pada dekorasi background dots.
- **Dynamic rendering**: semua section membaca dari Supabase (via server component + ISR revalidate, atau realtime kalau ingin update instan tanpa refresh).

### 9.2 Admin Panel (`/admin`)
- **Login** sederhana (email+password via Supabase Auth, 1 akun admin cukup).
- **Dashboard** dengan tab/menu:
  1. **Hero & Footer** — form edit judul, subjudul, nama, pesan surprise amplop.
  2. **Timeline Manager** — list card, tombol "+ Tambah Momen", tiap card bisa: edit judul/tanggal/cerita, upload/ganti foto (drag-drop ke Cloudinary), hapus, **drag untuk urutkan ulang**.
  3. **Kuis Manager** — list pertanyaan, tombol "+ Tambah Pertanyaan", tiap pertanyaan bisa tambah/kurang jumlah pilihan jawaban (minimal 2, tidak dibatasi maksimal), tandai mana jawaban benar, drag reorder.
  4. **Surat Cinta Editor** — rich text sederhana (textarea per paragraf, bisa tambah/hapus paragraf secara dinamis), edit signoff.
  5. **Preview Live** — tombol buka public site di tab baru untuk cek hasil real-time.
- Semua simpan pakai SweetAlert2 untuk konfirmasi ("Yakin hapus momen ini?") dan toast sukses/gagal.
- Validasi form dengan zod (misal: pertanyaan kuis wajib punya tepat 1 jawaban benar).

## 10. Non-Functional Requirements

| Aspek | Requirement |
|---|---|
| Performa | Lighthouse Performance ≥ 90, LCP < 2.5s, foto pakai `next/image` + Cloudinary auto-format/compress |
| Aksesibilitas | Kontras warna cukup, alt text untuk semua foto (bisa diisi admin), animasi respect `prefers-reduced-motion` |
| Keamanan | RLS aktif di semua tabel, admin route diproteksi middleware auth, tidak ada secret di client |
| Mobile-first | Semua animasi & layout dites di viewport kecil dulu |
| Biaya | Rp0/bulan di skala penggunaan personal |

## 11. Roadmap Implementasi

| Fase | Deliverable | Estimasi |
|---|---|---|
| **Fase 0** | Setup repo Next.js + Supabase project + Cloudinary account, migrasi skema DB | 0.5 hari |
| **Fase 1** | Rebuild public site jadi dinamis (baca dari Supabase), belum ada admin, konten via seed data | 1–2 hari |
| **Fase 2** | Redesain visual: surat cinta premium + animasi Framer Motion/GSAP + SweetAlert2 + confetti | 2–3 hari |
| **Fase 3** | Admin panel: auth, CRUD timeline, CRUD kuis, editor surat/hero, upload foto | 2–3 hari |
| **Fase 4** | Polish, testing mobile, Lighthouse tuning, deploy ke Vercel production | 1 hari |

## 12. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Supabase free project auto-pause 7 hari idle | Setup free cron ping (GitHub Actions/UptimeRobot) |
| Storage foto cepat penuh kalau upload resolusi besar | Pakai Cloudinary (auto-compress) + limit upload size di form admin |
| Animasi berlebihan bikin lag di HP lama | Test di low-end device, sediakan reduced-motion fallback |
| Lupa password admin | Pakai email recovery bawaan Supabase Auth |

## 13. Open Questions (perlu keputusan kamu)

1. Admin login cukup 1 akun kamu saja, atau perlu 2 admin (kamu + pasangan)?
2. Mau ada fitur "kirim ucapan"/guestbook dari pengunjung lain (misal teman), atau tetap private untuk berdua saja?
3. Domain custom (misal `namakalian.com`) atau cukup subdomain gratis dari Vercel (`namaproyek.vercel.app`)?

---

**Next step:** setelah PRD ini disetujui, aku bisa langsung mulai bikin struktur project Next.js + skema Supabase-nya. Mau aku lanjutkan ke situ?
