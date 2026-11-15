# SIQA-INFOKOM (prototype)

Prototype HTML audit mutu internal dengan alur sama seperti SIQA (Penilaian Mandiri → Audit Rubrik),
tetapi butir yang dinilai adalah seluruh **Matriks Penilaian LAM INFOKOM** (S1/S2/S3) per tahap PPEPP.

Buka `index.html` di root repo langsung di browser (tidak perlu server atau build), atau versi daring di https://rendicahya.github.io/siqa-infokom/. `prototype/index.html` hanya mengalihkan ke root.

## Halaman

- **Beranda**: daftar penugasan per program studi, progres mandiri/audit.
- **Penilaian Mandiri (LED)**: per butir ada narasi, isian khusus tahap PPEPP (lihat tabel di bawah), cek aspek, bukti dukung, dan skor mandiri 1–4.
- **Audit Rubrik**: jawaban unit ditampilkan, auditor memverifikasi aspek, memberi skor LAM 1–4 (dipadankan ke Acceptable/Concern/Weakness/Defisiensi), lalu mengisi catatan, rekomendasi, dan batas tindak lanjut.
- **Rekap PPEPP**: peta kriteria × tahap PPEPP, kontribusi nilai per kriteria, daftar temuan untuk RTM, syarat Unggul, dan selisih skor mandiri vs auditor. Bisa diekspor ke CSV atau dicetak.
- **Panduan**: padanan skala, isian per tahap, dan analisis kesenjangan indikator SIQA terhadap butir LAM.

| Tahap        | Isian tambahan                                   |
|--------------|--------------------------------------------------|
| Penetapan    | Standar, indikator, dan target                   |
| Pelaksanaan  | Rujukan tabel LKPS                               |
| Evaluasi     | Faktor pendukung, akar masalah, hasil survei     |
| Pengendalian | Tindak lanjut / RTL (termasuk RTM)               |
| Peningkatan  | Standar yang ditingkatkan dan target barunya     |
| Konteks A/B  | Analisis SWOT                                    |

## Data

- `data/matriks.js` dibuat dari `Matriks Penilaian *.md` dengan `python tools/build_matriks.py`. Jalankan ulang skrip ini bila matriks berubah.
- `data/seed.js` berisi daftar penugasan, pemetaan awal indikator SIQA → butir LAM, dan contoh isian PS Doktor Ilmu Komputer.
- Isian tersimpan di `localStorage` browser. Gunakan menu **Ekspor/Impor data (JSON)** untuk berpindah perangkat dan **Reset** untuk kembali ke data contoh.
