import { Metadata } from "next"
import dynamic from "next/dynamic"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

const TeachersContent = dynamic(() => import('./_components/teachers-content'))

export const metadata: Metadata = {
    title: "Daftar Guru - Sekolah Aman",
    description: "Kelola data guru dan tenaga pendidik"
}

const page = async () => {
    
    const session = await getServerSession(authOptions)
    
    if (!session) {
        redirect("/auth/signin")
    }

if (session.user.role !== "ADMIN") {
        redirect("/dashboard")
    }

    return <TeachersContent />
}

export default page
