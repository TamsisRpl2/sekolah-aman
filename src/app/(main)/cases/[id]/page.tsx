import dynamic from 'next/dynamic'

const Breadcrumbs = dynamic(() => import('@/components/breadcrumbs'))
const Form = dynamic(() => import('./_components/form'))

const page = () => {
    return <main>
        <h1 className="text-2xl font-bold">Edit Pelanggaran</h1>
        <Breadcrumbs items={[
            { text: 'Daftar Pelanggaran', 'link': '/cases' },
            { text: 'Edit Pelanggaran' },
        ]} />

        <div className="mt-5">
            <Form />
        </div>
    </main>
}

export default page