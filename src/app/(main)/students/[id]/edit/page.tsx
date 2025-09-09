import { use } from 'react'
import { Metadata } from "next"
import dynamic from "next/dynamic"
import Breadcrumbs from '@/components/breadcrumbs'

const Form = dynamic(() => import('../_components/form'))

interface Props {
    params: Promise<{ id: string }>
}

export const metadata: Metadata = {
    title: "Edit Siswa"
}

export default function EditStudentPage({ params }: Props) {
    const resolvedParams = use(params)

    return (
        <main>
            <h1 className="text-2xl font-bold">Edit Siswa</h1>
            <Breadcrumbs items={[
                { text: 'Daftar Siswa', link: '/students' },
                { text: 'Detail Siswa', link: `/students/${resolvedParams.id}` },
                { text: 'Edit Siswa' },
            ]} />

            <div className="mt-10">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <Form studentId={resolvedParams.id} />
                </div>
            </div>
        </main>
    )
}
