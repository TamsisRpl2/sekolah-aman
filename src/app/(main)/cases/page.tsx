import dynamic from 'next/dynamic'

const Breadcrumbs = dynamic(() => import('@/components/breadcrumbs'))
const CasesContent = dynamic(() => import('./_components/cases-content'))

const page = () => {
    return <main>
        <h1 className="text-2xl font-bold">Daftar Kasus Pelanggaran</h1>
        <Breadcrumbs items={[
            { text: 'Daftar Kasus' }
        ]} />

        <div className="mt-5">
            <CasesContent />
        </div>
    </main>
}

export default page
