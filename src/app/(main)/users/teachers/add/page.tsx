import dynamic from 'next/dynamic'

const Breadcrumbs = dynamic(() => import('@/components/breadcrumbs'))
const Form = dynamic(() => import('./_components/form'))

const page = () => {
    return <main>
        <h1 className="text-2xl font-bold">Tambah Guru</h1>
        <Breadcrumbs items={[
            { text: 'Users', link: '/users' },
            { text: 'Daftar Guru', link: '/users/teachers' },
            { text: 'Tambah Guru' },
        ]} />

        <div className="mt-5">
            <Form />
        </div>
    </main>
}

export default page