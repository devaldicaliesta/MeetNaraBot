---
version: alpha
name: Nara · Mercury
description: Arah visual Nara (landing, dashboard, widget) yang diturunkan dari gradien Mercury dari gradients.sh (registry kX8nN9Jqdy, jenis chrome). Menggantikan arah "kertas dan stabilo" sebelumnya.
colors:
  bg: "#020a09"
  surface: "#061412"
  surface-2: "#0b1f1b"
  line: "#17332d"
  control: "#4a7a70"
  ink: "#e8fbf7"
  ink-2: "#a9c9c2"
  ink-3: "#7fa39b"
  deep: "#183f35"
  teal: "#00a691"
  aqua: "#cefdf6"
  on-aqua: "#020a09"
  focus: "#5ff2d9"
  error: "#ff8a7a"
  error-bg: "#2a0f0c"
  ok: "#5ee0a0"
  ok-bg: "#0d2a1e"
  light-bg: "#f6fbfa"
  light-surface: "#ffffff"
  light-surface-2: "#e9f4f1"
  light-line: "#d3e4e0"
  light-control: "#6f8a84"
  light-ink: "#04211c"
  light-ink-2: "#3d5a54"
  light-ink-3: "#56736c"
  light-teal-text: "#007a6a"
typography:
  display:
    fontFamily: Bricolage Grotesque
    fontSize: clamp(40px, 6.4vw, 80px)
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: -0.035em
  title:
    fontFamily: Bricolage Grotesque
    fontSize: clamp(30px, 4vw, 48px)
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: -0.03em
  body:
    fontFamily: Instrument Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: Instrument Sans
    fontSize: 13px
    fontWeight: 600
  mono:
    fontFamily: ui-monospace, SFMono-Regular, Menlo, monospace
    fontSize: 13px
rounded:
  xs: 6px
  sm: 10px
  md: 16px
  lg: 24px
  pill: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  section: 112px
components:
  button-primary:
    backgroundColor: "{colors.aqua}"
    textColor: "{colors.on-aqua}"
    rounded: "{rounded.pill}"
    height: 48px
    padding: 0 24px
  button-line:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: 48px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: 24px
  input:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
  source-bead:
    backgroundColor: "{colors.aqua}"
    textColor: "{colors.on-aqua}"
    rounded: "{rounded.pill}"
  widget-launcher:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.on-aqua}"
    rounded: "{rounded.pill}"
---

# Nara · Mercury

Dial: ENERGY 3 / RHYTHM 3 / MOTION 2

Design Read: landing dan dashboard produk untuk pemilik situs kecil (sekolah, toko, lembaga) yang ingin chatbot dari dokumen sendiri, dalam bahasa visual "logam cair" dari gradien Mercury, dial ENERGY 3 / RHYTHM 3 / MOTION 2.

## Overview

Arah ini datang dari pemilik produk: gradien Mercury dari gradients.sh (jenis chrome, warna `#183f35`, `#00a691`, `#cefdf6` di atas `#020a09`). Nara terasa seperti cairan logam yang memantulkan isi dokumen: gelap, tenang, dengan kilau aqua di tempat yang penting. Gradien hidup hanya muncul di satu tempat (panggung hero), sehingga tetap menjadi sorotan, bukan wallpaper.

Motif identitas: **manik sumber**. Nomor sumber digambar sebagai manik kecil berwarna aqua dengan angka gelap, seperti setetes logam. Motif yang sama dipakai di jawaban widget, mock produk di landing, dan nomor langkah "Cara kerja".

## Colors

- Dasar `bg` adalah warna latar Mercury sendiri. Permukaan naik satu tingkat ke `surface` lalu `surface-2`; pemisah memakai `line`.
- Teks: `ink` untuk judul dan isi, `ink-2` untuk teks pendukung, `ink-3` untuk keterangan kecil.
- Aksen tunggal: `aqua` (warna terang Mercury) untuk tombol utama dan manik sumber. `teal` untuk launcher widget, tautan, dan status aktif. `deep` untuk blok penutup.
- Batas kontrol (input, kolom chat, chip, sakelar) memakai `control`, bukan `line`, agar lolos 3:1.
- Gelap adalah bawaan untuk landing dan dashboard karena arah merek ini memang gelap. Widget tetap punya tema terang (token `light-*`) karena tampil di situs pemilik yang mungkin terang; pemilik memilih lewat atribut `theme`.

Kontras (dihitung dengan `contrast-check.py` dari antislop-human):

| Pasangan | Rasio | Hasil |
| --- | --- | --- |
| ink di bg / surface / surface-2 | 18.64 / 17.53 / 15.96 | lolos |
| ink-2 di surface-2 | 9.64 | lolos |
| ink-3 di surface-2 | 6.21 | lolos |
| teal (teks) di surface-2 | 5.60 | lolos |
| on-aqua di aqua (tombol, manik) | 18.10 | lolos |
| on-aqua di teal (launcher) | 6.54 | lolos |
| ink di deep | 10.87 | lolos |
| error di surface-2 | 7.48 | lolos |
| ok di surface-2 | 10.31 | lolos |
| control di surface-2 (non-teks) | 3.51 | lolos |
| focus di surface-2 (non-teks) | 12.39 | lolos |
| light-ink-3 di light-surface-2 | 4.59 | lolos |
| light-teal-text di light-surface-2 | 4.68 | lolos |
| light-control di light-surface-2 (non-teks) | 3.31 | lolos |

Teks tidak pernah diletakkan langsung di atas gradien hidup: kilau `#cefdf6` di dalamnya membuat kontras berubah dari titik ke titik. Teks di panggung selalu berada di kartu ber-`surface`.

## Typography

- Judul: Bricolage Grotesque 700. Lekuk "ink trap" dan bentuknya yang sedikit meleleh di ukuran besar sejalan dengan logam cair, dan tetap tegas di layar gelap.
- Isi dan antarmuka: Instrument Sans, netral dan mudah dibaca di 13 sampai 16px.
- Kode dan potongan embed: monospace sistem.
- Ukuran judul memakai `clamp()` supaya mengecil sendiri di ponsel.

## Layout

Lebar konten maksimum 1200px. Hero rata kiri dan terbagi dua: teks di kiri, panggung gradien berisi mock produk di kanan; di ponsel keduanya bertumpuk. Bagian berikutnya sengaja berbeda bentuk: fitur sebagai baris editorial, "Cara kerja" sebagai judul sticky di samping daftar bernomor, penutup sebagai blok `deep`. Breakpoint 960px, 640px, dan 420px dipilih di titik konten mulai sesak.

## Elevation & Depth

Kedalaman datang dari tingkat permukaan (`bg`, `surface`, `surface-2`) dan satu garis kilau tipis di tepi atas kartu (`inset 0 1px 0` aqua 8%), meniru pantulan logam. Bayangan besar hanya untuk panel widget yang melayang di atas situs orang lain. Tidak ada glow.

## Shapes

Radius bertingkat: 6px untuk elemen kecil, 10px untuk input, 16px untuk kartu, 24px untuk panggung dan panel. Pil hanya untuk tombol, manik sumber, dan sakelar.

## Components

- **Tombol utama**: pil aqua dengan teks gelap, tinggi 48px. Hover sedikit lebih terang, tekan turun 1px.
- **Tombol garis**: pil transparan dengan border `control`.
- **Kartu**: `surface`, border `line`, garis kilau di tepi atas.
- **Panggung gradien**: Mercury hidup, radius 24px, tombol "Jeda animasi" di pojok (WCAG 2.2.2), diam satu frame bila pengguna memilih kurangi gerak.
- **Manik sumber**: pil aqua kecil berisi nomor sumber.
- **Fokus**: outline 2px `focus` dengan offset 2px.

## Do's and Don'ts

- Lakukan: satu gradien hidup per halaman, di panggung hero, dengan tombol jeda.
- Lakukan: target sentuh minimal 44px; perluas dengan `::after` bila tampilannya kecil.
- Lakukan: tulis teks dalam bahasa Indonesia yang lugas dan sebut fakta yang bisa dicek.
- Jangan: teks langsung di atas gradien, glow, atau blur kaca di banyak permukaan.
- Jangan: angka pengguna, testimoni, atau logo pelanggan yang tidak nyata.
- Jangan: warna aqua di mana-mana. Aqua untuk tombol utama dan manik sumber saja.
