import dynamic from 'next/dynamic'
import Link from 'next/link'
import { TbPlus } from 'react-icons/tb'

const Breadcrumbs = dynamic(() => import('@/components/breadcrumbs'))

const page = () => {
    return <main>
        <h1 className="text-2xl font-bold">Daftar Pelanggaran</h1>
        <Breadcrumbs items={[
            { text: 'Daftar Pelanggaran' }
        ]} />

        <div className="mt-10">
            <div className="flex justify-end">
                <Link href="/cases/add" className='btn btn-primary rounded-lg text-white'>
                    <TbPlus />
                    <span>Tambah Kasus</span>
                </Link>
            </div>

            <div className="mt-5 overflow-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th>NIS</th>
                            <th>Nama Siswa</th>
                            <th>Kelas</th>
                            <th>Deskripsi Pelanggaran</th>
                            <th>Tanggal Pelanggaran</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                </table>
            </div>
        </div>
    </main>
}

export default page