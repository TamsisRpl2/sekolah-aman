import dynamic from 'next/dynamic'

const Breadcrumbs = dynamic(() => import('@/components/breadcrumbs'))

const page = () => {
    return <main>
        <h1 className="text-2xl font-bold">Riwayat Sanksi</h1>
        <Breadcrumbs items={[
            { text: 'Riwayat Sanksi' }
        ]} />

        <div className="mt-10">
            <table className="table">
                <thead>
                    <tr>
                        <th>Nama Siswa</th>
                        <th>Tindakan</th>
                        <th>Tanggal</th>
                        <th>Dokumentasi Tindakan</th>
                    </tr>
                </thead>
            </table>
        </div>
    </main>
}

export default page