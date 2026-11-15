# Analisis Gap: Indikator SIQA vs Matriks Penilaian LAM INFOKOM

Disusun 14 November 2026 sebagai dasar pengembangan SIQA-INFOKOM.

**Sumber yang dibandingkan:**
- Indikator SIQA AIM Siklus 25 Tahun 2026: Ind. 4, 5, 6, 7, 10, 11, 12, 14, 15, 17, 18, 23, 40, 41. Sumbernya halaman Penilaian Mandiri dan Audit PS Doktor.
- `Matriks Penilaian Doktor.md`, `Matriks Penilaian Magister.md`, `Matriks Penilaian Sarjana.md`.
- `Instrumen LED S3 Unggul.md`.

> **Catatan:** Pemetaan indikator SIQA ke butir LAM adalah pemetaan awal (`prototype/data/seed.js`) dan perlu diverifikasi tim penjaminan mutu. Butir dihitung "tersentuh" bila setidaknya sebagian aspeknya dibahas oleh suatu indikator SIQA. Artinya, butir yang tersentuh pun belum tentu terpenuhi seluruhnya.

## Kesimpulan

Ya, SIQA saat ini tidak mencakup sebagian besar aspek yang disyaratkan LAM INFOKOM. Ada empat sebab utamanya:

1. **Cakupannya sempit.** 14 indikator SIQA hanya menyentuh **17 dari 77 butir** matriks S3 (22%), atau sekitar 40% bobot nilai. Kondisinya sama untuk S2 (17 dari 80 butir) dan S1 (17 dari 77 butir).
2. **Fokusnya hanya pada Pelaksanaan.** Indikator SIQA kebanyakan memeriksa *apa yang sudah dikerjakan*. Tahap lain siklus PPEPP (penetapan standar, evaluasi, pengendalian, peningkatan) hampir tidak dinilai, padahal tahap-tahap itulah inti evaluasi menurut LAM.
3. **Skalanya berbeda.** SIQA memakai Acceptable/Concern/Weakness/Defisiensi tanpa rubrik per butir. LAM memakai skor 1–4 dengan rubrik, bobot, dan Syarat Unggul pada setiap butir.
4. **Isian evaluasi yang diminta LED belum ada.** LED meminta faktor pendukung, akar masalah, survei kepuasan, RTL/RTM, dan SWOT. Isian-isian ini belum menjadi bagian formulir SIQA.

## 1. Cakupan per tahap PPEPP (S3)

| Tahap | Butir LAM | Tersentuh SIQA | Bobot LAM | Bobot tersentuh |
|---|---:|---:|---:|---:|
| Konteks (A, B) | 2 | 1 | 8 | 4 |
| Penetapan | 15 | 2 | 52 | 11,5 |
| Pelaksanaan | 15 | **9** | 143 | 118 |
| Evaluasi | 15 | 3 | 77,5 | 24,5 |
| Pengendalian | 15 | 2 | 47 | 4 |
| Peningkatan | 15 | **0** | 72,5 | **0** |
| **Total** | **77** | **17 (22%)** | **400** | **162 (40,5%)** |

Pola yang sama juga terlihat di S2 (bobot tersentuh 151 dari 400,5) dan S1 (143 dari 380,5). S2 punya tambahan 3 butir Kekhasan PS (6.6–6.8, bobot 20) yang sama sekali tidak tersentuh.

**Bacaan:** Separuh dari butir yang tersentuh ada di tahap Pelaksanaan. Tahap **Peningkatan tidak tersentuh sama sekali**, dan Pengendalian hanya diwakili Ind. 41 (temuan lama dan Tinjauan Manajemen). Kedua tahap ini yang membuat siklus PPEPP benar-benar tertutup.

## 2. Cakupan per kriteria (S3)

| Kriteria | Butir | Tersentuh |
|---|---:|---:|
| A–B Kondisi Eksternal & Profil | 2 | 1 |
| K1 Budaya Mutu | 10 | 1 |
| K2 Relevansi Pendidikan | 20 | 8 |
| K3 Relevansi Penelitian | 15 | 3 |
| K4 Relevansi PkM | 15 | 1 |
| K5 Akuntabilitas | 10 | 2 |
| K6 Diferensiasi Misi | 5 | 1 |

Hanya K2 (Pendidikan) yang cukup tercakup. Kriteria **Budaya Mutu, PkM, Akuntabilitas, dan Diferensiasi Misi** hampir tidak diaudit.

## 3. Aspek LAM yang belum dicakup SIQA

- **Kondisi Eksternal (butir A):** analisis lingkungan makro/mikro, peluang, dan ancaman. SIQA hanya mencakup profil/akreditasi (Ind. 4).
- **Penetapan standar di setiap kriteria:** dokumen standar, indikator, dan target yang ditetapkan. Untuk Budaya Mutu, Penelitian, PkM, Akuntabilitas, dan Diferensiasi Misi, aspek ini tidak ditanyakan.
- **Evaluasi yang menyeluruh.** Untuk setiap kriteria, LED meminta:
  - capaian dibandingkan target,
  - faktor pendukung dan penghambat,
  - akar masalah,
  - hasil survei kepuasan (mahasiswa, dosen, tendik, mitra, pengguna lulusan).

  SIQA hanya menyentuh analisis luaran pendidikan (Ind. 12, 15) dan perbaikan pembelajaran (Ind. 10).
- **Pengendalian:** tindak lanjut hasil evaluasi beserta RTM per kriteria. SIQA hanya memeriksa temuan lama secara umum (Ind. 41).
- **Peningkatan:** peningkatan standar dan target baru per kriteria. SIQA belum mencakupnya sama sekali.
- **Budaya Mutu (K1):** SPMI, organisasi penjaminan mutu, dan siklus PPEPP-nya sendiri.
- **PkM (K4):** relevansi PkM, keterlibatan mahasiswa, dan luaran PkM. SIQA hanya mencakup pengakuan kepakaran (Ind. 23).
- **Akuntabilitas (K5):** tata kelola, keuangan, SDM, sarana-prasarana, dan sistem informasi. SIQA hanya mencakup website (Ind. 40).
- **Diferensiasi Misi (K6):** keunikan dan kekhasan PS, termasuk butir 6.6–6.8 khusus S2.
- **Syarat Unggul:** LAM menetapkan syarat minimal untuk peringkat Unggul pada sejumlah butir. SIQA tidak menandainya, sehingga butir yang berpotensi menggagalkan peringkat Unggul tidak terpantau.

## 4. Gap pada mekanisme audit

| Aspek | SIQA saat ini | Yang diminta LAM INFOKOM |
|---|---|---|
| Unit penilaian | 14 indikator dengan ASP | 77–80 butir dengan deskriptor |
| Skala | Acceptable/Concern/Weakness/Defisiensi | Skor 1–4 dengan rubrik per butir |
| Bobot | Tidak ada | Bobot per butir (total 400) |
| Syarat Unggul | Tidak ada | Ditetapkan per butir |
| Struktur | Per indikator | Per kriteria × tahap PPEPP |
| Isian evaluasi | Keterangan bebas + bukti | Faktor pendukung, akar masalah, survei, RTL, SWOT |
| Keluaran | Daftar temuan | Proyeksi nilai, peta PPEPP, bahan RTM |

## 5. Rekomendasi

1. Gunakan butir Matriks LAM sebagai unit audit, menggantikan atau melengkapi indikator SIQA. Pendekatan ini sudah diterapkan di `prototype/`.
2. Tambahkan isian khusus per tahap PPEPP sesuai LED, terutama Evaluasi, Pengendalian, dan Peningkatan.
3. Padankan skala SIQA ke skor LAM (usulan: 4 = Acceptable, 3 = Concern, 2 = Weakness, 1 = Defisiensi) dan tetapkan padanan ini secara resmi.
4. Tandai butir bersyarat Unggul dan pantau di rekap audit.
5. Jadikan rekap temuan per kriteria × tahap sebagai masukan RTM, supaya tahap Pengendalian dan Peningkatan tertutup.
6. Verifikasi data sumber. Total bobot Matriks Sarjana hanya 380,5 dan Magister 400,5, padahal seharusnya 400.
