import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dynamic from 'next/dynamic'

const AddTeacherForm = dynamic(() => import("./_components/form"), {
  loading: () => <div className="flex justify-center p-8"><span className="loading loading-spinner loading-lg"></span></div>
})

export const metadata = {
    title: "Tambah Guru - Sekolah Aman",
    description: "Tambah guru baru ke sistem"
}

export default async function AddTeacherPage() {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/auth/signin")
    }

    return <AddTeacherForm />
}
