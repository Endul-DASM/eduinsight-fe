// Bantuan (SRS FR-X-030, FR-X-032; PRD Bagian 11; Figma New Design 187:10604).

export const SUPPORT_EMAIL = "hello@eduinsight.id";

// Panduan Pengguna on Google Drive. Placeholder until the guide is shared: replace with its link (anyone with the
// link can view).
export const USER_GUIDE_URL = "https://drive.google.com/";

export type Faq = { question: string; answer: string };

export const faqs: Faq[] = [
  {
    question: "Apa itu EduInsight?",
    answer:
      "EduInsight adalah platform berbasis AI untuk guru matematika Kurikulum Merdeka. EduInsight membantu Anda menyusun asesmen dari materi ajar sendiri, mendiagnosis ketercapaian Tujuan Pembelajaran (TP) dan miskonsepsi siswa, lalu menyiapkan remedial per kebutuhan belajar. Setiap keluaran AI tetap ditinjau dan disetujui guru sebelum sampai ke siswa.",
  },
  {
    question: "Bagaimana cara menambahkan siswa ke kelas saya?",
    answer:
      "Buka Halaman Mapel, pilih mapel-kelas Anda, lalu bagikan kode kelas yang ada di kartu Dashboard. Siswa memasukkan kode itu setelah masuk ke akun siswanya, dan otomatis terdaftar di kelas Anda.",
  },
  {
    question: "Kenapa saya harus mengisi Kurikulum terlebih dahulu?",
    answer:
      "CP, TP, dan Bab di menu Kurikulum menjadi dasar seluruh fitur. Soal ditandai dengan TP, diagnosis dihitung per TP dan Bab, dan rujukan materi remedial diambil dari Bab atau Subbab tempat TP berada. Bab yang masih berstatus draf belum dipakai sampai disimpan final.",
  },
  {
    question: "Apa saja cara membuat asesmen?",
    answer:
      "Ada tiga cara di menu Asesmen › Buat Asesmen: AI Generated (soal dibuat dari materi yang Anda unggah), Manual (ketik langsung atau unggah template Excel), dan OCR (unggah hasil scan atau PDF soal yang sudah ada). Semua soal bisa Anda edit dan tinjau di langkah Review sebelum asesmen dipublikasikan.",
  },
  {
    question: "Bagaimana membaca label SB, B, C, dan K pada Diagnosis?",
    answer:
      "Label dihitung dari skor rata-rata siswa pada setiap TP atau Bab: Sangat Baik (SB), Baik (B), Cukup (C), dan Kurang (K). Siswa berlabel K menjadi prioritas pendampingan. TP dengan kurang dari 3 butir soal ditandai data terbatas, jadi labelnya perlu dibaca lebih hati-hati.",
  },
  {
    question: "Apa arti label Baik, Revisi, dan Perlu Ditinjau di Analisis Soal?",
    answer:
      "Setiap butir dinilai dari tingkat kesulitan (P-index), daya beda atau validitas (point-biserial), dan pengaruhnya pada reliabilitas asesmen. Baik berarti semua metrik dalam ambang, Revisi berarti satu metrik di luar ambang, dan Perlu Ditinjau berarti dua metrik atau lebih di luar ambang.",
  },
  {
    question: "Siapa saja yang masuk ke daftar remedial?",
    answer:
      "Siswa dengan skor di bawah KKM pada post-test, ulangan harian, UTS, atau UAS otomatis masuk Siswa Target. Soal remedial resmi hanya tampil ke siswa berstatus Perlu Remedial pada asesmen asalnya. Setelah reassessment, siswa dengan skor di atas atau sama dengan KKM berstatus Tuntas.",
  },
  {
    question: "Apakah hasil AI langsung terlihat oleh siswa?",
    answer:
      "Tidak. Soal, pengelompokan siswa, dan rekomendasi remedial dari AI disimpan sebagai draf. Konten baru tampil ke siswa setelah Anda meninjau, mengedit bila perlu, lalu menekan ACC atau mempublikasikan asesmennya.",
  },
  {
    question: "Bagaimana jika saya lupa kata sandi?",
    answer:
      "Gunakan tautan Lupa Kata Sandi di halaman Masuk untuk menerima tautan reset lewat email. Jika akun Anda hanya memakai Google, masuklah dengan tombol Google.",
  },
  {
    question: "Ke mana saya bisa melaporkan kendala?",
    answer: `Kirim email ke ${SUPPORT_EMAIL} dengan menyertakan nama mapel-kelas, halaman tempat kendala terjadi, dan tangkapan layar bila ada. Tim kami merespons paling lambat 1×24 jam kerja.`,
  },
];
