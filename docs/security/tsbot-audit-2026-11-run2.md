# Audit keamanan TSbot, run 2 (2026-11)

Audit ini memakai dua alat:

- [cloudflare/security-audit-skill](https://github.com/cloudflare/security-audit-skill), mode audit penuh dengan profil `quick`. Lingkupnya hanya permukaan TSbot.
- [awarexone/Agentic-Bug-Hunter](https://github.com/awarexone/Agentic-Bug-Hunter). Bagian yang dipakai:
  - Semgrep SAST (`sast_scan.py`),
  - teknik *token smuggling* dari skill `llm-redteam`,
  - harness DOM XSS,
  - gerbang validasi `validator`.

Semua uji berjalan lokal. Tidak ada uji ke Worker atau Pages yang sedang live.

- Sumber yang diaudit: `c429cf3` (`origin/main`, bersih).
- Lingkup:
  - `tsbot/`, `imts/`, `public/widget.js`, `public/widget.css`
  - `scripts/build-tsbot.mjs`, `scripts/build-imts.mjs`, `scripts/origin.mjs`
  - `.github/workflows/tsbot.yml`
  - middleware `/api/public/*` serta jalur pertanyaan di `src/guard.ts`, `src/rag.ts` dan `src/cache.ts`
- Data mentah: `tsbot-audit-2026-11-run2.findings.json` dan `tsbot-audit-2026-11-run2.coverage-ledger.json`. Keduanya lolos `validate-findings.cjs` dan `validate-coverage-ledger.cjs` dari skill Cloudflare.

Run ini hanya mencakup sebagian kode. Bagian Nara di luar lingkup di atas tidak diperiksa ulang di sini. Bagian itu sudah dibahas di `audit-2026-11-run*.json` dan `audit-2026-11-run4.md`.

## Temuan

| Kode | Status | Severity | Ringkasan | Perbaikan |
| --- | --- | --- | --- | --- |
| `guard-invisible-unicode-bypass` | confirmed | low | Karakter tak terlihat (zero-width space, soft hyphen, word joiner, karakter tag Unicode) membuat `detectInjection` meloloskan kalimat injeksi dan tag penutup seperti `</question>`. Teks tetap sampai ke model. | `stripInvisible()` di `src/guard.ts` menghapus karakter format (`\p{Cf}`) dan variation selector, kecuali U+FE0F. Fungsi ini dipakai di guard, di `answer()`, `normalizeHistory()`, chat publik, playground, dan kanal Telegram/WhatsApp. |
| `answer-cache-hidden-instruction` | needs validation | – | Kunci cache jawaban hanya berisi huruf dan angka. Akibatnya, pertanyaan biasa yang diberi instruksi tersembunyi dalam karakter tag punya kunci yang sama dengan pertanyaan biasa. Kalau model menuruti instruksi itu, jawabannya bisa tersimpan lalu diberikan ke pengunjung lain. Sumber kode tidak bisa memastikan apakah model benar-benar membaca karakter tag. | Ditutup oleh perbaikan di atas: karakter tag dihapus sebelum lookup cache, sebelum simpan, dan sebelum model. `sameIntent()` dari audit run 5 menjaga cache semantik dari sisi lain: pertanyaan tersimpan yang punya kata tambahan tidak menjawab pertanyaan biasa. |
| `public-api-open-origin-allowlist` | needs validation | – | Bila daftar *allowed origins* bot `7stk3pruaq` kosong, situs mana pun bisa memasang bot ini dan memakai kuota hariannya. Daftar itu disimpan di D1, bukan di repo. | Langkah untuk pemilik: dashboard Nara › bot `7stk3pruaq` › Pasang widget. Isi `https://tsbot-nara.pages.dev`. |
| `rewrite-follow-up-tag-escape` | rejected | – | Tag `</follow_up>` di prompt penulisan ulang belum dikenali guard. Hasil penulisan ulang hanya dipakai sebagai kueri pencarian di dokumen bot yang sama. Hasil itu tidak ditampilkan dan tidak disimpan di cache, jadi tidak ada batas yang dilanggar. | Tag tetap ditambahkan ke pola guard, bersama semua tag prompt lain di `rag.ts`. |
| `widget-innerhtml-xss` | rejected | – | Semgrep menandai enam `innerHTML` di widget. Setiap nilai dinamis di-escape, dipaksa jadi angka, atau diisi lewat `textContent`. Harness browser dengan jawaban, sumber, saran, sapaan, dan warna berisi payload tidak menghasilkan satu elemen pun. | Harness itu kini jadi tes regresi. |

Severity `low` untuk temuan pertama mengikuti kalibrasi skill Cloudflare. Guard ini daftar pola. Parafrase biasa pun bisa lolos, dan model tetap hanya melihat potongan dokumen publik bot yang sama.

## Catatan alat

- `sast_scan.py` milik Agentic-Bug-Hunter melaporkan "0 temuan" ketika registry `semgrep.dev` diblokir jaringan, padahal Semgrep tidak jalan sama sekali. Aturan Semgrep kemudian diambil dari repo `semgrep/semgrep-rules` di GitHub dan dijalankan offline.
- Hasil Semgrep selain `innerHTML`:
  - Tag action yang belum di-pin ke SHA: dicatat sebagai saran, tidak diubah.
  - `add-mask` pada token acak di `deploy.yml`: aman.
  - `replaceAll`, kunci i18n, dan tag prompt: positif palsu.

## Pengerasan dan bug lain yang ikut diperbaiki

- Iframe TSbot di halaman IMTS: sandbox (`allow-scripts allow-same-origin allow-forms`) dan `referrerpolicy="no-referrer"` sudah masuk lewat audit run 5 di `main`. Run ini menambahkan tes bahwa TSbot tidak bisa membawa halaman IMTS ke alamat lain.
- Widget: tombol Coba lagi setelah jawaban yang terputus di tengah dulu menggandakan pertanyaan di riwayat. Kini pertanyaan hanya dikirim sekali.
- Widget: dua permintaan info yang selesai tidak berurutan (misalnya saat ganti bahasa dua kali) tidak lagi menimpa hasil yang lebih baru.
- Widget: karakter `\u0000` di jawaban dibuang sebelum render. Karakter ini dipakai sebagai penanda kode inline.
- Komentar di `tsbot.yml` kini menyebut `IMTS_ORIGIN` sebagai sumber `frame-ancestors`.

## Bukti

- `tests/unit/guard.test.ts`:
  - injeksi yang disamarkan karakter tak terlihat,
  - tag `</follow_up>`,
  - kunci cache yang tidak lagi bisa ditumpangi.
- `tests/tsbot/tsbot.spec.ts`:
  - harness DOM XSS,
  - retry setelah jawaban terputus,
  - iframe IMTS yang tersandbox tapi tetap menjawab,
  - tombol kembali ke saran pertanyaan.
- Tes retry dan tombol kembali gagal pada widget lama dan lulus pada widget baru.
