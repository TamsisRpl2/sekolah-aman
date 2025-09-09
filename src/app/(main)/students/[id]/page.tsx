import { use } from 'react'
import dynamic from 'next/dynamic'
import Breadcrumbs from '@/components/breadcrumbs'

const StudentDetailClient = dynamic(() => import('./_components/student-detail-client'))

interface Props {
    params: Promise<{ id: string }>
}

export default function StudentDetailPage({ params }: Props) {
    const resolvedParams = use(params)

    return (
        <main>
            <h1 className="text-2xl font-bold">Detail Siswa</h1>
            <Breadcrumbs items={[
                { text: 'Daftar Siswa', link: '/students' },
                { text: 'Detail Siswa' },
            ]} />

            <div className="mt-10">
                <StudentDetailClient studentId={resolvedParams.id} />
            </div>
        </main>
    )
}