# Audit keamanan run 5 (2026-11): TSbot, IMTS, dan akun permanen

Metode: [cloudflare/security-audit-skill](https://github.com/cloudflare/security-audit-skill) profil **quick**. Setiap kandidat temuan dicek oleh satu agen verifikator terpisah yang berusaha membantahnya. Checklist tambahan diambil dari [Agentic-Bug-Hunter](https://github.com/awarexone/Agentic-Bug-Hunter): skill `llm-redteam`, `agentic-app-audit`, dan `cicd-security`. Pemeriksaan hanya dilakukan pada kode sumber dan tes lokal. Situs live (imtsbot.pages.dev, tsbot-nara.pages.dev, Worker Nara) tidak di-scan. Kode yang diperiksa adalah commit `c429cf3`, dan rekamannya ada di `audit-2026-11-run5.json` (lolos `validate-findings.cjs`).

Run 1–4 dan audit TSbot sebelumnya tidak diulang. Fokus putaran ini adalah fitur yang belum pernah diaudit (akun permanen dan `PERMANENT_BOTS`), batas antar-klien per IP, rantai pasok workflow deploy, dan iframe IMTS.

## Hasil

| Temuan | Status | Tingkat | Tindakan |
|---|---|---|---|
| Akun permanen aktif secara default, sehingga email orang lain bisa didaftarkan tanpa verifikasi dan **ditahan selamanya**. Audit run 3 menerima risiko pendaftaran tanpa verifikasi hanya karena akun kedaluwarsa dalam 7 hari, dan alasan itu sekarang tidak berlaku. | Terkonfirmasi | Rendah | **Belum diubah di kode** karena ini keputusan produk (ada tesnya). Pilihan: matikan sakelar "Izinkan pengguna memilih akun permanen" di dashboard admin platform, atau izinkan akun permanen hanya untuk email yang sudah diverifikasi. |
| Batas per IP memakai alamat IPv6 penuh, sehingga satu host dengan /64 bisa berganti alamat. Akibatnya dia bisa melewati batas daftar 5/IP, kunci login per IP, dan kuota chat per pengunjung, lalu menghabiskan kuota harian TSbot, kuota daftar global, atau mengunci admin platform. | Terkonfirmasi | Rendah | **Diperbaiki:** `src/net.ts` `clientKey()` mengelompokkan IPv6 per /64 (ada tes unitnya) |
| *Allowed origins* bot TSbot mungkin masih kosong, sehingga situs lain bisa memakai kuota TSbot dari browser pengunjungnya. | Perlu validasi | – | Di dashboard pemilik bot TSbot › Pasang widget, isi hanya `https://tsbot-nara.pages.dev` |
| XSS di widget lewat jawaban AI atau info bot | Ditolak | – | Semua teks di-escape; CSP TSbot `script-src 'self'` |
| CORS memantulkan Origin | Ditolak | – | Tanpa kredensial; hanya data publik |
| SSRF lewat kunci Workers AI akun sendiri | Ditolak | – | Account id wajib 32 hex; host tetap |

## Penguatan yang diterapkan (bukan temuan)

- **Workflow deploy:** `npm ci --ignore-scripts` di job yang memegang `CLOUDFLARE_API_TOKEN`, sehingga skrip install dari dependency yang disusupi tidak bisa membaca token. Semua action dipin ke commit SHA, dan `persist-credentials: false` dipakai di checkout yang tidak perlu push.
- **Iframe IMTS:** `sandbox="allow-scripts allow-same-origin allow-forms"` dan `referrerpolicy="no-referrer"`. TSbot tidak bisa membuka popup, menavigasi halaman IMTS, atau memunculkan dialog. `allow-same-origin` tetap dipakai agar origin asli TSbot tetap dikirim ke API Nara. Ada tes Playwright baru yang mengajukan pertanyaan di dalam iframe ber-sandbox.
- **Header:** `Cross-Origin-Opener-Policy: same-origin` di IMTS dan TSbot, plus `Cross-Origin-Resource-Policy: same-origin` di IMTS.

## Catatan yang tetap berlaku

- Kunci global admin platform (100 kali gagal per 10 menit, lalu password benar pun ditolak) adalah pilihan desain. Siapa pun di internet bisa memicunya dengan sekitar 13 IP, dan setelah perbaikan /64 butuh 13 jaringan /64. Bot TSbot tidak terpengaruh karena dikelola lewat akun pengguna. Pertahanan yang tepat adalah memasang Cloudflare Access di depan `/admin*`, sehingga permintaan tanpa login Access tidak pernah sampai ke Worker.
- Cache poisoning semantik dari run 4 masih berstatus perlu validasi.
- Akun pemilik bot TSbot bersifat permanen dan melindungi isi jawaban yang tampil di IMTS. Pakai kata sandi panjang dan unik untuk akun ini.

## Pengujian

`npm run test:unit` (30 lulus), `npx tsc --noEmit`, Playwright `worker` (41 lulus), serta `ui` dan `tsbot` (24 lulus, termasuk tes sandbox baru), semuanya di mesin lokal tanpa jaringan ke layanan nyata.
