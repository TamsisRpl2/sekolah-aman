import { Metadata } from "next"
import dynamic from "next/dynamic"

const StudentsContent = dynamic(() => import('./_components/students-content'))

export const metadata: Metadata = {
    title: "Daftar Siswa"
}

const page = () => {
    return <StudentsContent />
}

export default page
