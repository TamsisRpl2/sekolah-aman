import dynamic from 'next/dynamic'

const Breadcrumbs = dynamic(() => import('@/components/breadcrumbs'))
const Form = dynamic(() => import('./_components/form'))
const Timeline = dynamic(() => import('./_components/timeline'))

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    
    return <main className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Manajemen Tindakan Kasus</h1>
        <p className="text-gray-600 mb-6">Kelola tindakan untuk kasus pelanggaran</p>
        
        <Breadcrumbs items={[
            { text: 'Daftar Kasus', link: '/cases' },
            { text: `Detail Kasus`, link: `/cases/${id}` },
            { text: 'Tindakan Kasus' },
        ]} />

        <div className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <Form />
                </div>
                <div>
                    <Timeline />
                </div>
            </div>
        </div>
    </main>
}

export default page