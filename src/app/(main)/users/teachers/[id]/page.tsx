import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Breadcrumbs from '@/components/breadcrumbs'
import dynamic from 'next/dynamic'

const TeacherDetail = dynamic(() => import("./_components"), {
  loading: () => <div className="flex justify-center p-8"><span className="loading loading-spinner loading-lg"></span></div>
})

export const metadata = {
    title: "Detail Guru - Sekolah Aman",
    description: "Lihat detail informasi guru"
}

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function TeacherDetailPage({ params }: PageProps) {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "GURU")) {
        redirect("/auth/signin")
    }

    const { id } = await params

    return <TeacherDetail teacherId={id} />
}