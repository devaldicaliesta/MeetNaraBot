# TSbot

Halaman chat penuh dari Nara untuk ditampilkan di IMTS lewat iframe. Dipublikasikan ke Cloudflare Pages di `https://tsbot-nara.pages.dev` (cadangan: `https://nara-tsbot.pages.dev`). Project `tsbot` tidak dipakai karena `tsbot.pages.dev` tidak pernah aktif di Cloudflare (522 / NXDOMAIN).

Isinya hanya widget Nara (`public/widget.js` dalam `mode="inline"`) yang disalin saat build, jadi halaman tidak memuat skrip dari domain lain.

## Pengaturan sekali

1. Token `CLOUDFLARE_API_TOKEN` perlu izin **Cloudflare Pages: Edit** (selain izin yang sudah dipakai `deploy.yml`).
2. Isi repository variables (Settings › Secrets and variables › Actions › Variables):
   - `NARA_API_URL`: origin worker Nara, mis. `https://nara.<subdomain>.workers.dev`
   - `NARA_BOT_ID`: id bot yang dipakai (kosong = bot platform). Workflow deploy Nara meneruskannya ke Worker sebagai `PERMANENT_BOTS`, jadi akun pemilik bot ini tidak kena batas 7 hari dan tidak dihapus cron. Jalankan ulang workflow **Deploy to Cloudflare** setelah mengisi atau mengubahnya.
   - `PERMANENT_EMAILS` (opsional): email akun yang tidak pernah kedaluwarsa, dipisah koma, mis. akun pemilik situs. Workflow deploy Nara meneruskannya ke Worker.
   - `IMTS_ORIGIN`: origin IMTS yang boleh meng-iframe, mis. `https://imtsbot.pages.dev` (pisahkan dengan koma bila lebih dari satu)
3. Di dashboard Nara, bila daftar *allowed origins* bot tidak kosong, tambahkan URL TSbot (`https://tsbot-nara.pages.dev`; lihat ringkasan run workflow).
4. Push ke branch `tsbot` atau jalankan workflow **Deploy TSbot** secara manual.

## Halaman IMTS (https://imtsbot.pages.dev)

Halaman IMTS ada di `imts/` dan dideploy oleh workflow yang sama ke project Pages `imtsbot`. Isinya judul IMTS dan TSbot dalam iframe:

```html
<iframe src="https://tsbot-nara.pages.dev/" title="Asisten TSbot"></iframe>
```

Halaman IMTS sendiri tidak bisa di-iframe situs lain (`frame-ancestors 'none'`) dan hanya boleh memuat frame dari TSbot (`frame-src`). Domain selain `IMTS_ORIGIN` ditolak browser saat mencoba menampilkan TSbot.

## Build dan uji lokal

```bash
NARA_API_URL=https://nara.example.workers.dev IMTS_ORIGIN=https://imts.example.com node scripts/build-tsbot.mjs
```

```bash
TSBOT_URL=https://tsbot-nara.pages.dev node scripts/build-imts.mjs
```

```bash
npx playwright test --project=tsbot
```
