import { ReactNode } from "react"
import { 
    FaChalkboardTeacher, 
    FaEdit,
    FaBriefcase,
    FaHistory,
    FaCalendarAlt
} from "react-icons/fa"
import { MdDashboard } from "react-icons/md"
import { PiStudentFill } from "react-icons/pi"
import { IoSettingsSharp, IoAnalytics, IoStatsChart, IoWarning, IoDocumentText } from "react-icons/io5"

export interface Menu {
    text: string,
    link: string,
    icon: ReactNode,
    children?: Menu[]
}

export const menu: Menu[] = [
    {
        text: "Dashboard",
        link: "/dashboard",
        icon: <MdDashboard className="w-5 h-5" />
    },
    {
        text: "Daftar Guru",
        link: "/users/teachers",
        icon: <FaChalkboardTeacher className="w-4 h-4" />
    },
    {
        text: "Daftar Siswa",
        link: "/students",
        icon: <PiStudentFill className="w-4 h-4" />
    },
    {
        text: "Berita Acara",
        link: "/berita-acara",
        icon: <IoDocumentText className="w-4 h-4" />
    },
    {
        text: "Data Master",
        link: "/master",
        icon: <IoSettingsSharp className="w-4 h-4" />,
        children: [
            {
                text: "Daftar Pelanggaran",
                link: "/master/violations",
                icon: <IoWarning className="w-4 h-4" />
            }
        ]
    },
    {
        text: "Pencatatan Kasus",
        link: "/cases",
        icon: <FaEdit className="w-5 h-5" />,
        children: [
            {
                text: "Daftar Kasus",
                link: "/cases",
                icon: <FaBriefcase className="w-4 h-4" />
            },
            {
                text: "Riwayat Sanksi",
                link: "/sanctions-history",
                icon: <FaHistory className="w-4 h-4" />
            }
        ]
    },
    {
        text: "Laporan & Analisis",
        link: "/reports",
        icon: <IoAnalytics className="w-5 h-5" />,
        children: [
            {
                text: "Laporan Bulanan",
                link: "/reports/monthly",
                icon: <FaCalendarAlt className="w-4 h-4" />
            },
            {
                text: "Statistik Pelanggaran",
                link: "/reports/statistics",
                icon: <IoStatsChart className="w-4 h-4" />
            },
        ]
    },
]
