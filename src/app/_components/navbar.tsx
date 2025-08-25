import Image from "next/image"
import Link from "next/link"

const Navbar = () => {
    return <div className="navbar bg-transparent absolute top-0 left-0 right-0 z-50">
        <div className="navbar-start">
            <div className="dropdown">
                <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16"></path>
                    </svg>
                </div>
                <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100/95 backdrop-blur-sm rounded-box w-52">
                    <li><Link href="">Beranda</Link></li>
                    <li><Link href="">Tentang</Link></li>
                    <li><Link href="">Fitur</Link></li>
                    <li><Link href="">Kontak</Link></li>
                </ul>
            </div>
            <Link href="" className="btn btn-ghost text-xl font-bold text-primary">
                <Image src="/logo.png" alt="Logo" width={32} height={32} className="w-8 h-8" />
                Sekolah Aman
            </Link>
        </div>
        <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1">
                <li><Link href="" className="hover:text-primary">Beranda</Link></li>
                <li><Link href="" className="hover:text-primary">Tentang</Link></li>
                <li><Link href="" className="hover:text-primary">Fitur</Link></li>
                <li><Link href="" className="hover:text-primary">Kontak</Link></li>
            </ul>
        </div>
        <div className="navbar-end">
            <Link href="/auth/signin" className="btn btn-primary rounded-lg text-white">Masuk</Link>
        </div>
    </div>
}

export default Navbar
