import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Sekolah Aman",
    template: "%s | Sekolah Aman",
  },
  description: "Platform pencatatan pelanggaran siswa SMK Taman Siswa 2 Jakarta—cepat, transparan, dengan dashboard, verifikasi BK, notifikasi, dan laporan otomatis.",
  keywords: ["pencatatan pelanggaran", 'ketertiban sekolah', 'BK', 'wali kelas', 'SMK Taman Siswa 2 Jakarta', 'sistem disiplin', 'poin pelanggaran', 'laporan siswa', 'dashboard sekolah']
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="sekolah_aman">
      <body>
        {children}
      </body>
    </html>
  );
}
