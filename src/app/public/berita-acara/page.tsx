import { getPublicBeritaAcaraList, getPublicBeritaAcaraStats } from './actions'
import PublicBeritaAcaraContent from './_components/content'
import Navbar from '@/app/_components/navbar'
import Footer from '@/app/_components/footer'

const page = async ({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) => {
  const search = typeof searchParams?.search === 'string' ? searchParams.search : ''
  const month = typeof searchParams?.month === 'string' ? searchParams.month : ''
  const year = typeof searchParams?.year === 'string' ? searchParams.year : new Date().getFullYear().toString()
  const offset = typeof searchParams?.offset === 'string' ? parseInt(searchParams.offset) : 0

  const [data, stats] = await Promise.all([
    getPublicBeritaAcaraList({ search, month, year, offset }),
    getPublicBeritaAcaraStats(),
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      <div className="pt-20">
        <PublicBeritaAcaraContent
          beritaAcara={data.beritaAcara}
          stats={stats}
          total={data.total}
          limit={data.limit}
          offset={data.offset}
          initialSearch={search}
          initialMonth={month}
          initialYear={year}
        />
      </div>
      <Footer />
    </div>
  )
}

export default page
