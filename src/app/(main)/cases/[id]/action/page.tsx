import dynamic from 'next/dynamic'

const Breadcrumbs = dynamic(() => import('@/components/breadcrumbs'))
const Form = dynamic(() => import('./_components/form'))
const Timeline = dynamic(() => import('./_components/timeline'))

const page = () => {
    return <main>
        <h1 className="text-2xl font-bold">Tindakan Pelanggaran</h1>
        <Breadcrumbs items={[
            { text: 'Daftar Pelanggaran', 'link': '/cases' },
            { text: 'Tindakan Pelanggaran' },
        ]} />

        <div className="mt-10">
            <div className="grid grid-cols-2 gap-10">
                <Form />
                <Timeline />
            </div>
        </div>
    </main>
}

export default page