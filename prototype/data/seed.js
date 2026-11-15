// Data contoh untuk prototype SIQA-INFOKOM.
// Isian contoh PS Doktor Ilmu Komputer diambil dari keterangan unit pada SIQA (AIM Siklus 25 Tahun 2026).

window.SEED = {
  siklus: "Audit Mutu Internal LAM INFOKOM Tahun 2026",
  penugasan: [
    { id: "s3-ilkom", unit: "Program Studi Doktor Ilmu Komputer", jenjang: "S3", auditee: "CANDRA DEWI",
      mulai: "2026-10-19", batasAuditee: "2026-11-27", batasAuditor: "2026-12-11" },
    { id: "s2-ilkom", unit: "Program Studi Magister Ilmu Komputer", jenjang: "S2", auditee: "FITRA ABDURRACHMAN BACHTIAR",
      mulai: "2026-10-19", batasAuditee: "2026-11-27", batasAuditor: "2026-12-11" },
    { id: "s2-si", unit: "Program Studi Magister Sistem Informasi", jenjang: "S2", auditee: "ARYO PINANDITO",
      mulai: "2026-10-19", batasAuditee: "2026-11-27", batasAuditor: "2026-12-11" },
    { id: "s1-ti", unit: "Program Studi Sarjana Teknologi Informasi", jenjang: "S1", auditee: "BUCE TRIAS HANGGARA",
      mulai: "2026-10-19", batasAuditee: "2026-11-27", batasAuditor: "2026-12-11" },
    { id: "s1-pti", unit: "Program Studi Sarjana Pendidikan Teknologi Informasi", jenjang: "S1", auditee: "ADMAJA DWI HERLAMBANG",
      mulai: "2026-10-19", batasAuditee: "2026-11-27", batasAuditor: "2026-12-11" },
    { id: "s1-tk", unit: "Program Studi Sarjana Teknik Komputer", jenjang: "S1", auditee: "AGUNG SETIA BUDI",
      mulai: "2026-10-19", batasAuditee: "2026-11-27", batasAuditor: "2026-12-11" },
    { id: "s1-si", unit: "Program Studi Sarjana Sistem Informasi", jenjang: "S1", auditee: "MOCHAMAD CHANDRA SAPUTRA",
      mulai: "2026-10-19", batasAuditee: "2026-11-27", batasAuditor: "2026-12-11" }
  ],

  // Pemetaan awal indikator SIQA (AIM Siklus 25) ke butir Matriks LAM INFOKOM yang tersentuh sebagian.
  // Perlu diverifikasi oleh tim penjaminan mutu.
  siqaMap: [
    { ind: "Ind. 4", nama: "Pengakuan mutu: akreditasi PS", butir: ["B", "6.3"] },
    { ind: "Ind. 5", nama: "Kebijakan & pedoman kurikulum OBE", butir: ["2.1.B", "2.2.B"] },
    { ind: "Ind. 6", nama: "Rasio mahasiswa / dosen", butir: ["2.1.A", "2.2.A"] },
    { ind: "Ind. 7", nama: "Kecukupan dosen tetap, PDTT, Guru Besar", butir: ["2.1.A", "2.2.A"] },
    { ind: "Ind. 10", nama: "Perbaikan proses pembelajaran", butir: ["2.2.C", "2.3.C"] },
    { ind: "Ind. 11", nama: "Jabatan akademik dosen tetap", butir: ["2.2.A"] },
    { ind: "Ind. 12", nama: "Analisis luaran pendidikan, masa studi", butir: ["2.3.D"] },
    { ind: "Ind. 14", nama: "Pengakuan kompetensi lulusan", butir: ["2.2.D"] },
    { ind: "Ind. 15", nama: "Analisis prestasi & keterserapan lulusan", butir: ["2.2.D", "2.3.D"] },
    { ind: "Ind. 17", nama: "Proses penelitian", butir: ["3.2.A", "3.2.B"] },
    { ind: "Ind. 18", nama: "Hasil penelitian", butir: ["3.2.C"] },
    { ind: "Ind. 23", nama: "Pengakuan kepakaran (PkM)", butir: ["4.2.C"] },
    { ind: "Ind. 40", nama: "Website", butir: ["5.2.A"] },
    { ind: "Ind. 41", nama: "Temuan lama & laporan Tinjauan Manajemen", butir: ["1.4.B", "5.4.B"] }
  ],

  data: {
    "s3-ilkom": {
      meta: { submittedMandiri: "2026-11-10" },
      mandiri: {
        "B": {
          narasi: "PS Doktor Ilmu Komputer FILKOM UB memperoleh izin penyelenggaraan melalui Keputusan Rektor Nomor 6433 Tahun 2024 (23 Juli 2024) dan mulai menerima mahasiswa pada semester Ganjil 2025/2026. PS tercatat aktif pada PD Dikti (kode 55001) dengan status akreditasi Baik sejak 13 Agustus 2025.\n\nPS memiliki 6 dosen tetap homebase (3 Profesor, 3 Lektor Kepala) dan 34 mahasiswa aktif pada TA 2025/2026 (19 penerimaan Ganjil, 15 penerimaan Genap). Mahasiswa berasal dari Jawa Timur, Mataram, Makassar, dan Samarinda; sekitar 90% merupakan dosen PTN/PTS.",
          skor: 3,
          bukti: [{ judul: "Data Mahasiswa S3 Aktif TA 2025/2026", url: "" }, { judul: "SK Rektor No. 6433 Tahun 2024", url: "" }]
        },
        "2.1.B": {
          narasi: "Kurikulum PS disusun berbasis OBE mengacu pada Peraturan Rektor UB Nomor 36 Tahun 2023 tentang Pedoman Penyusunan Kurikulum OBE, dengan melibatkan masukan pemangku kepentingan. Masa tempuh kurikulum minimal 6 semester dan maksimal 12 semester (Pertor 94/2024).",
          indikator: "Kurikulum memenuhi KKNI level 9; seluruh mata kuliah memiliki RPS OBE.",
          aspek: [true, true],
          skor: 3,
          bukti: [{ judul: "5.1_Per-36-2023 Pedoman Penyusunan Kurikulum OBE", url: "" }, { judul: "Buku Kurikulum Doktor Ilmu Komputer", url: "" }]
        },
        "2.2.A": {
          narasi: "PS memiliki 6 DTPR (3 Guru Besar, 3 Lektor Kepala; DJTA GB+LK = 100%). Rasio mahasiswa aktif terhadap dosen penghitung rasio = 66/11 = 6. Terdapat 5 dosen non-homebase yang mengampu di PS S3 sehingga PDTT = 45%.",
          lkps: "Tabel DTPR & rasio dosen-mahasiswa LKPS",
          aspek: [true, true, false, true],
          skor: 3,
          bukti: [{ judul: "DUK Pendidikan FILKOM", url: "" }]
        },
        "2.2.C": {
          narasi: "Pembelajaran menggunakan RPS OBE dan platform digital Brone. Kelas Reguler 2 diselenggarakan secara hibrida (daring dan luring) untuk fleksibilitas. Diskusi riset berkala diselenggarakan oleh setiap promotor.",
          lkps: "Tabel kelengkapan portofolio PBM per mata kuliah",
          aspek: [true, true, true, false],
          skor: 3,
          bukti: [{ judul: "RPS OBE PS Doktor Ilmu Komputer", url: "" }, { judul: "Brone PS S3 Ilmu Komputer", url: "" }]
        },
        "2.3.D": {
          narasi: "PS belum memiliki lulusan karena baru menerima mahasiswa sejak Ganjil 2025/2026. Evaluasi prestasi mahasiswa dilakukan melalui monitoring publikasi dan kemajuan disertasi.",
          pendukung: "Sebagian besar mahasiswa adalah dosen aktif dengan rekam jejak publikasi.",
          akar: "PS baru berjalan; instrumen tracer study dan survei pengguna lulusan untuk jenjang S3 belum disusun.",
          survei: "",
          aspek: [true, false, false],
          skor: 2,
          bukti: []
        },
        "1.4.B": {
          narasi: "Temuan AIM 2026 butir ASP-05-1-7 (RPL dan micro-credential belum diterapkan) ditindaklanjuti dengan kajian mekanisme RPL untuk jenjang S3.",
          rtl: "Penyusunan kajian dan usulan mekanisme RPL S3 ke fakultas, target semester Genap 2026/2027.",
          aspek: [true, false],
          skor: 2,
          bukti: []
        }
      },
      audit: {
        "B": { skor: 3, aspek: [], catatan: "Profil ringkas dan konsisten dengan data PD Dikti.", rekomendasi: "Lengkapi profil dengan data keuangan, sarana-prasarana, dan sistem penjaminan mutu.", batas: "" },
        "2.1.B": { skor: 3, aspek: [true, true], catatan: "Pedoman OBE dan buku kurikulum tersedia. Saat AL: cek bukti dukung karena perlu akses ke drive.", rekomendasi: "", batas: "" },
        "2.2.A": { skor: 3, aspek: [true, true, false, true], catatan: "Jumlah dan jabatan akademik DTPR memadai, tetapi PDTT 45% dan Guru Besar 50% (< 60%).", rekomendasi: "Susun rencana pemenuhan Guru Besar dan pengurangan ketergantungan pada dosen non-homebase.", batas: "2027-06-30" },
        "2.3.D": { skor: 2, aspek: [true, false, false], catatan: "Belum ada evaluasi kompetensi lulusan dan instrumen tracer study S3.", rekomendasi: "Rancang instrumen tracer study dan survei pengguna lulusan S3 sebelum lulusan pertama.", batas: "2027-03-31" }
      }
    }
  }
};
