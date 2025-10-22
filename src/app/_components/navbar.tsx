import Image from "next/image"
import Link from "next/link"
import { IoMenu } from "react-icons/io5"

const Navbar = () => {
    return <div className="navbar bg-white/80 backdrop-blur-md shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="navbar-start">
            <div className="dropdown">
                <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                    <IoMenu className="w-5 h-5" />
                </div>
                <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-white/95 backdrop-blur-sm rounded-box w-52">
                    <li><Link href="/">Beranda</Link></li>
                    <li><Link href="/public/berita-acara">Berita Acara</Link></li>
                </ul>
            </div>
            <Link href="/" className="btn btn-ghost text-xl font-bold text-primary">
                <Image src="/logo.png" alt="Logo" width={32} height={32} className="w-8 h-8" />
                Sekolah Aman
            </Link>
        </div>
        <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1">
                <li><Link href="/" className="hover:text-primary font-medium">Beranda</Link></li>
                <li><Link href="/public/berita-acara" className="hover:text-primary font-medium">Berita Acara</Link></li>
            </ul>
        </div>
        <div className="navbar-end">
            <Link href="/auth/signin" className="btn bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-0 text-white rounded-xl shadow-lg">Masuk</Link>
        </div>
    </div>
}

export default Navbar
