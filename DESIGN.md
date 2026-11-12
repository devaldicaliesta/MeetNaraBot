---
version: alpha
name: Nara
description: Arah visual Nara (landing, panel admin, widget chat). Diambil dari token yang sudah dipakai di public/index.html, public/admin.html, dan public/widget.css.
colors:
  ink: "#1f1b2d"
  ink-2: "#575269"
  ink-3: "#6b6679"
  canvas: "#f7f4ee"
  surface: "#fffdf9"
  line: "#e7e0d4"
  line-2: "#d3c9ba"
  primary: "#5b3fe0"
  primary-dark: "#4429c4"
  on-primary: "#ffffff"
  primary-soft: "#ece6ff"
  lilac: "#e4dcff"
  mint: "#cdeedb"
  sky: "#d4e7ff"
  butter: "#ffe48f"
  mark: "#ffd25e"
  mark-soft: "#fff1c2"
  error: "#b42318"
  error-bg: "#fdecea"
  ok: "#15803d"
  ok-bg: "#e6f4ea"
  dark-ink: "#efecf6"
  dark-ink-2: "#c3bed1"
  dark-ink-3: "#948ea6"
  dark-surface: "#221e30"
  dark-canvas: "#18151f"
  dark-line: "#353047"
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: clamp(42px, 7.2vw, 84px)
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: -0.045em
  lede:
    fontFamily: Plus Jakarta Sans
    fontSize: clamp(17px, 1.6vw, 20px)
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: Plus Jakarta Sans
    fontSize: 12.5px
    fontWeight: 700
  button:
    fontFamily: Plus Jakarta Sans
    fontSize: 15.5px
    fontWeight: 700
  mono:
    fontFamily: ui-monospace, SFMono-Regular, Menlo, monospace
    fontSize: 13px
rounded:
  sm: 8px
  md: 14px
  lg: 24px
  xl: 28px
  stage: 40px
  pill: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  section: 88px
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    height: 50px
    padding: 0 26px
  button-line:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: 50px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 24px
  stage:
    backgroundColor: "{colors.lilac}"
    rounded: "{rounded.stage}"
  widget-launcher:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.pill}"
  widget-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
---

# Nara

Dial: ENERGY 3 / RHYTHM 3 / MOTION 2

## Overview

Nara adalah narasumber untuk situs pemiliknya: chatbot yang menjawab hanya dari dokumen pemilik dan selalu menyebut sumbernya. Karakter visualnya hangat dan seperti barang cetak, bukan "AI futuristik": kertas krem, tinta ungu-tua, dan stabilo kuning yang menandai bagian penting. Kesan yang dicari: rapi seperti catatan editor, ramah, dan jujur soal asal jawaban.

Motif identitas: **stabilo**. Sorotan kuning (`mark`) di bawah kata kunci judul dan di kutipan sumber dalam jawaban. Motif ini mengikat landing, admin, dan widget.

## Colors

- Dasar halaman `canvas` (krem) dengan permukaan `surface` (kertas). Garis `line` tipis berwarna pasir, bukan abu-abu dingin.
- Teks memakai tiga tingkat tinta: `ink` untuk judul dan isi, `ink-2` untuk teks pendukung, `ink-3` untuk keterangan kecil.
- `primary` (ungu) dipakai hemat: launcher widget, cincin fokus, dan aksen merek. Tombol utama di landing memakai `ink`, bukan ungu.
- Pastel (`lilac`, `mint`, `sky`, `butter`) hanya untuk blok besar yang membedakan bagian, tidak untuk teks.
- Mode gelap (widget dan admin) memakai token `dark-*`. Gelap adalah pilihan pengguna lewat `prefers-color-scheme`, bukan bawaan.

Kontras (dihitung dengan `contrast-check.py` dari antislop-human):

| Pasangan | Rasio | AA teks normal |
| --- | --- | --- |
| ink di canvas | 15.27:1 | lolos |
| ink-2 di canvas | 6.79:1 | lolos |
| on-primary di primary | 6.50:1 | lolos |
| primary di canvas | 5.92:1 | lolos |
| error di error-bg | 5.75:1 | lolos |
| dark-ink-3 di dark-surface | 5.15:1 | lolos |
| ink-3 lama `#7f7a8c` di surface | 4.08:1 | **gagal** |
| ink-3 lama `#8a8597` di canvas (landing) | 3.25:1 | **gagal** |
| ink-3 baru `#6b6679` di canvas | 5.03:1 | lolos |

`ink-3` di file ini sudah memakai nilai baru `#6b6679`. Kode di `public/` masih memakai nilai lama dan perlu diselaraskan.

## Typography

Satu keluarga huruf: Plus Jakarta Sans (400 sampai 800), dengan monospace sistem untuk kode dan potongan sumber. Judul besar memakai berat 800 dengan tracking rapat; teks isi tetap 400 dengan line-height 1.6. Ukuran judul dan lede memakai `clamp()` sehingga mengecil sendiri di ponsel.

## Layout

Lebar konten maksimum 1180px dengan padding samping 24px. Navigasi berupa bar pil melayang yang menempel di atas. Hero rata tengah; bagian berikutnya tidak boleh semua memakai pola "judul tengah + grid kartu" yang sama. Breakpoint ditentukan oleh konten (900px, 560px, 420px di landing; 480px di widget), bukan daftar perangkat.

## Elevation & Depth

Dua jenis kedalaman, masing-masing dengan alasan:

- Bayangan keras offset (`6px 6px 0 ink`) pada kartu mock produk di landing: kesan barang cetak/stiker, bagian dari identitas.
- Bayangan lembut panjang hanya pada panel widget, karena panel itu benar-benar melayang di atas situs orang lain.

Elemen lain datar. Blur hanya di bar navigasi.

## Shapes

Sudut membulat besar tapi bertingkat: 8px untuk fokus dan elemen kecil, 14px untuk input admin, 24px untuk kartu, 28px untuk panel widget, 40px untuk blok "stage". Pil (999px) khusus tombol, tautan nav, dan sakelar bahasa.

## Components

- **Tombol utama**: pil tinta gelap, tinggi 50px (40px untuk varian kecil), naik 2px saat hover.
- **Tombol garis**: pil transparan dengan border tinta 1.5px.
- **Kartu**: permukaan kertas, border tinta 1.5px, bayangan offset keras.
- **Widget chat**: launcher ungu, panel kertas dengan sudut 28px, kutipan sumber ditandai stabilo `mark-soft`.
- **Fokus**: outline 3px `primary` dengan offset 3px pada semua elemen interaktif.

## Do's and Don'ts

- Lakukan: pakai stabilo kuning untuk menandai satu hal penting per bagian, bukan semua.
- Lakukan: tulis teks dalam bahasa Indonesia yang lugas; sebut fakta yang bisa dicek (sumber dokumen), bukan klaim kosong.
- Lakukan: hormati `prefers-reduced-motion`; animasi hanya transform singkat (0.18s).
- Jangan: gradien biru-ungu, glow, atau pola grid di latar.
- Jangan: angka pengguna, testimoni, atau logo pelanggan yang tidak nyata.
- Jangan: abu-abu muda untuk teks tanpa cek kontras.
