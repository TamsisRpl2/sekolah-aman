import Image from "next/image"

const Footer = () => {
    return <footer className="footer footer-center p-10 bg-base-200 text-base-content">
        <aside>
            <div className="flex items-center gap-2 mb-4">
                <Image src="/logo.png" alt="Logo" width={40} height={40} className="w-10 h-10" />
                <span className="font-bold text-2xl text-primary">Sekolah Aman</span>
            </div>
            <p className="font-bold">
                SMK Taman Siswa 2 Jakarta
            </p>
            <p>Platform Pencatatan Pelanggaran Siswa - Cepat, Transparan, Terintegrasi</p>
            <p>Copyright © 2025 - All rights reserved</p>
        </aside>
        <nav>
            <div className="grid grid-flow-col gap-4">
                <a className="link link-hover">Tentang</a>
                <a className="link link-hover">Kontak</a>
                <a className="link link-hover">Kebijakan Privasi</a>
                <a className="link link-hover">Syarat & Ketentuan</a>
            </div>
        </nav>
    </footer>
}

export default Footer