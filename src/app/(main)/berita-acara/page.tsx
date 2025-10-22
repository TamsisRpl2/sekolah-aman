import dynamic from 'next/dynamic'
import { getBeritaAcaraList, getBeritaAcaraStats } from './actions'

const BeritaAcaraContent = dynamic(() => import('./_components/berita-acara-content'))

const page = async ({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) => {
  const search = typeof searchParams?.search === 'string' ? searchParams.search : ''
  const studentId = typeof searchParams?.studentId === 'string' ? searchParams.studentId : ''
  const startDate = typeof searchParams?.startDate === 'string' ? searchParams.startDate : ''
  const endDate = typeof searchParams?.endDate === 'string' ? searchParams.endDate : ''

  const [data, stats] = await Promise.all([
    getBeritaAcaraList({ search, studentId, startDate, endDate }),
    getBeritaAcaraStats(),
  ])

  return (
    <BeritaAcaraContent
      beritaAcara={data.beritaAcara}
      stats={stats}
      initialSearch={search}
      initialStudentId={studentId}
      initialStartDate={startDate}
      initialEndDate={endDate}
    />
  )
}

export default page
