import Link from "next/link";
import { SUPPORT_EMAIL } from "@/lib/help";
import { type LegalArticle, LegalDocument, LegalList } from "./legal-document";

// Ketentuan Layanan (UAT baris 198).

const articles: LegalArticle[] = [
  {
    id: "tentang",
    title: "Tentang EduInsight",
    body: (
      <p>
        EduInsight adalah platform diagnosis pembelajaran berbasis Tujuan Pembelajaran (TP) Kurikulum Merdeka. Guru menyusun
        kurikulum, materi, dan asesmen; sistem menghitung capaian per TP, menemukan pola miskonsepsi, dan membantu menyusun
        remedial. Siswa mengerjakan asesmen dan melihat hasil diagnosisnya sendiri. Dengan membuat akun atau memakai
        EduInsight, kamu menyetujui ketentuan ini dan{" "}
        <Link className="font-semibold text-[#0058be] underline" href="/privacy">
          Kebijakan Privasi
        </Link>
        .
      </p>
    ),
  },
  {
    id: "akun",
    title: "Akun dan Peran",
    body: (
      <LegalList
        items={[
          "Ada tiga peran: Guru, Siswa, dan Admin. Admin adalah tim EduInsight, bukan pihak sekolah.",
          "Akun dibuat dengan username dan email, atau lewat akun Google. Satu email hanya untuk satu akun, dan username tidak dapat dipakai dua kali.",
          "Kamu bertanggung jawab menjaga kerahasiaan kata sandi dan atas semua aktivitas di akunmu. Segera ganti kata sandi dan hubungi kami bila akunmu dipakai orang lain.",
          "Isi data diri dengan benar. Siswa bergabung ke mata pelajaran memakai kode kelas dari guru.",
        ]}
      />
    ),
  },
  {
    id: "guru",
    title: "Penggunaan oleh Guru",
    body: (
      <LegalList
        items={[
          "Guru hanya mengelola kelas dan mata pelajaran yang ia buat atau ampu.",
          "Materi, soal, dan dokumen yang diunggah menjadi tanggung jawab guru, termasuk izin dan hak cipta atas isinya. Jangan mengunggah materi yang melanggar hak orang lain.",
          "Nilai, label diagnosis, dan paket remedial dipakai untuk pembelajaran, dengan tetap mempertimbangkan penilaian guru.",
        ]}
      />
    ),
  },
  {
    id: "siswa",
    title: "Penggunaan oleh Siswa",
    body: (
      <LegalList
        items={[
          "Kerjakan asesmen sendiri dan jujur sesuai aturan yang ditetapkan guru.",
          "Jangan membagikan akun, kata sandi, atau kode kelas kepada orang yang tidak berhak.",
          "Materi dan soal latihan hanya untuk belajar pribadi dan tidak boleh disebarkan tanpa izin guru.",
        ]}
      />
    ),
  },
  {
    id: "data",
    title: "Data Siswa dan Privasi",
    body: (
      <LegalList
        items={[
          "Nilai, jawaban, dan hasil diagnosis siswa hanya dapat dilihat oleh guru mata pelajaran tersebut dan siswa yang bersangkutan.",
          "Admin hanya melihat data agregat dan metadata, tidak membuka jawaban atau nilai siswa satu per satu.",
          <>
            Data pribadi dikelola sesuai Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi. Rinciannya ada di{" "}
            <Link className="font-semibold text-[#0058be] underline" href="/privacy">
              Kebijakan Privasi
            </Link>
            .
          </>,
        ]}
      />
    ),
  },
  {
    id: "ai",
    title: "Fitur Kecerdasan Buatan (AI)",
    body: (
      <LegalList
        items={[
          "AI membantu membuat draf soal, membaca dokumen soal, menjelaskan miskonsepsi, dan menyusun soal latihan. Keluaran AI bisa keliru.",
          "Setiap keluaran AI ditinjau dan disetujui guru sebelum sampai ke siswa.",
          "Penggunaan AI dibatasi kuota agar layanan tetap adil untuk semua pengguna.",
        ]}
      />
    ),
  },
  {
    id: "larangan",
    title: "Larangan",
    body: (
      <LegalList
        items={[
          "Mengakses akun, kelas, atau data milik orang lain tanpa izin.",
          "Mengunggah konten yang melanggar hukum, mengandung SARA, pornografi, kekerasan, atau perundungan.",
          "Mengganggu, membebani, atau mencoba membobol sistem EduInsight.",
        ]}
      />
    ),
  },
  {
    id: "perubahan",
    title: "Perubahan Ketentuan",
    body: (
      <p>
        Ketentuan ini dapat diperbarui sewaktu-waktu. Tanggal berlaku di atas halaman ini menandai versi terbaru, dan
        perubahan penting akan diumumkan di dalam aplikasi. Dengan tetap memakai EduInsight setelah perubahan, kamu menyetujui
        ketentuan yang baru.
      </p>
    ),
  },
  {
    id: "kontak",
    title: "Kontak",
    body: (
      <p>
        Pertanyaan tentang ketentuan ini dapat dikirim ke{" "}
        <a className="font-semibold text-[#0058be] underline" href={`mailto:${SUPPORT_EMAIL}`}>
          {SUPPORT_EMAIL}
        </a>{" "}
        atau melalui menu Bantuan di dalam aplikasi.
      </p>
    ),
  },
];

export function TermsPage() {
  return (
    <LegalDocument
      articles={articles}
      chip="Ketentuan Layanan"
      effectiveDate="25 Oktober 2026"
      lead="Ketentuan ini mengatur penggunaan EduInsight oleh guru dan siswa. Bacalah dengan saksama sebelum memakai layanan."
      title="Ketentuan Layanan EduInsight"
    />
  );
}
