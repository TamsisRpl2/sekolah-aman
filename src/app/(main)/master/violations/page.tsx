import dynamic from 'next/dynamic'

const Breadcrumbs = dynamic(() => import('@/components/breadcrumbs'))

const page = () => {
    return <main>
        <h1 className="text-2xl font-bold">Daftar Pelanggaran</h1>
        <Breadcrumbs items={[
            { text: 'Master' },
            { text: 'Daftar Pelanggaran' }
        ]} />

        <div className="mt-10 overflow-x-auto w-full">
            <table className='table table-zebra w-full table-sm'>
                <thead>
                    <tr>
                        <th>Pasal</th>
                        <th>Nama Pelanggaran</th>
                        <th></th>
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <th>1</th>
                        <th>Pelanggaran Ringan</th>
                        <td>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Kode</th>
                                        <th>Jenis Pelanggaran</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>1.A</td>
                                        <td>Pelanggaran Ringan - Ringan</td>
                                        <td>
                                            <table className='table'>
                                                <thead>
                                                    <tr>
                                                        <th>No</th>
                                                        <th>Deskripsi Pelanggaran</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <th>1</th>
                                                        <td>Siswa dan siswi terlambat hadir ke sekolah. (lebih dari 06:45, handphone akan disita hingga Jam pelajaran terakhir) maks. 3 kali per semester</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <th>1</th>
                        <th>Pelanggaran Ringan</th>
                        <td>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Kode</th>
                                        <th>Tingkat Pelanggaran</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>1.A</td>
                                        <td>Pelanggaran Ringan - Ringan</td>
                                        <td>
                                            <table className='table'>
                                                <thead>
                                                    <tr>
                                                        <th>No</th>
                                                        <th>Nama Pelanggaran</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <th>1</th>
                                                        <td>Siswa dan siswi terlambat hadir ke sekolah. (lebih dari 06:45, handphone akan disita hingga Jam pelajaran terakhir) maks. 3 kali per semester</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </main>
}

export default page