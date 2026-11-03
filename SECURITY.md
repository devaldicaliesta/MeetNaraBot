# Keamanan MeetNaraBot

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

## Penguatan yang aktif

- **Login admin:** 8 kali salah per IP atau 100 kali salah secara global dalam 10 menit membuat semua permintaan admin ditolak, termasuk yang memakai password benar, sampai jendela waktunya berganti. Password yang lebih pendek dari 12 karakter ditandai di checklist Ringkasan.
- **Ukuran request:** body chat publik di atas 32 KB dan body admin di atas 512 KB ditolak sebelum diproses (413).
- **Header:** CSP di semua halaman (dashboard hanya boleh memuat skrip dari dirinya sendiri dan `cdn.jsdelivr.net`). Dashboard memakai `frame-ancestors 'none'`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, dan `Cache-Control: no-store`. Semua halaman memakai `nosniff`, `Permissions-Policy`, dan `Cross-Origin-Opener-Policy`.
- **Privasi:** IP pengunjung hanya disimpan sebagai hash harian dengan salt acak. Data pribadi tidak diminta.
- **Secret:** API key dan password hanya disimpan sebagai secret Worker atau GitHub. Key tidak pernah dikirim balik ke browser. Workflow tidak berjalan untuk pull request dari fork.

## Rekomendasi untuk pemilik

1. Pakai `ADMIN_PASSWORD` minimal 12 karakter, sebaiknya kalimat sandi 4–5 kata acak.
2. Isi daftar domain yang diizinkan di menu **Pasang widget**.
3. Ganti API key yang pernah dibagikan di chat atau dokumen, lalu simpan yang baru hanya sebagai secret.
4. Untuk perlindungan lebih kuat, letakkan `/admin*` di belakang [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/policies/access/). Cara ini gratis untuk tim kecil dan menambah login email di depan dashboard.

## Melaporkan celah

Hubungi pemilik repositori secara pribadi. Jangan membuka issue publik untuk celah keamanan.
