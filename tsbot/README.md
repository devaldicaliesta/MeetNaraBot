# TSbot

Halaman chat penuh dari Nara untuk ditampilkan di IMTS lewat iframe. Dipublikasikan ke Cloudflare Pages di `https://tsbot-nara.pages.dev` (cadangan: `https://nara-tsbot.pages.dev`). Project `tsbot` tidak dipakai karena `tsbot.pages.dev` tidak pernah aktif di Cloudflare (522 / NXDOMAIN).

Isinya hanya widget Nara (`public/widget.js` dalam `mode="inline"`) yang disalin saat build, jadi halaman tidak memuat skrip dari domain lain.

## Tampilan dan menu kategori

Tampilan TSbot mengikuti desain "Menu kategori TSBOT":
- header biru dengan judul TSBOT,
- kartu kategori,
- daftar pertanyaan siap pakai per kategori,
- tombol "Kembali ke menu".

Semua isinya ada di `tsbot/menu.json`:
- `accent`: warna utama (`#rrggbb`).
- `title`, `subtitle`: judul dan subjudul di header.
- `heading`, `intro`: sapaan di layar awal.
- `back`, `placeholder`, `note`: label tombol kembali, contoh di kolom tanya, dan catatan di bawahnya.
- `categories`: daftar kategori. Setiap kategori punya `name`, `desc`, `icon` (data path SVG 24×24) dan `issues` (pertanyaan yang dikirim saat diklik).

Batas isi menu:
- maksimal 12 kategori,
- maksimal 12 pertanyaan per kategori.

`scripts/build-tsbot.mjs` memeriksa file ini. Kalau bentuknya salah, build gagal. Setelah lolos, isinya ditanam di halaman sebagai blok data JSON, bukan skrip. Untuk mengubah menu, edit file ini lalu jalankan workflow **Deploy TSbot**.

## Pengaturan sekali

1. Token `CLOUDFLARE_API_TOKEN` perlu izin **Cloudflare Pages: Edit** (selain izin yang sudah dipakai `deploy.yml`).
2. Isi repository variables (Settings › Secrets and variables › Actions › Variables):
   - `NARA_API_URL`: origin worker Nara, mis. `https://nara.<subdomain>.workers.dev`
   - `NARA_BOT_ID`: id bot yang dipakai (kosong = bot platform). Workflow deploy Nara meneruskannya ke Worker sebagai `PERMANENT_BOTS`, jadi akun pemilik bot ini tidak kena batas 7 hari dan tidak dihapus cron. Jalankan ulang workflow **Deploy to Cloudflare** setelah mengisi atau mengubahnya.
   - `IMTS_ORIGIN`: origin IMTS yang boleh meng-iframe, mis. `https://imtsbot.pages.dev` (pisahkan dengan koma bila lebih dari satu)
3. Bot TSbot otomatis hanya menjawab dari `https://tsbot-nara.pages.dev`. Workflow **Deploy to Cloudflare** mengirim `PERMANENT_BOT_ORIGINS` ke Worker, jadi situs lain tidak bisa memakai kuotanya. Bila TSbot ada di alamat lain (misalnya cadangan `nara-tsbot.pages.dev`), isi repository variable `TSBOT_ORIGINS` dengan alamat itu, lalu jalankan ulang workflow deploy. Domain tambahan bisa diisi di dashboard (*allowed origins*). Domain itu ditambahkan, tidak menggantikan.
4. Push ke branch `tsbot` atau jalankan workflow **Deploy TSbot** secara manual.

## Kecepatan jawaban menu

Workflow **Warm TSbot answers** (`.github/workflows/tsbot-warm.yml`) menanyakan setiap pertanyaan di `tsbot/menu.json` satu kali ke Nara. Jawabannya masuk ke cache jawaban, sehingga klik di menu langsung dijawab dari cache tanpa menunggu model AI.

- Berjalan otomatis setelah **Deploy TSbot** atau **Deploy to Cloudflare** berhasil, dan setiap hari pukul 06:41 WIB. Bisa juga dijalankan manual dari tab Actions.
- Jawaban di cache berlaku 7 hari, dan cache dimulai ulang kalau dokumen atau pengaturan bot berubah. Pertanyaan yang masih ada di cache tidak memanggil model AI, jadi yang benar-benar diproses ulang hanya jawaban yang sudah kedaluwarsa.
- Antar-pertanyaan diberi jeda 7 detik karena API publik membatasi 10 pertanyaan per menit. Satu putaran untuk 17 pertanyaan makan waktu sekitar 2 menit.
- Kalau ada pertanyaan yang gagal, run tetap hijau dan menampilkan peringatan (misalnya dokumen belum siap atau kuota habis).
- Pertanyaan yang ditolak bot karena tidak tercakup dokumen ditandai `TOLAK` di log, dan run menampilkan peringatan berisi daftar pertanyaannya. Untuk pertanyaan seperti itu, tambahkan topiknya ke dokumen referensi atau hapus pertanyaannya dari `tsbot/menu.json`.
- Cache hanya bekerja kalau opsi cache jawaban di pengaturan bot tetap menyala (bawaannya menyala).

Uji lokal ke mock:

```bash
NARA_API_URL=http://127.0.0.1:8799 WARM_DELAY_MS=0 node scripts/warm-tsbot-cache.mjs
```

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
