# Keamanan Nara

## Audit November 2026

Audit ini memakai alur [cloudflare/security-audit-skill](https://github.com/cloudflare/security-audit-skill) dengan profil **quick** dan satu agen. Artinya ini satu putaran pemeriksaan, bukan audit menyeluruh dengan verifikasi independen. Kode yang diperiksa adalah commit `1e1a155`. Hasilnya lolos `validate-findings.cjs` dari repo tersebut.

Batas kepercayaan yang diperiksa:
- **Pengunjung → API publik:** chat, info bot, CORS, kuota.
- **Internet → API admin:** login, throttle, ukuran request.
- **Isi dokumen dan jawaban AI → browser:** widget dan dashboard (XSS).
- **GitHub Actions → Cloudflare:** secret dan trigger workflow.

| Temuan | Status | Tingkat | Perbaikan |
|---|---|---|---|
| Throttle login admin dicek *setelah* password dibandingkan, sehingga tebakan yang benar tetap lolos saat IP sedang dikunci | Terkonfirmasi | Sedang | Kunci dicek sebelum perbandingan. Kegagalan dicatat di D1 per IP (di-hash) dan secara global dalam jendela 10 menit, dan perbandingan memakai digest SHA-256 dengan waktu konstan. |
| Server mock membuka API admin ke jaringan lokal dengan password bawaan `dev` | Terkonfirmasi | Rendah | Sekarang hanya mendengarkan di `127.0.0.1`. Pakai `HOST=0.0.0.0` untuk membukanya dengan sengaja. |
| Batas per menit hanya berlaku per isolate Worker | Perlu validasi | – | Login admin kini memakai penghitung D1 yang tahan isolate. Batas chat publik tetap dibatasi oleh kuota harian di D1. |
| XSS lewat pertanyaan pengunjung di Riwayat | Ditolak | – | Semua teks lewat `esc()`. |
| XSS lewat jawaban AI di widget | Ditolak | – | Teks di-escape sebelum format markdown. |
| Password admin dipakai sebagai salt hash IP | Ditolak (penguatan) | – | Diganti salt acak per instalasi (`settings.salt`). |
| Halaman tanpa CSP atau anti-framing | Ditolak (penguatan) | – | Ditambahkan `public/_headers`. |

## Audit kedua: multi-pengguna (November 2026)

Audit memakai alur yang sama (profil quick, satu agen) dan berfokus pada batas antar-pengguna. Hasilnya lolos `validate-findings.cjs`. Rekaman lengkapnya ada di `docs/security/audit-2026-11-run2-multi-user.json`.

| Temuan | Status | Tingkat | Perbaikan |
|---|---|---|---|
| Satu akun gratis bisa menghabiskan kuota Workers AI bersama (unggahan besar, uji coba tanpa batas) | Terkonfirmasi | Sedang | Dokumen bot pengguna maksimal 400 potongan, embedding semua bot pengguna dibatasi per hari, dan uji coba pemilik ikut dihitung kuota |
| Penghitung login global bisa mengunci semua pengguna | Terkonfirmasi | Sedang | Kunci per IP dan per email; penghitung global hanya untuk password admin platform |
| ID potongan/vektor hanya memakai 8 karakter ID file, sehingga bisa saling menimpa antar bot | Terkonfirmasi | Rendah | Memakai UUID penuh; penghapusan FTS dibatasi `bot_id` |
| Filter Vectorize untuk vektor lama sebelum index metadata `bot` dibuat | Perlu validasi | – | Index dibuat oleh workflow, dokumen platform diindeks ulang, dan kandidat selalu dicek ulang di D1 |
| Akses bot pengguna lain lewat `X-Bot-Id` | Ditolak | – | Kepemilikan dicek di setiap request (ada tesnya) |
| Bot pengguna memakai secret penyedia milik platform | Ditolak | – | `tenantEnv` menghapus secret platform untuk bot pengguna (ada tesnya) |
| Pendaftaran membocorkan email yang sudah terdaftar | Ditolak (kompromi UX) | – | Dibatasi 5 per IP per hari; login memakai pesan dan kerja hash yang sama |

Catatan: PBKDF2 memakai 30.000 iterasi agar login muat dalam batas CPU Workers gratis (sekitar 10 ms). Ini di bawah rekomendasi OWASP. Kompensasinya: kunci login per IP dan per email, minimal 10 karakter, dan password tidak boleh memuat email. Di paket Workers berbayar, naikkan `PBKDF2_ITERATIONS`; hash lama tetap berlaku karena jumlah iterasi disimpan per pengguna.

## Penguatan yang aktif

- **Login admin:** 8 kali salah per IP atau 100 kali salah secara global dalam 10 menit membuat semua permintaan admin ditolak, termasuk yang memakai password benar, sampai jendela waktunya berganti. Password yang lebih pendek dari 12 karakter ditandai di checklist Ringkasan.
- **Ukuran request:** body chat publik di atas 32 KB dan body admin di atas 512 KB ditolak sebelum diproses (413).
- **Header:** CSP di semua halaman (dashboard hanya boleh memuat skrip dari dirinya sendiri dan `cdn.jsdelivr.net`). Dashboard memakai `frame-ancestors 'none'`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, dan `Cache-Control: no-store`. Semua halaman memakai `nosniff`, `Permissions-Policy`, dan `Cross-Origin-Opener-Policy`.
- **Token deploy:** setiap run deploy membuat `DEPLOY_TOKEN` acak (32 byte), menyamarkannya di log, dan menyimpannya sebagai secret Worker. Token ini hanya diterima untuk status, unggah atau hapus dokumen, dan sambung Telegram, dan selalu diganti di deploy berikutnya.
- **Webhook Telegram:** wajib header `X-Telegram-Bot-Api-Secret-Token` yang cocok (dibandingkan dengan waktu konstan); body di atas 256 KB ditolak.
- **Webhook WhatsApp:** setiap POST wajib bertanda tangan `X-Hub-Signature-256` dari App Secret; verifikasi GET memakai `WHATSAPP_VERIFY_TOKEN`; hanya pesan untuk `WHATSAPP_PHONE_NUMBER_ID` milik Anda yang diproses.
- **Pesan chat-app:** format Telegram memakai HTML yang di-escape lebih dulu, sehingga hanya tag `<b>`, `<i>`, dan `<code>` yang dihasilkan. Pratinjau tautan dimatikan. Kuota per menit dan harian berlaku per pengguna chat.
- **Akun:** sesi disimpan sebagai hash SHA-256, berlaku maksimal 7 hari dan tidak melebihi masa aktif akun. Akun kedaluwarsa dihapus beserta bot, dokumen, vektor, riwayat, dan pengaturannya oleh cron harian. Vektor yang gagal dihapus dicatat dan dicoba ulang.
- **Privasi:** IP pengunjung hanya disimpan sebagai hash harian dengan salt acak. Data pribadi tidak diminta.
- **Secret:** API key dan password hanya disimpan sebagai secret Worker atau GitHub. Key tidak pernah dikirim balik ke browser. Workflow deploy (yang memegang secret) tidak pernah berjalan untuk pull request; workflow QA berjalan tanpa secret dan dengan izin baca saja.

## Rekomendasi untuk pemilik

1. Pakai `ADMIN_PASSWORD` minimal 12 karakter, sebaiknya kalimat sandi 4–5 kata acak.
2. Isi daftar domain yang diizinkan di menu **Pasang widget**.
3. Ganti API key yang pernah dibagikan di chat atau dokumen, lalu simpan yang baru hanya sebagai secret.
4. Untuk perlindungan lebih kuat, letakkan `/admin*` di belakang [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/policies/access/). Cara ini gratis untuk tim kecil dan menambah login email di depan dashboard.

## Melaporkan celah

Hubungi pemilik repositori secara pribadi. Jangan membuka issue publik untuk celah keamanan.
