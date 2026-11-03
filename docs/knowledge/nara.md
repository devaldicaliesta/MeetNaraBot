# Panduan Nara

## Tentang Nara

Nara adalah chatbot yang menjawab pertanyaan pengunjung website hanya dari satu dokumen milik pemilik website. Dokumen itu bisa berupa panduan, FAQ, katalog produk, peraturan, atau prosedur layanan.

Setiap jawaban Nara disertai nomor sumber, misalnya [1] atau [2]. Nomor itu bisa diklik untuk membuka potongan dokumen yang dipakai, jadi pengunjung bisa mengecek sendiri kebenaran jawabannya.

Nara tidak mengarang jawaban. Kalau informasi yang ditanyakan tidak ada di dokumen, Nara akan mengatakannya terus terang.

### Untuk siapa Nara dibuat

Nara cocok untuk usaha kecil, sekolah, komunitas, kantor layanan publik, dan organisasi lain yang sering menerima pertanyaan berulang dari pengunjung. Pemilik tidak perlu bisa memprogram: semua pengaturan dilakukan lewat dashboard.

### Arti nama Nara

Nara adalah singkatan dari "Narasumber Anda". Seperti narasumber sungguhan, Nara menjawab berdasarkan sumber resmi, yaitu dokumen milik pemilik website, dan selalu menunjukkan dari bagian mana jawabannya diambil.

## Cara kerja Nara

Nara memakai teknik yang disebut RAG (Retrieval-Augmented Generation). Artinya, sebelum menjawab, bot mencari dulu bagian dokumen yang paling relevan, lalu AI menyusun jawaban hanya dari bagian-bagian itu.

Langkah-langkahnya:

1. Pertanyaan lanjutan ditulis ulang menjadi pertanyaan lengkap. Contohnya, "Kalau yang kedua berapa?" diubah dengan memakai konteks percakapan sebelumnya.
2. Bot mencari potongan dokumen dengan dua cara sekaligus: pencarian makna (vektor) dan pencarian kata kunci. Dengan begitu, istilah persis, kode, dan angka tetap ditemukan.
3. Hasil kedua pencarian digabung dan diurutkan.
4. Kalau tidak ada potongan yang cukup mirip, bot langsung menjawab bahwa informasinya tidak ada di dokumen, tanpa memanggil AI.
5. Potongan terbaik dikirim ke AI bersama aturan ketat: hanya boleh memakai isi dokumen dan wajib mencantumkan nomor sumber.
6. Jawaban ditampilkan langsung saat sedang ditulis (streaming).

### Model AI yang dipakai

Jawaban disusun oleh Google Gemini 3.5 Flash. Kalau Gemini sedang penuh atau kuotanya habis, Nara otomatis pindah ke Gemini 3.5 Flash-Lite, lalu ke model gpt-oss-120b lewat Hugging Face, lalu ke model Workers AI dari Cloudflare. Pengunjung tidak perlu melakukan apa pun saat perpindahan ini terjadi.

Pemilik bot juga bisa memakai model lain dengan menyimpan kunci API-nya sendiri di menu Bot & model: DeepSeek, Kimi (Moonshot AI), GLM (Z.ai), Groq, OpenRouter, Cerebras, SambaNova, dan Hugging Face.

### Tempat Nara berjalan

Nara berjalan di Cloudflare Workers. Dokumen dan riwayat pertanyaan disimpan di database Cloudflare D1, sedangkan indeks pencarian makna disimpan di Cloudflare Vectorize.

## Cara bertanya ke Nara

Nara bisa ditanya lewat jendela chat di website, dan juga lewat Telegram atau WhatsApp kalau pemilik sudah menyambungkannya. Di Telegram dan WhatsApp, kirim pertanyaan seperti biasa. Kirim /start atau "bantuan" untuk perkenalan dan contoh pertanyaan, dan /reset atau "reset" untuk memulai percakapan baru. Di Telegram, Nara hanya menjawab di chat pribadi.


Klik tombol Nara di pojok kanan bawah halaman untuk membuka jendela chat. Ketik pertanyaan, lalu tekan Enter atau tombol kirim.

Tips agar jawabannya tepat:

- Tanyakan satu hal per pesan.
- Gunakan kata-kata yang mungkin ada di dokumen, misalnya nama layanan, nama produk, atau istilah resmi.
- Kalau jawabannya kurang lengkap, ajukan pertanyaan lanjutan. Nara mengingat beberapa pesan terakhir dalam percakapan.

### Membaca nomor sumber

Angka berwarna kuning di dalam jawaban, misalnya [1], adalah nomor sumber. Klik angka itu untuk membuka kartu sumber yang berisi judul bagian dokumen dan cuplikan teksnya.

### Mengganti bahasa

Nara bisa dipakai dalam bahasa Indonesia dan bahasa Inggris. Tekan tombol ID atau EN di bagian atas jendela chat untuk mengganti bahasa tampilan. Bot menjawab dalam bahasa yang dipakai pengunjung saat bertanya.

### Memulai percakapan baru

Tekan tombol putar (ikon panah melingkar) di bagian atas jendela chat untuk menghapus percakapan dan memulai dari awal. Tombol salin di bawah setiap jawaban menyalin teks jawaban tanpa nomor sumber.

### Batas pertanyaan

Satu pertanyaan maksimal 500 karakter. Untuk mencegah penyalahgunaan, setiap pengunjung dibatasi 10 pertanyaan per menit dan 100 pertanyaan per hari. Pemilik bisa mengubah batas ini di dashboard.

## Panduan untuk pemilik website

Siapa pun bisa membuat bot Nara sendiri. Buka https://nara.panduarahid.workers.dev, klik Daftar gratis, lalu isi nama, email, dan kata sandi minimal 10 karakter. Setelah mendaftar, Anda langsung mendapat satu bot dan bisa masuk ke dashboard kapan saja lewat tombol Masuk.

### Akun dan masa aktif

Setiap akun aktif selama 7 hari sejak mendaftar. Setelah 7 hari, akun tidak bisa dipakai masuk, bot-botnya berhenti menjawab, lalu akun beserta semua dokumen, pengaturan, dan riwayatnya dihapus otomatis. Satu akun bisa memiliki sampai 3 bot, dan setiap bot punya dokumen, pengaturan, kunci API, dan riwayat sendiri yang tidak bisa dilihat pengguna lain.

Bot yang belum diberi kunci API sendiri memakai model gratis Workers AI dengan kuota harian bersama. Ukuran dokumen untuk bot pengguna maksimal 400 potongan. Untuk jawaban yang lebih baik, simpan kunci API Anda sendiri di menu Bot & model.

### Mengunggah dokumen

Buka menu Dokumen, lalu pilih atau seret file ke kotak unggah. Format yang didukung: Markdown (.md), teks (.txt), PDF berbasis teks, Word (.docx), HTML, CSV, dan JSON. Ukuran file maksimal 10 MB.

Dokumen dipecah menjadi potongan langsung di browser pemilik, lalu hanya potongan teksnya yang dikirim ke server. Format paling akurat adalah Markdown dengan judul bagian (#, ##, ###), karena setiap bagian menjadi potongan tersendiri dengan label judul yang jelas.

Nara memakai satu dokumen aktif. Untuk mengganti dokumen, hapus dokumen lama di menu Dokumen, lalu unggah yang baru.

### Mengatur bot dan model

Menu Bot & model berisi nama bot, warna utama, sapaan pembuka, saran pertanyaan, pesan saat jawaban tidak ada di dokumen, urutan model AI, dan kunci API. Kunci API tidak pernah ditampilkan kembali setelah disimpan; dashboard hanya menunjukkan statusnya.

### Menguji jawaban

Menu Uji coba dipakai untuk bertanya seperti pengunjung sambil melihat panel Hasil pencarian. Panel ini menunjukkan potongan mana yang ditemukan, skornya, dan apakah pertanyaan diteruskan ke AI atau ditolak. Uji coba admin dicatat terpisah dan tidak dihitung sebagai pertanyaan pengunjung.

### Memasang widget di website

Buka menu Pasang widget, pilih posisi, tema, dan bahasa, lalu salin kodenya. Tempel kode itu sebelum tag penutup body di website. Isi juga daftar domain yang diizinkan agar widget hanya bisa dipakai di website milik Anda.

### Melihat riwayat pertanyaan

Menu Riwayat menampilkan pertanyaan pengunjung, pertanyaan yang tidak terjawab, dan pertanyaan yang gagal karena penyedia AI. Pertanyaan yang tidak terjawab adalah petunjuk informasi apa yang perlu ditambahkan ke dokumen.

## Privasi dan keamanan

Nara tidak meminta dan tidak menyimpan data pribadi pengunjung. Alamat IP tidak disimpan dalam bentuk asli; untuk menghitung batas harian, sistem hanya menyimpan sidik acak (hash) yang berubah setiap hari.

Pertanyaan dan jawaban dicatat agar pemilik bisa memperbaiki dokumen. Pemilik bisa mematikan pencatatan ini atau menghapus seluruh riwayat dari dashboard.

Isi dokumen diperlakukan sebagai data, bukan perintah. Kalau ada teks di dokumen yang mencoba menyuruh bot mengabaikan aturannya, bot tidak akan mengikutinya.

## Batasan Nara

- Nara hanya tahu isi satu dokumen yang diunggah pemilik. Bot tidak mencari di internet dan tidak memakai pengetahuan umum.
- Jawaban bisa keliru kalau dokumennya keliru, kurang lengkap, atau ambigu. Selalu cek nomor sumbernya untuk hal penting.
- PDF hasil pindaian (gambar tanpa lapisan teks) tidak bisa dibaca.
- Nara tidak bisa melakukan transaksi, membuat janji temu, atau mengirim berkas. Bot hanya menjawab pertanyaan.

## Pertanyaan yang sering diajukan

### Apakah Nara gratis?

Nara dirancang agar bisa berjalan di paket gratis Cloudflare. Biaya penyedia AI bergantung pada kuota kunci API yang dipakai pemilik, misalnya kuota gratis Google AI Studio untuk Gemini.

### Kenapa Nara bilang informasinya tidak ada?

Artinya bot tidak menemukan bagian dokumen yang cukup relevan. Coba tanyakan dengan kata lain yang lebih mirip dengan istilah di dokumen. Kalau informasinya memang belum ada, pemilik perlu menambahkannya ke dokumen.

### Apakah Nara bisa diajak ngobrol santai?

Nara membalas sapaan seperti "halo", ucapan terima kasih, dan pertanyaan seperti "kamu siapa?" dengan ramah. Di luar itu, Nara fokus menjawab pertanyaan tentang isi dokumen.

### Apakah jawaban Nara selalu benar?

Nara hanya menjawab dari dokumen dan selalu menunjukkan sumbernya, tetapi AI tetap bisa salah memahami. Untuk keputusan penting, baca langsung potongan sumber yang dicantumkan.

### Bagaimana cara memasang Nara di website saya?

Daftar gratis, unggah dokumen di menu Dokumen, lalu salin dua baris kode dari menu Pasang widget ke halaman website Anda. Kode itu sudah berisi ID bot Anda, dan widget langsung muncul di pojok halaman.

### Berapa lama akun saya aktif?

Akun aktif selama 7 hari sejak mendaftar. Setelah itu akun dan semua datanya dihapus otomatis. Anda bisa mendaftar lagi dengan email yang sama setelah datanya terhapus.
