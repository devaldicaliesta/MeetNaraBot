# Audit keamanan TSbot (2026-11)

Metode: [cloudflare/security-audit-skill](https://github.com/cloudflare/security-audit-skill) dalam *guidance mode*, fokus pada batas kepercayaan baru yang ditambahkan TSbot. API publik Nara sendiri sudah diaudit di run 1–3 (`audit-2026-11-run*.json`) dan tidak berubah.

Cakupan: `tsbot/`, `scripts/build-tsbot.mjs`, `.github/workflows/tsbot.yml`, perubahan `public/widget.js` dan `public/widget.css`.

## Batas yang diperiksa

| Batas | Kontrol | Bukti |
| --- | --- | --- |
| Situs lain meng-iframe TSbot (clickjacking) | CSP `frame-ancestors` hanya origin `IMTS_ORIGIN`; kosong = `'none'` | `tests/tsbot` "other sites cannot embed TSbot" |
| Skrip asing di halaman TSbot (XSS) | `script-src 'self'` tanpa `unsafe-inline`; widget disalin dari commit yang sama, tidak dimuat lintas domain | `tests/tsbot` "serves strict security headers", tidak ada pelanggaran CSP di konsol |
| Isi jawaban LLM dirender ke DOM | Widget meng-escape teks sebelum format markdown; nomor sumber dipaksa `Number()` | `public/widget.js` `inline()`, `paintBot()` |
| Nilai build masuk ke HTML/CSP (injeksi konfigurasi) | `NARA_API_URL`/`IMTS_ORIGIN` harus origin https murni, `NARA_BOT_ID` `[a-z0-9]{0,32}`; build gagal bila placeholder tersisa | `scripts/build-tsbot.mjs` |
| Data keluar ke domain lain | `connect-src` hanya origin Nara; `Referrer-Policy: no-referrer`; `credentials: "omit"` | `tsbot/_headers` |
| Workflow CI (script injection) | Variabel dibaca lewat `env`, bukan `${{ }}` di dalam `run`; `permissions: contents: read` | `.github/workflows/tsbot.yml` |

## Hasil

- **Confirmed:** tidak ada.
- **Hardening yang diterapkan:** `data-num` sumber jawaban kini dipaksa angka (sebelumnya nilai dari server dirangkai langsung ke HTML; tidak terjangkau penyerang tanpa menguasai server Nara, jadi bukan temuan).
- **Needs validation (konfigurasi deploy, tidak terlihat di repo):**
  1. *Allowed origins* bot di dashboard Nara. Bila kosong, API publik menerima semua origin (desain bot publik). Disarankan isi URL TSbot (`https://tsbot.pages.dev` atau `https://imtsbot.pages.dev`) agar kuota bot tidak dipakai situs lain.
  2. Izin token Cloudflare: cukup Pages Edit untuk akun ini; jangan pakai Global API Key.
  3. Origin IMTS harus https agar `frame-ancestors` tidak bisa dipenuhi dari jaringan yang disadap.
