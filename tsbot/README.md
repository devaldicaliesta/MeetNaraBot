# TSbot

Halaman chat penuh dari Nara untuk ditampilkan di IMTS lewat iframe. Dipublikasikan ke Cloudflare Pages di `https://tsbot.pages.dev`. Bila subdomain itu sudah dipakai orang lain, workflow otomatis memakai `https://imtsbot.pages.dev` (ImTSbot).

Isinya hanya widget Nara (`public/widget.js` dalam `mode="inline"`) yang disalin saat build, jadi halaman tidak memuat skrip dari domain lain.

## Pengaturan sekali

1. Token `CLOUDFLARE_API_TOKEN` perlu izin **Cloudflare Pages: Edit** (selain izin yang sudah dipakai `deploy.yml`).
2. Isi repository variables (Settings › Secrets and variables › Actions › Variables):
   - `NARA_API_URL`: origin worker Nara, mis. `https://nara.<subdomain>.workers.dev`
   - `NARA_BOT_ID`: id bot yang dipakai (kosong = bot platform)
   - `IMTS_ORIGIN`: origin IMTS yang boleh meng-iframe, mis. `https://imts.example.com` (pisahkan dengan koma bila lebih dari satu)
3. Di dashboard Nara, bila daftar *allowed origins* bot tidak kosong, tambahkan URL TSbot (`https://tsbot.pages.dev` atau `https://imtsbot.pages.dev`; lihat ringkasan run workflow).
4. Push ke branch `tsbot` atau jalankan workflow **Deploy TSbot** secara manual.

## Pasang di IMTS

```html
<!-- ganti dengan https://imtsbot.pages.dev/ bila workflow memakai ImTSbot -->
<iframe src="https://tsbot.pages.dev/" title="TSbot" style="width:100%;max-width:420px;height:640px;border:0"></iframe>
```

Domain yang tidak ada di `IMTS_ORIGIN` ditolak browser (CSP `frame-ancestors`).

## Build dan uji lokal

```bash
NARA_API_URL=https://nara.example.workers.dev IMTS_ORIGIN=https://imts.example.com node scripts/build-tsbot.mjs
```

```bash
npx playwright test --project=tsbot
```
