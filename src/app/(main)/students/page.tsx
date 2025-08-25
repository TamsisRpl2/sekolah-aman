import { Metadata } from "next"
import dynamic from "next/dynamic"
import Link from "next/link"
import { TbPlus } from "react-icons/tb"

export const metadata: Metadata = {
    title: "Daftar Siswa"
}

const Breadcrumbs = dynamic(() => import('@/components/breadcrumbs'))
const Pagination = dynamic(() => import('@/components/pagination'))

const page = () => {
    return <main>
        <h1 className="text-2xl font-bold">Daftar Siswa</h1>
        <Breadcrumbs items={[
            { text: 'Daftar Siswa' }
        ]} />

        <div className="mt-10">
            <div className="flex justify-end">
                <Link href="/students/add" className="btn btn-primary text-white rounded-lg">
                    <TbPlus />
                    <span>Tambah Siswa</span>
                </Link>
            </div>

            <div className="mt-5 space-y-10">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Foto</th>
                            <th>NIS</th>
                            <th>Nama Siswa</th>
                            <th>Jenis Kelamin</th>
                            <th>Telp</th>
                            <th>Telp Wali</th>
                            <th>Alamat</th>
                            <th></th>
                        </tr>
                    </thead>
                </table>

                <Pagination />
            </div>
        </div>
    </main>
}

export default page