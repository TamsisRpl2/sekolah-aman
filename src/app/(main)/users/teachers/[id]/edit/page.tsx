import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dynamic from 'next/dynamic'

const EditTeacherForm = dynamic(() => import("./_components"), {
  loading: () => <div className="flex justify-center p-8"><span className="loading loading-spinner loading-lg"></span></div>
})

export const metadata = {
    title: "Edit Guru - Sekolah Aman",
    description: "Edit informasi guru"
}

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function EditTeacherPage({ params }: PageProps) {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/auth/signin")
    }

    const { id } = await params

    return <EditTeacherForm teacherId={id} />
}
