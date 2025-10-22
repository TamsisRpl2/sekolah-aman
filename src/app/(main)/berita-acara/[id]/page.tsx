import dynamic from 'next/dynamic'
import { getBeritaAcaraById, getStudentsForDropdown } from '../actions'
import { redirect } from 'next/navigation'

const BeritaAcaraDetail = dynamic(() => import('./_components/detail'))

const page = async ({ params, searchParams }: { params: { id: string }, searchParams: { edit?: string } }) => {
  const beritaAcara = await getBeritaAcaraById(params.id)
  
  if (!beritaAcara) {
    redirect('/berita-acara')
  }

  const students = await getStudentsForDropdown()
  const isEdit = searchParams.edit === 'true'

  return <BeritaAcaraDetail beritaAcara={beritaAcara} students={students} isEdit={isEdit} />
}

export default page
