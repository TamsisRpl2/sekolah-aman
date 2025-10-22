import dynamic from 'next/dynamic'
import { getStudentsForDropdown } from '../actions'

const BeritaAcaraForm = dynamic(() => import('./_components/form'))

const page = async () => {
  const students = await getStudentsForDropdown()

  return <BeritaAcaraForm students={students} />
}

export default page
