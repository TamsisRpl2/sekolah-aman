import type { Metadata } from "next";
import NextTopLoader from 'nextjs-toploader';
import AuthProvider from "@/components/auth-provider";
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
      <body suppressHydrationWarning={true}>
        <AuthProvider>
          <NextTopLoader
            color="#2563eb"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={true}
            easing="ease"
            speed={200}
            shadow="0 0 10px #2563eb,0 0 5px #2563eb"
            template='<div class="bar" role="bar"><div class="peg"></div></div> 
            <div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
            zIndex={1600}
            showAtBottom={false}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
