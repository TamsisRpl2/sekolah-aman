import { getPublicBeritaAcaraById } from '../actions'
import { redirect } from 'next/navigation'
import Navbar from '@/app/_components/navbar'
import Footer from '@/app/_components/footer'
import PublicBeritaAcaraDetail from '@/app/public/berita-acara/[id]/_components/detail'

const page = async ({ params }: { params: { id: string } }) => {
  const beritaAcara = await getPublicBeritaAcaraById(params.id)

  if (!beritaAcara) {
    redirect('/public/berita-acara')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      <div className="pt-20">
        <PublicBeritaAcaraDetail beritaAcara={beritaAcara} />
      </div>
      <Footer />
    </div>
  )
}

export default page
