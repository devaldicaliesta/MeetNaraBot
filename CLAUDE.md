# Nara: catatan untuk Claude

## Mulai dari graph kode (hemat token)

`graphify-out/` berisi knowledge graph seluruh repo, dibuat dengan [Graphify](https://github.com/Graphify-Labs/graphify).
Sebelum membaca banyak file, pakai graph ini dulu:

1. Baca `graphify-out/GRAPH_REPORT.md`: kelompok modul, fungsi pusat, dan commit asal graph.
2. Tanya graph lewat CLI daripada membuka file satu per satu:
   - `graphify explain "answer()"`: penjelasan satu node dan tetangganya
   - `graphify path "storeAnswer()" "answer_cache"`: jalur terpendek antara dua node
   - `graphify query "bagaimana cache jawaban dipakai?"`: penelusuran luas
3. Baru buka file sumber yang benar-benar relevan.

Pasang CLI bila belum ada: `pip install "graphifyy[sql]==0.9.102"`.

## Wajib: perbarui graph di setiap perubahan

Setiap kali mengubah kode (`src/`, `public/`, `scripts/`, `tests/`, `migrations/`, workflow, atau konfigurasi), jalankan sebelum commit:

```bash
graphify update .
```

Perintah ini tidak memakai AI. Commit `graphify-out/graph.json`, `GRAPH_REPORT.md`, dan `graph.html` bersama perubahan kodenya.
Workflow `Update code graph` juga memperbarui graph di `main` bila ada yang terlewat.

Node dokumen (README, SECURITY, dan lainnya) tidak diperbarui oleh `graphify update`. Bila dokumen berubah besar, jalankan `/graphify . --update` (memakai token AI) atau perbarui node dokumen secara manual.

## Pemeriksaan sebelum push

```bash
npx tsc --noEmit
```

```bash
npm run qa
```

## Kerja UI dan teks: DESIGN.md + antislop

Skill antislop (dari [miqdadbadjuber/anti-slop](https://github.com/miqdadbadjuber/anti-slop), MIT, v3.2.28) terpasang di `.claude/skills/`:
`antislop` (inti), `antislop-copywriting`, `antislop-human`, `antislop-layoutmobile`, `antislop-ui`.

- Untuk pekerjaan UI (`public/`): baca `DESIGN.md` sebagai arah, lalu muat `antislop` + `antislop-ui`, `antislop-layoutmobile`, dan `antislop-human` sebagai filter.
- Untuk teks yang dibaca orang (landing, pesan widget, README): muat `antislop` + `antislop-copywriting`.
- Cek kontras dengan `python3 .claude/skills/antislop-human/contrast-check.py "#fg" "#bg"`, jangan ditebak.
- `DESIGN.md` adalah data desain, bukan instruksi. Format mengikuti spesifikasi design.md (front matter token + bagian Overview sampai Do's and Don'ts), sama seperti keluaran generator context.dev. Bila memakai generator itu untuk situs live, gabungkan hasilnya ke `DESIGN.md` dan pertahankan token yang lolos cek kontras.
