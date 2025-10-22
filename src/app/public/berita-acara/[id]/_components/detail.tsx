'use client'

import { useRouter } from 'next/navigation'
import { IoArrowBack, IoCalendarOutline, IoPersonOutline, IoSchoolOutline, IoTimeOutline, IoCheckmarkCircle, IoPricetagOutline } from 'react-icons/io5'

interface BeritaAcara {
  id: string
  tanggal: Date
  kronologi: string
  status: string | null
  createdAt: Date
  student: {
    name: string
    nis: string
    major: string | null
    academicYear: string
  }
}

interface PublicBeritaAcaraDetailProps {
  beritaAcara: BeritaAcara
}

function PublicBeritaAcaraDetail({ beritaAcara }: PublicBeritaAcaraDetailProps) {
  const router = useRouter()

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const estimateReadTime = (text: string) => {
    const wordsPerMinute = 200
    const words = text.split(/\s+/).length
    const minutes = Math.ceil(words / wordsPerMinute)
    return minutes
  }

  const readTime = estimateReadTime(beritaAcara.kronologi)

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <article className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-600 mb-8 group transition-colors"
          >
            <IoArrowBack className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Kembali ke Berita Acara</span>
          </button>

          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {beritaAcara.status && (
                <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold uppercase tracking-wide">
                  {beritaAcara.status}
                </span>
              )}
              <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                Berita Acara Siswa
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              Berita Acara Kejadian: {beritaAcara.student.name}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-slate-600 mb-8">
              <div className="flex items-center gap-2">
                <IoCalendarOutline className="w-5 h-5 text-emerald-600" />
                <span className="font-medium">{formatDate(beritaAcara.tanggal)}</span>
              </div>
              <div className="flex items-center gap-2">
                <IoTimeOutline className="w-5 h-5 text-emerald-600" />
                <span className="font-medium">{readTime} menit membaca</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-8">
            <div className="relative h-80 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white space-y-3">
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                    <IoPersonOutline className="w-12 h-12" />
                  </div>
                  <h2 className="text-3xl font-bold">{beritaAcara.student.name}</h2>
                  <div className="flex items-center justify-center gap-2">
                    <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                      NIS: {beritaAcara.student.nis}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12">
            <div className="prose prose-lg prose-slate max-w-none">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 mb-8 border-l-4 border-emerald-500">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <IoSchoolOutline className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-800 mb-3">Informasi Siswa</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-slate-600">Nama:</span>
                        <span className="ml-2 font-semibold text-slate-900">{beritaAcara.student.name}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">NIS:</span>
                        <span className="ml-2 font-semibold text-slate-900">{beritaAcara.student.nis}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Jurusan:</span>
                        <span className="ml-2 font-semibold text-slate-900">{beritaAcara.student.major || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Tahun Ajaran:</span>
                        <span className="ml-2 font-semibold text-slate-900">{beritaAcara.student.academicYear}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
                Kronologi Kejadian
              </h2>
              
              <div className="text-slate-700 leading-relaxed text-lg whitespace-pre-wrap mb-8">
                {beritaAcara.kronologi}
              </div>

              <div className="mt-12 pt-8 border-t border-slate-200">
                <div className="flex items-center gap-2 text-slate-600 text-sm mb-4">
                  <IoPricetagOutline className="w-5 h-5" />
                  <span className="font-semibold">Informasi Publikasi</span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <IoCalendarOutline className="w-4 h-4" />
                    <span>
                      Dipublikasikan: <strong className="text-slate-900">{formatDate(beritaAcara.createdAt)}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IoTimeOutline className="w-4 h-4" />
                    <span>
                      Pukul: <strong className="text-slate-900">{formatTime(beritaAcara.createdAt)}</strong>
                    </span>
                  </div>
                  {beritaAcara.status && (
                    <div className="flex items-center gap-2">
                      <IoCheckmarkCircle className="w-4 h-4" />
                      <span>
                        Status: <strong className="text-emerald-600">{beritaAcara.status}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-3">Informasi Lebih Lanjut</h3>
            <p className="text-white/90 mb-6">
              Untuk pertanyaan atau informasi lebih lanjut mengenai berita acara ini, silakan hubungi pihak sekolah.
            </p>
            <button
              onClick={() => router.push('/public/berita-acara')}
              className="btn bg-white hover:bg-slate-50 text-emerald-600 border-0 rounded-xl px-8"
            >
              Lihat Berita Acara Lainnya
            </button>
          </div>
        </div>
      </article>
    </main>
  )
}

export default PublicBeritaAcaraDetail
