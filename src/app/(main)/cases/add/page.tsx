import dynamic from 'next/dynamic'

const Breadcrumbs = dynamic(() => import('@/components/breadcrumbs'))
const Form = dynamic(() => import('./_components/form'))

const page = () => {
    return <main>
        <h1 className="text-2xl font-bold">Tambah Kasus Pelanggaran</h1>
        <Breadcrumbs items={[
            { text: 'Daftar Kasus', link: '/cases' },
            { text: 'Tambah Kasus' },
        ]} />

        <div className="mt-5">
            <Form />
        </div>
    </main>
}

export default page
