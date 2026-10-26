import Link from "next/link";
import { SUPPORT_EMAIL } from "@/lib/help";
import { type LegalArticle, LegalDocument, LegalList } from "./legal-document";

// Kebijakan Privasi: what EduInsight collects, why, who sees it, how long it is kept and how to have it deleted. The
// AI provider is not named; data is kept while the account is active; deletion is by e-mail request.

const mail = (
  <a className="font-semibold text-[#0058be] underline" href={`mailto:${SUPPORT_EMAIL}`}>
    {SUPPORT_EMAIL}
  </a>
);

const articles: LegalArticle[] = [
  {
    id: "ruang-lingkup",
    title: "Ruang Lingkup",
    body: (
      <p>
        Kebijakan ini menjelaskan cara EduInsight mengumpulkan, memakai, dan melindungi data pribadi guru dan siswa,
        sesuai Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi. Kebijakan ini berlaku bersama{" "}
        <Link className="font-semibold text-[#0058be] underline" href="/terms">
          Ketentuan Layanan
        </Link>
        .
      </p>
    ),
  },
  {
    id: "data",
    title: "Data yang Kami Kumpulkan",
    body: (
      <LegalList
        items={[
          "Data akun: nama, username, email, peran (guru atau siswa), NIS bila diisi, provinsi, dan foto profil bila diunggah.",
          "Data belajar siswa: kelas dan mata pelajaran yang diikuti, jawaban asesmen, nilai, hasil diagnosis per TP, status remedial, dan riwayat membuka materi.",
          "Konten guru: kurikulum, materi, soal, dan asesmen yang dibuat atau diunggah.",
          "Data teknis seperlunya untuk menjalankan dan mengamankan layanan, misalnya waktu masuk dan catatan kesalahan.",
        ]}
      />
    ),
  },
  {
    id: "penggunaan",
    title: "Cara Kami Memakai Data",
    body: (
      <LegalList
        items={[
          "Menjalankan asesmen, menghitung nilai dan diagnosis per TP, menyusun remedial, dan mengirim notifikasi di dalam aplikasi.",
          "Membantu guru memahami capaian kelas dan siswa yang perlu dibantu.",
          "Menjaga keamanan akun dan memperbaiki layanan.",
          "Data tidak dijual dan tidak dipakai untuk iklan.",
        ]}
      />
    ),
  },
  {
    id: "akses",
    title: "Siapa yang Dapat Melihat Data",
    body: (
      <LegalList
        items={[
          "Siswa melihat nilai, jawaban, dan hasil diagnosisnya sendiri.",
          "Guru melihat data siswa di mata pelajaran yang ia ampu saja.",
          "Admin EduInsight hanya melihat data agregat dan metadata, tidak membuka jawaban atau nilai siswa satu per satu.",
        ]}
      />
    ),
  },
  {
    id: "pihak-ketiga",
    title: "AI dan Pihak Ketiga",
    body: (
      <LegalList
        items={[
          "Untuk fitur AI, sebagian data dikirim ke penyedia layanan AI dalam bentuk anonim; nama siswa tidak ikut dikirim.",
          "Bila kamu masuk dengan akun Google, EduInsight hanya menerima nama dan email dari Google.",
          "Data tidak dibagikan ke pihak lain, kecuali diwajibkan oleh hukum.",
        ]}
      />
    ),
  },
  {
    id: "penyimpanan",
    title: "Penyimpanan dan Keamanan",
    body: (
      <LegalList
        items={[
          "Data disimpan selama akun aktif.",
          "Kata sandi disimpan dalam bentuk hash dan tidak pernah disimpan sebagai teks biasa.",
          "Akses data dibatasi sesuai peran pengguna.",
        ]}
      />
    ),
  },
  {
    id: "hak",
    title: "Hak Pengguna",
    body: (
      <LegalList
        items={[
          "Melihat dan memperbaiki data akun lewat menu Profil.",
          <>Meminta salinan data atau penghapusan akun dengan mengirim email ke {mail}. Permintaan diproses setelah identitas pemilik akun dipastikan.</>,
          "Setelah akun dihapus, data pribadi di akun tersebut ikut dihapus, kecuali yang wajib disimpan menurut hukum.",
        ]}
      />
    ),
  },
  {
    id: "anak",
    title: "Data Siswa di Bawah Umur",
    body: (
      <p>
        Sebagian besar siswa masih di bawah umur. Siswa memakai EduInsight dalam kegiatan belajar yang diarahkan sekolah dan
        guru. Orang tua atau wali dapat menghubungi kami untuk menanyakan atau meminta penghapusan data anaknya.
      </p>
    ),
  },
  {
    id: "perubahan",
    title: "Perubahan Kebijakan",
    body: (
      <p>
        Kebijakan ini dapat diperbarui sewaktu-waktu. Tanggal berlaku di atas halaman ini menandai versi terbaru, dan
        perubahan penting akan diumumkan di dalam aplikasi.
      </p>
    ),
  },
  {
    id: "kontak",
    title: "Kontak",
    body: <p>Pertanyaan tentang privasi dan permintaan terkait data dapat dikirim ke {mail}.</p>,
  },
];

export function PrivacyPage() {
  return (
    <LegalDocument
      articles={articles}
      chip="Kebijakan Privasi"
      effectiveDate="25 Oktober 2026"
      lead="Kebijakan ini menjelaskan data apa yang dikumpulkan EduInsight, untuk apa, siapa yang dapat melihatnya, dan hak kamu atas data tersebut."
      title="Kebijakan Privasi EduInsight"
    />
  );
}
