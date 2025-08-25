import { Metadata } from "next"
import dynamic from "next/dynamic"
import Link from "next/link"
import { TbPlus } from "react-icons/tb"

const Breadcrumbs = dynamic(() => import('../../../../components/breadcrumbs'))
const Pagination = dynamic(() => import('../../../../components/pagination'))

export const metadata: Metadata = {
    title: "Daftar Guru"
}

const page = () => {
    return <main>
        <h1 className="text-2xl font-bold">Daftar Guru</h1>
        <Breadcrumbs items={[
            { text: 'Users', link: '/users' },
            { text: 'Daftar Guru' }
        ]} />

        <div className="mt-10">
            <div className="flex justify-end">
                <Link href="/users/teachers/add" className="btn btn-primary text-white rounded-lg">
                    <TbPlus />
                    <span>Tambah Guru</span>
                </Link>
            </div>
            
            <div className="mt-5">
                <table className="table table-zebra w-full mb-5">
                    <thead>
                        <tr>
                            <th>NIP</th>
                            <th>Foto</th>
                            <th>Email</th>
                            <th>Nama</th>
                            <th>Telp</th>
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