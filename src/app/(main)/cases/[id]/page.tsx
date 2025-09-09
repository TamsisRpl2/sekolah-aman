import dynamic from 'next/dynamic'
import Link from 'next/link'
import { IoAdd, IoList } from 'react-icons/io5'

const Breadcrumbs = dynamic(() => import('@/components/breadcrumbs'))
const Form = dynamic(() => import('./_components/form'))

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    
    return <main className="p-6">
        <div className="flex justify-between items-start mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Detail & Edit Kasus</h1>
                <p className="text-gray-600">Kelola informasi detail kasus pelanggaran</p>
            </div>
            <Link 
                href={`/cases/${id}/action`}
                className="btn bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 text-white"
            >
                <IoAdd className="w-4 h-4" />
                Kelola Tindakan
            </Link>
        </div>
        
        <Breadcrumbs items={[
            { text: 'Daftar Kasus', link: '/cases' },
            { text: 'Detail & Edit Kasus' },
        ]} />

        <div className="mt-8">
            <Form />
        </div>
    </main>
}

export default page