import dynamic from 'next/dynamic'

const Breadcrumbs = dynamic(() => import('@/components/breadcrumbs'))
const Form = dynamic(() => import('./_components/form'))

const page = () => {
    return <main>
        <h1 className="text-2xl font-bold">Edit Siswa</h1>
        <Breadcrumbs items={[
            { text: 'Daftar Siswa', 'link': '/students' },
            { text: 'Edit Siswa' },
        ]} />

        <div className="mt-10">
            <Form />
        </div>
    </main>
}

export default page