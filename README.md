# MeetNaraBot v2

Chatbot yang menjawab pertanyaan pengunjung **hanya dari satu dokumen milik Anda**, lengkap dengan nomor sumber yang bisa dicek. Ditenagai **Gemini 3.5 Flash**, berjalan di **Cloudflare Workers** (paket gratis), dan dipasang di website mana pun dengan dua baris kode.

- `PROMPT.md`: prompt lengkap 7 layer (bahasa Inggris) untuk membangun ulang aplikasi ini dengan Gemini.
- Isi 7 layer prompt chatbot ada di `src/settings.ts` (`DEFAULT_LAYERS`); ubah di sana bila perlu.
- `public/admin.html`: dashboard pemilik.
- `public/widget.js` + `widget.css`: widget chat (Web Component, Shadow DOM).
- `src/`: Worker API (Hono) dan pipeline RAG.

## Yang baru di v2

| Area | v1 | v2 |
|---|---|---|
| Pencarian | Vektor saja, ambang kaku | **Hibrida** vektor + kata kunci (D1 FTS5) dengan RRF, rerank opsional, potongan tetangga, batas konteks |
| Pertanyaan lanjutan | Riwayat tidak pernah terkirim (bug format `role`) | Riwayat terkirim + **pertanyaan ditulis ulang** jadi mandiri sebelum dicari |
| Potongan dokumen | Per paragraf, label "Bagian n" | Mengikuti **judul bagian** (`Bab › Subbab`), tumpang-tindih kalimat, CSV per baris "Kolom: nilai" |
| Format file | .md .txt .csv .json | + **.pdf** (berbasis teks), **.docx**, .html, diproses di browser |
| Embedding | bge-m3 (tetap) | **Gemini embedding** (RETRIEVAL_QUERY/DOCUMENT, 1024 dim) atau bge-m3 |
| Prompt | Satu blok aturan | Prompt sistem **7 layer** (peran, konteks, tugas, pengetahuan, aturan, format, contoh + cek mutu) |
| Jawaban | JSON sekaligus, sitasi tidak pernah muncul | **Streaming** + sitasi `[n]` yang bisa diklik ke potongan sumber |
| Model | `llama-3.1-8b-instruct` (sudah dihentikan Cloudflare) | Gemini 3.5 Flash → 3.5 Flash-Lite → gpt-oss-120b (Hugging Face) → GLM-4.7-Flash → Llama 3.1 8B fast |
| Keamanan | API key contoh tertanam di kode; key dikirim balik ke browser | Key **tidak pernah ditampilkan**; honeypot, kuota harian, batas login |
| Widget | CORS rusak di domain lain, CSS global bisa bentrok | CORS benar, **Shadow DOM**, tema terang/gelap, mobile layar penuh |
| Dashboard | Satu halaman + textarea JSON | 7 menu, form terstruktur, **X-ray hasil pencarian**, riwayat pertanyaan |
| Bahasa | Indonesia saja | **ID/EN** di dashboard, widget, halaman demo, dan semua pesan server |

> **Penting untuk pengguna v1:** API key Gemini dan Hugging Face yang dulu tertanam di `admin.html` dan `dev-server.mjs` sudah ikut tersebar bersama kode. **Cabut (revoke) kedua kunci itu** di Google AI Studio dan Hugging Face, lalu buat kunci baru.

## Pasang dari nol

Prasyarat: Node.js 22.18+, akun Cloudflare, dan kunci Gemini dari [Google AI Studio](https://aistudio.google.com/apikey).

```bash
npm install
npx wrangler login

# 1. Database & indeks vektor (dimensi 1024 untuk Gemini maupun bge-m3)
npx wrangler d1 create tanyasaya-db          # salin database_id ke wrangler.jsonc
npx wrangler vectorize create tanyasaya-index --dimensions=1024 --metric=cosine

# 2. Tabel
npm run db:migrate

# 3. Rahasia (tidak pernah ditulis di file)
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put GEMINI_API_KEY

# 4. Terbitkan
npm run deploy
```

Lalu buka `https://<nama-worker>.workers.dev/admin.html`:
1. Masuk dengan `ADMIN_PASSWORD`.
2. **Dokumen** → unggah satu file. Paling akurat: Markdown dengan judul `#`/`##`.
3. **Uji coba** → tanyakan beberapa hal, lalu lihat panel *Hasil pencarian* untuk menyetel ambang.
4. **Pasang widget** → isi domain website Anda, lalu salin kodenya.

### Deploy otomatis dari GitHub (disarankan)
Workflow `.github/workflows/deploy.yml` menerbitkan Worker setiap kali ada push ke `main`, jadi Anda tidak perlu menjalankan perintah di atas satu per satu. Workflow ini membuat database D1 dan indeks Vectorize bila belum ada, menjalankan migrasi, lalu `wrangler deploy`.

1. Buat API token di Cloudflare (**My Profile → API Tokens → Create Token → Custom token**) dengan izin akun: *Workers Scripts: Edit*, *D1: Edit*, *Vectorize: Edit*, *Workers AI: Read*, *Account Settings: Read*.
2. Salin **Account ID** dari halaman Workers & Pages di dashboard Cloudflare.
3. Di GitHub, buka **Settings → Secrets and variables → Actions → New repository secret**, lalu tambahkan:
   - `CLOUDFLARE_API_TOKEN` dan `CLOUDFLARE_ACCOUNT_ID` (wajib)
   - `ADMIN_PASSWORD` (wajib sekali sebelum masuk dashboard pertama kali)
   - `GEMINI_API_KEY` (disarankan; dipakai untuk menjawab dan untuk embedding dokumen)
   - `HF_TOKEN` (opsional; cadangan model `openai/gpt-oss-120b` lewat Hugging Face)
4. Push ke `main`, atau buka tab **Actions → Deploy to Cloudflare → Run workflow**. Alamat Worker muncul di log langkah *Deploy Worker*.

Setelah deploy, workflow mengindeks `docs/knowledge/meetnarabot.md` sebagai dokumen referensi bot, tetapi hanya jika belum ada dokumen aktif. Untuk itu workflow membuat token acak `DEPLOY_TOKEN` di setiap run. Token ini hanya bisa mengindeks dokumen dan menyambungkan Telegram, jadi bot langsung bisa menjawab walau `ADMIN_PASSWORD` belum diset. Dokumen yang Anda unggah lewat dashboard tidak akan tertimpa. Untuk mengganti dokumen aktif dengan isi terbaru file itu, jalankan workflow secara manual dan centang **reseed**. Isi secret `GEMINI_API_KEY` sebelum indeks pertama agar dokumen memakai embedding Gemini; embedding tidak bisa diganti tanpa mengindeks ulang.

`database_id` di `wrangler.jsonc` sengaja dibiarkan `REPLACE_WITH_D1_ID`; workflow mengisinya sendiri saat deploy.

### Upgrade dari v1
Jalankan `npm run db:migrate`. Migrasi `0002` menambah tabel baru dan mengisi indeks kata kunci dari potongan yang sudah ada. Konfigurasi lama (`bot_config`) dipindahkan otomatis saat dashboard pertama kali dibuka, dan kunci API lama ikut dipindah ke penyimpanan kunci. Nama binding di `wrangler.jsonc` berubah (`tanyasaya-db`, `tanyasaya-index`); jika ingin tetap memakai `rag-db`/`rag-index` milik v1, ganti saja namanya di file itu.

## Pasang di website

```html
<script src="https://<nama-worker>.workers.dev/widget.js" defer></script>
<tanyasaya-chat api-base="https://<nama-worker>.workers.dev"></tanyasaya-chat>
```
Atribut opsional: `position="left"`, `theme="dark"` atau `theme="auto"`, `lang="id"` atau `lang="en"` (bawaan: otomatis dari bahasa browser). Pengunjung juga bisa mengganti bahasa lewat tombol **ID/EN** di header widget. Tag lama `<rag-chat-widget>` tetap berfungsi.

### Dua bahasa (ID/EN)
- **Dashboard**: tombol ID | EN di halaman masuk dan sidebar.
- **Widget**: tombol di header; pilihan disimpan di browser pengunjung. Bot menjawab dalam bahasa pertanyaan, dan pesan penolakan memakai versi bahasa yang aktif.
- **Teks khusus English** (sapaan, label tombol, pesan penolakan, saran pertanyaan) diisi di *Bot & model → Teks versi English*. Saran pertanyaan otomatis dibuat sekaligus dalam dua bahasa.

## Cara kerja RAG

```
pertanyaan ─► tulis ulang (jika ada riwayat) ─┬─► vektor (Gemini / bge-m3) ─┐
                                              └─► kata kunci (FTS5 bm25) ───┴─► RRF ─► gerbang skor
   ─► rerank (opsional) ─► top-K ─► gabung potongan tetangga ─► prompt 7 layer ─► Gemini (streaming)
```
- **Gerbang skor**: jika tidak ada potongan yang cukup mirip, bot langsung menjawab dengan pesan penolakan tanpa memanggil AI. Ini menghemat kuota dan mencegah jawaban karangan.
- **Sitasi**: AI wajib menulis `[n]` setelah tiap fakta; widget mengubahnya menjadi tombol yang membuka potongan sumber.
- **Basa-basi**: pesan pendek yang isinya hanya sapaan ("halo", "selamat pagi kak", "mau tanya dong"), terima kasih, salam penutup, "kamu siapa?", atau "oke" dijawab dengan balasan tetap yang ramah sebelum masuk pencarian, lengkap dengan contoh pertanyaan. Tidak ada panggilan AI dan kuota tidak terpakai. Pesan yang berisi pertanyaan sungguhan ("halo, berapa biayanya?") tetap diproses RAG seperti biasa. Polanya ada di `src/smalltalk.ts`.

## Telegram & WhatsApp

Bot yang sama juga bisa menjawab lewat chat Telegram dan WhatsApp. Dokumen, pengaturan, kuota, dan riwayat pertanyaannya sama dengan widget, dan riwayat menampilkan label Telegram/WhatsApp. Perintah yang dikenali adalah `/start`, `/help`, dan `/reset` (di WhatsApp cukup ketik `reset` atau `bantuan`).

### Telegram
1. Chat [@BotFather](https://t.me/BotFather) di Telegram, kirim `/newbot`, lalu salin token yang diberikan.
2. Simpan token itu sebagai repository secret **`TELEGRAM_BOT_TOKEN`** di GitHub, lalu jalankan workflow deploy.
3. Workflow otomatis menyambungkan webhook ke `https://<worker>/api/channels/telegram` jika `ADMIN_PASSWORD` juga sudah diset. Anda juga bisa menekan **Sambungkan** di dashboard → Pasang widget → Telegram & WhatsApp.

Webhook diamankan dengan `secret_token` yang diturunkan dari token bot. Permintaan tanpa header yang cocok ditolak (401). Bot hanya menjawab di chat pribadi; di grup, bot hanya membalas perintah dengan ajakan chat pribadi.

### WhatsApp (WhatsApp Cloud API resmi dari Meta)
1. Buat aplikasi di [Meta for Developers](https://developers.facebook.com/) dengan produk **WhatsApp**, lalu tambahkan nomor telepon bisnis.
2. Simpan repository secret berikut, lalu jalankan workflow deploy:
   - `WHATSAPP_TOKEN`: access token permanen (System User token)
   - `WHATSAPP_PHONE_NUMBER_ID`: ID nomor telepon, bukan nomornya
   - `WHATSAPP_VERIFY_TOKEN`: teks acak buatan Anda sendiri
   - `WHATSAPP_APP_SECRET`: App Secret di App settings → Basic
3. Di WhatsApp → Configuration, isi **Callback URL** `https://<worker>/api/channels/whatsapp` dan **Verify token** yang sama dengan `WHATSAPP_VERIFY_TOKEN`. Setelah itu, langganan field **messages**.

Setiap pesan masuk diverifikasi dengan tanda tangan `X-Hub-Signature-256` (HMAC dari App Secret). Pesan yang dikirim ulang oleh Meta hanya dijawab sekali. Nomor telepon dan ID Telegram tidak disimpan mentah: riwayat percakapan memakai hash bergaram dan dihapus setelah satu hari tidak aktif.

## QA dengan Playwright

```bash
npm run qa
```
Perintah ini menjalankan typecheck, tes unit (format pesan Telegram/WhatsApp, deteksi sapaan), lalu 24 tes Playwright:
- **ui**: landing page, widget, dan dashboard di server mock. Ini mencakup jawaban dengan sitasi, sapaan, ganti bahasa, password salah, dan tidak ada scroll ke samping di layar 390 px maupun 1440 px.
- **worker**: Worker asli yang dijalankan lokal (`wrangler dev --local`, D1 lokal) dengan server Telegram/WhatsApp palsu. Ini mencakup header keamanan, kunci login admin, batas ukuran request, secret yang tidak bocor, webhook Telegram dan WhatsApp (autentikasi, sapaan, jawaban bersumber, cadangan saat AI tidak tersedia, pesan ganda, grup), dan verifikasi webhook WhatsApp.

Tes ini tidak memakai key sungguhan dan tidak menghubungi Telegram, Meta, Google, atau Cloudflare. Di GitHub, workflow **QA** berjalan untuk setiap pull request dan push ke branch lain. Deploy ke `main` hanya jalan setelah QA lulus.

## Keamanan
Ringkasan audit dan penguatan ada di [`SECURITY.md`](SECURITY.md): throttle login yang tahan isolate, batas ukuran request, header CSP/anti-framing di `public/_headers`, dan salt acak untuk hash IP.

Kalau semua penyedia AI kehabisan kuota, pengunjung tidak melihat galat. Bot menampilkan bagian dokumen yang paling relevan beserta sumbernya, ditambah pesan yang ramah.

## Anti-bot & interaksi organik
Tidak ada kode yang membuat interaksi buatan. Endpoint chat publik dilindungi:
- Field honeypot tersembunyi di widget (bot pengisi form otomatis ditolak).
- Permintaan tanpa `User-Agent` ditolak.
- Batas per menit per IP, serta batas harian per IP dan total (disimpan di D1 sebagai hash harian bergaram, bukan IP asli).
- Daftar domain yang diizinkan (CORS).
- Statistik dashboard hanya menghitung pertanyaan dari widget. Uji coba admin dicatat terpisah.

## Pengembangan lokal
- `npm run dev:mock`: server mock tanpa akun Cloudflare (`ADMIN_PASSWORD=dev`, butuh Node.js 22.18+ karena memuat `src/smalltalk.ts` langsung). Jawabannya dirakit dari potongan teratas, bukan dari Gemini. Cocok untuk mengerjakan tampilan.
- `npm run dev`: Worker asli dengan binding jarak jauh (`wrangler dev --remote`). Salin `.env.example` ke `.dev.vars`.
- `npm run typecheck`

## Batas paket gratis Cloudflare (perkiraan)
| Layanan | Kuota gratis | Catatan |
|---|---|---|
| Workers | 100.000 permintaan/hari, CPU 10 ms | Parsing dokumen dilakukan di browser |
| D1 | 5 jt baris dibaca, 100 rb ditulis/hari | ±3 tulisan per pertanyaan (log + kuota) |
| Vectorize | 5 jt dimensi tersimpan | ±4.800 potongan × 1024 dimensi |
| Workers AI | 10.000 neuron/hari | Hanya dipakai jika Gemini tidak tersedia / embedding bge-m3 |

## Pemecahan masalah
| Gejala | Penyebab & solusi |
|---|---|
| Sapaan dijawab "tidak ada di dokumen" | Sudah ditangani sejak versi ini (`src/smalltalk.ts`). Jika ada sapaan daerah yang belum dikenali, tambahkan polanya di file itu. |
| Bot sering menjawab "tidak ada di dokumen" | Turunkan *Ambang kemiripan* di menu Pencarian; cek skor nyata di Uji coba. Pastikan dokumen punya judul bagian. |
| Jawaban mengambil potongan yang salah | Naikkan ambang, aktifkan pencarian hibrida, perkecil ukuran potongan, lalu unggah ulang. |
| Widget di website lain: "Domain ini belum diizinkan" | Tambahkan domain persis (`https://…`, tanpa garis miring di akhir) di menu Pasang widget. |
| "Embedding Gemini dipilih tetapi kunci Gemini belum diatur" | Simpan kunci Gemini, atau pilih bge-m3 di menu Bot & model. |
| Dokumen baru belum bisa dicari | Indeks Vectorize butuh beberapa detik setelah unggah. |
| Semua penyedia gagal | Klik **Tes** di tiap baris urutan model; lihat pesan galatnya di panel Uji coba. |
| Log Worker | `npx wrangler tail` |

## Perlu diverifikasi saat deploy pertama (VERIFY)
- Bentuk respons streaming `@cf/zai-org/glm-4.7-flash` (kode menerima format `response` maupun `choices[].delta`).
- Skala skor `@cf/baai/bge-reranker-base` (dinormalisasi dengan sigmoid bila di luar 0–1).
- Parameter `reasoning_effort` di endpoint OpenAI-compatible Gemini untuk `gemini-3.5-flash`.
- Model embedding `gemini-embedding-2` dengan `outputDimensionality: 1024`.

## Lisensi

MeetNaraBot dirilis dengan [Apache License 2.0](LICENSE). Anda boleh memakai, mengubah, dan mendistribusikan ulang kode ini, termasuk untuk keperluan komersial, selama menyertakan file `LICENSE` dan `NOTICE` serta mencantumkan perubahan yang Anda buat. Hak cipta © 2026 devaldicaliesta.
