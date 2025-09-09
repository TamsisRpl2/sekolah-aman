'use client'

import Image from "next/image"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { IoPerson, IoSettings, IoLogOut, IoMenu } from "react-icons/io5"
import { usePathname } from "next/navigation"
import DynamicAvatar from "@/components/dynamic-avatar"

const Topbar = () => {
    const { data: session, status } = useSession()
    const pathname = usePathname()

    const handleSignOut = async () => {
        await signOut({ callbackUrl: "/auth/signin" })
    }

    const getRoleBadge = (role: string) => {
        if (role === "ADMIN") {
            return <span className="badge badge-primary badge-sm">Admin</span>
        } else if (role === "GURU") {
            return <span className="badge badge-secondary badge-sm">Guru</span>
        }
        return null
    }

    const getPageTitle = () => {
        const path = pathname
        
        if (path === '/dashboard') return 'Dashboard'
        if (path.startsWith('/cases')) {
            if (path === '/cases') return 'Manajemen Kasus'
            if (path === '/cases/add') return 'Tambah Kasus Baru'
            if (path.includes('/action')) return 'Detail Tindakan'
            return 'Detail Kasus'
        }
        if (path.startsWith('/students')) {
            if (path === '/students') return 'Data Siswa'
            if (path === '/students/add') return 'Tambah Siswa'
            return 'Detail Siswa'
        }
        if (path.startsWith('/users/teachers')) {
            if (path === '/users/teachers') return 'Data Guru'
            if (path === '/users/teachers/add') return 'Tambah Guru'
            return 'Detail Guru'
        }
        if (path === '/master/violations') return 'Master Pelanggaran'
        if (path === '/master/sanctions') return 'Master Sanksi'
        if (path === '/reports/monthly') return 'Laporan Bulanan'
        if (path === '/reports/statistics') return 'Statistik Pelanggaran'
        if (path === '/sanctions-history') return 'Riwayat Sanksi'
        if (path === '/profile') return 'Profile Pengguna'
        if (path === '/settings') return 'Pengaturan'
        
        return 'Dashboard'
    }

    return (
        <div className="navbar bg-white shadow-sm border-b border-gray-200 px-6">
            <div className="navbar-start lg:hidden">
                <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost">
                    <IoMenu className="w-5 h-5" />
                </label>
            </div>

            <div className="navbar-center lg:navbar-start">
                <h1 className="text-lg font-semibold text-gray-800">{getPageTitle()}</h1>
            </div>

            <div className="navbar-end">
                <div className="flex items-center gap-2">
                    {status === "loading" ? (
                        <div className="skeleton w-8 h-8 rounded-full"></div>
                    ) : session ? (
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                                <DynamicAvatar 
                                    userId={session.user?.id}
                                    name={session.user?.name || ''}
                                    image={session.user?.image}
                                    size="md"
                                />
                            </div>
                            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-60">
                                <li className="menu-title">
                                    <div className="flex flex-col items-start">
                                        <span className="font-medium">{session.user?.name}</span>
                                        <span className="text-xs text-gray-500">{session.user?.email}</span>
                                        <div className="mt-1">
                                            {getRoleBadge(session.user?.role)}
                                        </div>
                                    </div>
                                </li>
                                <div className="divider my-1"></div>
                                <li>
                                    <Link href="/profile" className="flex items-center gap-3">
                                        <IoPerson className="w-4 h-4" />
                                        Profile
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/settings" className="flex items-center gap-3">
                                        <IoSettings className="w-4 h-4" />
                                        Settings
                                    </Link>
                                </li>
                                <div className="divider my-1"></div>
                                <li>
                                    <button 
                                        onClick={handleSignOut}
                                        className="flex items-center gap-3 text-red-600 hover:bg-red-50 w-full text-left"
                                    >
                                        <IoLogOut className="w-4 h-4" />
                                        Keluar
                                    </button>
                                </li>
                            </ul>
                        </div>
                    ) : (
                        <Link 
                            href="/auth/signin"
                            className="btn btn-primary btn-sm"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Topbar
