'use client'

import { useState, useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { menu, Menu } from "./menu"

const Sidenav = () => {
    const [openMenus, setOpenMenus] = useState<Set<string>>(new Set())
    const pathname = usePathname()

    const isMenuActive = useCallback((item: Menu): boolean => {
        if (pathname === item.link) return true
        if (item.children) {
            return item.children.some((child: Menu) => isMenuActive(child))
        }
        return false
    }, [pathname])

    const isPathActive = (link: string): boolean => {
        return pathname === link || pathname.startsWith(link + '/')
    }

    const toggleMenu = (link: string) => {
        const newOpenMenus = new Set(openMenus)
        if (newOpenMenus.has(link)) {
            newOpenMenus.delete(link)
        } else {
            newOpenMenus.add(link)
        }
        setOpenMenus(newOpenMenus)
    }

    useEffect(() => {
        const newOpenMenus = new Set<string>()
        menu.forEach(item => {
            if (item.children && isMenuActive(item)) {
                newOpenMenus.add(item.link)
            }
        })
        setOpenMenus(newOpenMenus)
    }, [pathname, isMenuActive])

    const renderMenuItem = (item: Menu, isChild = false) => {
        const hasChildren = item.children && item.children.length > 0
        const isActive = isPathActive(item.link)
        const isOpen = openMenus.has(item.link)

        return (
            <li key={item.link}>
                {hasChildren ? (
                    <>
                        <button
                            className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                                isActive 
                                    ? 'bg-primary text-primary-content font-medium' 
                                    : 'hover:bg-base-300 text-base-content'
                            } ${isChild ? 'text-sm pl-6' : ''}`}
                            onClick={() => toggleMenu(item.link)}
                        >
                            <div className="flex items-center gap-3">
                                {item.icon}
                                <span>{item.text}</span>
                            </div>
                            <svg 
                                className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </button>
                        {isOpen && (
                            <ul className="ml-4 mt-2 space-y-1">
                                {item.children?.map((child: Menu) => renderMenuItem(child, true))}
                            </ul>
                        )}
                    </>
                ) : (
                    <Link
                        href={item.link}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                            isActive 
                                ? 'bg-primary font-medium text-white' 
                                : 'hover:bg-base-300 text-base-content'
                        } ${isChild ? 'text-sm pl-6' : ''}`}
                    >
                        {item.icon}
                        <span>{item.text}</span>
                    </Link>
                )}
            </li>
        )
    }

    return (
        <div className="drawer-side">
            <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
            <div className="bg-transparant text-base-content min-h-full w-80">
                <div className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                            <Image 
                                src="/logo.png" 
                                alt="Logo Sekolah Aman" 
                                width={40} 
                                height={40} 
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg">Sekolah Aman</h2>
                            <p className="text-sm text-base-content/70">Sistem Pencatatan</p>
                        </div>
                    </div>
                </div>


                <div className="p-4">
                    <ul className="space-y-2">
                        {menu.map(item => renderMenuItem(item))}
                    </ul>
                </div>


                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-base-300">
                    <div className="text-center">
                        <p className="text-xs text-base-content/60">
                            SMK Taman Siswa 2 Jakarta
                        </p>
                        <p className="text-xs text-base-content/50">
                            v1.0.0
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Sidenav