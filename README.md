# TanyaSaya v2

Chatbot yang menjawab pertanyaan pengunjung **hanya dari satu dokumen milik Anda**, lengkap dengan nomor sumber yang bisa dicek. Ditenagai **Gemini 3.8 Flash**, berjalan di **Cloudflare Workers** (paket gratis), dan dipasang di website mana pun dengan dua baris kode.

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
| Model | `llama-3.1-8b-instruct` (sudah dihentikan Cloudflare) | Gemini 3.8 Flash → 3.5 Flash-Lite → GLM-4.7-Flash → Llama 3.1 8B fast |
| Keamanan | API key contoh tertanam di kode; key dikirim balik ke browser | Key **tidak pernah ditampilkan**; honeypot, kuota harian, batas login |
| Widget | CORS rusak di domain lain, CSS global bisa bentrok | CORS benar, **Shadow DOM**, tema terang/gelap, mobile layar penuh |
| Dashboard | Satu halaman + textarea JSON | 7 menu, form terstruktur, **X-ray hasil pencarian**, riwayat pertanyaan |
| Bahasa | Indonesia saja | **ID/EN** di dashboard, widget, halaman demo, dan semua pesan server |

> **Penting untuk pengguna v1:** API key Gemini dan Hugging Face yang dulu tertanam di `admin.html` dan `dev-server.mjs` sudah ikut tersebar bersama kode. **Cabut (revoke) kedua kunci itu** di Google AI Studio dan Hugging Face, lalu buat kunci baru.

## Pasang dari nol

Prasyarat: Node.js 20+, akun Cloudflare, dan kunci Gemini dari [Google AI Studio](https://aistudio.google.com/apikey).

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

## Anti-bot & interaksi organik
Tidak ada kode yang membuat interaksi buatan. Endpoint chat publik dilindungi:
- Field honeypot tersembunyi di widget (bot pengisi form otomatis ditolak).
- Permintaan tanpa `User-Agent` ditolak.
- Batas per menit per IP, serta batas harian per IP dan total (disimpan di D1 sebagai hash harian bergaram, bukan IP asli).
- Daftar domain yang diizinkan (CORS).
- Statistik dashboard hanya menghitung pertanyaan dari widget. Uji coba admin dicatat terpisah.

## Pengembangan lokal
- `npm run dev:mock`: server mock tanpa akun Cloudflare (`ADMIN_PASSWORD=dev`). Jawabannya dirakit dari potongan teratas, bukan dari Gemini. Cocok untuk mengerjakan tampilan.
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
- Parameter `reasoning_effort` di endpoint OpenAI-compatible Gemini untuk `gemini-3.8-flash`.
