import dynamic from 'next/dynamic'

const Breadcrumbs = dynamic(() => import('@/components/breadcrumbs'))

const page = () => {
    return <main>
        <h1 className="text-2xl font-bold">Daftar Sanksi</h1>
        <Breadcrumbs items={[
            { text: 'Master' },
            { text: 'Daftar Sanksi' }
        ]} />

        <div className="mt-10">
            <table className="table zebra">
                <thead>
                    <tr>
                        <th>Jenis Pelanggaran</th>
                        <th>Hukuman</th>
                        <th>keterangan</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>1.A Ringan-Ringan</th>
                        <td>teguran, penyitaan dan shalat dhuha</td>
                        <td>SP 1</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </main>
}

export default page