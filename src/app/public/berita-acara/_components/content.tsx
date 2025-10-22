'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IoSearch, IoCalendarOutline, IoPersonOutline, IoTimeOutline, IoTrendingUp, IoNewspaperOutline, IoArchiveOutline } from 'react-icons/io5'

interface BeritaAcaraItem {
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

interface PublicBeritaAcaraContentProps {
  beritaAcara: BeritaAcaraItem[]
  stats: {
    total: number
    thisMonth: number
    thisYear: number
    monthlyData: { month: string; count: number }[]
  }
  total: number
  limit: number
  offset: number
  initialSearch: string
  initialMonth: string
  initialYear: string
}

function PublicBeritaAcaraContent({
  beritaAcara,
  stats,
  total,
  limit,
  offset,
  initialSearch,
  initialMonth,
  initialYear,
}: PublicBeritaAcaraContentProps) {
  const router = useRouter()
  const [search, setSearch] = useState(initialSearch)
  const [month, setMonth] = useState(initialMonth)
  const [year, setYear] = useState(initialYear)

  const currentPage = Math.floor(offset / limit) + 1
  const totalPages = Math.ceil(total / limit)

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (month) params.set('month', month)
    if (year) params.set('year', year)
    router.push(`/public/berita-acara?${params.toString()}`)
  }

  const handleReset = () => {
    setSearch('')
    setMonth('')
    setYear(new Date().getFullYear().toString())
    router.push('/public/berita-acara')
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (month) params.set('month', month)
    if (year) params.set('year', year)
    params.set('offset', ((newPage - 1) * limit).toString())
    router.push(`/public/berita-acara?${params.toString()}`)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - new Date(date).getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Hari ini'
    if (diffDays === 1) return 'Kemarin'
    if (diffDays < 7) return `${diffDays} hari yang lalu`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu yang lalu`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan yang lalu`
    return `${Math.floor(diffDays / 365)} tahun yang lalu`
  }

  const getExcerpt = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  }

  const months = [
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
  ]

  const years = Array.from({ length: 5 }, (_, i) => {
    const y = new Date().getFullYear() - i
    return { value: y.toString(), label: y.toString() }
  })

  const featuredPost = beritaAcara[0]
  const regularPosts = beritaAcara.slice(1)
  const recentPosts = beritaAcara.slice(0, 5)

  const monthlyArchive = stats.monthlyData.filter(m => m.count > 0)

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <div className="inline-block">
              <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold uppercase tracking-wide">
                Informasi Sekolah
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent leading-tight">
              Berita Acara Kejadian
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Transparansi informasi kejadian siswa untuk orang tua dan wali murid
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2 space-y-8">
              {featuredPost && (
                <article
                  onClick={() => router.push(`/public/berita-acara/${featuredPost.id}`)}
                  className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer border border-slate-100"
                >
                  <div className="relative h-72 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 overflow-hidden">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute top-4 left-4">
                      <span className="px-4 py-2 bg-white/90 backdrop-blur-sm text-emerald-700 rounded-full text-sm font-bold shadow-lg">
                        Featured
                      </span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <IoNewspaperOutline className="w-32 h-32 text-white/30" />
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                      <div className="flex items-center gap-2">
                        <IoCalendarOutline className="w-4 h-4" />
                        <span>{formatDate(featuredPost.tanggal)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IoTimeOutline className="w-4 h-4" />
                        <span>{formatTimeAgo(featuredPost.createdAt)}</span>
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors">
                      Berita Acara: {featuredPost.student.name}
                    </h2>
                    <div className="flex items-center gap-2 mb-4">
                      <IoPersonOutline className="w-5 h-5 text-slate-500" />
                      <span className="text-slate-700 font-medium">
                        {featuredPost.student.nis} - {featuredPost.student.major}
                      </span>
                    </div>
                    <p className="text-lg text-slate-600 leading-relaxed mb-6">
                      {getExcerpt(featuredPost.kronologi, 200)}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-600 font-semibold group-hover:gap-3 flex items-center gap-2 transition-all">
                        Baca Selengkapnya
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                      {featuredPost.status && (
                        <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                          {featuredPost.status}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              )}

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <IoSearch className="w-6 h-6 text-emerald-600" />
                  <h3 className="text-xl font-bold text-slate-800">Cari Berita Acara</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="Cari nama atau NIS..."
                    className="input input-bordered rounded-xl bg-slate-50 border-slate-200 focus:border-emerald-500 focus:bg-white transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <select
                    className="select select-bordered rounded-xl bg-slate-50 border-slate-200 focus:border-emerald-500 focus:bg-white transition-all"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                  >
                    <option value="">Semua Bulan</option>
                    {months.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <select
                    className="select select-bordered rounded-xl bg-slate-50 border-slate-200 focus:border-emerald-500 focus:bg-white transition-all"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  >
                    {years.map((y) => (
                      <option key={y.value} value={y.value}>
                        {y.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSearch}
                      className="btn bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-0 text-white rounded-xl flex-1"
                    >
                      Cari
                    </button>
                    <button
                      onClick={handleReset}
                      className="btn bg-slate-100 hover:bg-slate-200 text-slate-700 border-0 rounded-xl"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {regularPosts.length === 0 && !featuredPost ? (
                <div className="bg-white rounded-3xl shadow-lg p-16 text-center border border-slate-100">
                  <IoNewspaperOutline className="w-20 h-20 text-slate-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">Tidak Ada Berita</h3>
                  <p className="text-slate-600 text-lg">
                    Tidak ada berita acara untuk periode yang dipilih.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {regularPosts.map((item) => (
                    <article
                      key={item.id}
                      onClick={() => router.push(`/public/berita-acara/${item.id}`)}
                      className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-slate-100 flex flex-col md:flex-row"
                    >
                      <div className="relative w-full md:w-64 h-48 md:h-auto bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-400 flex-shrink-0">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <IoNewspaperOutline className="w-20 h-20 text-white/40" />
                        </div>
                      </div>
                      <div className="p-6 flex-1">
                        <div className="flex items-center gap-3 text-sm text-slate-600 mb-3">
                          <div className="flex items-center gap-1">
                            <IoCalendarOutline className="w-4 h-4" />
                            <span>{formatDate(item.tanggal)}</span>
                          </div>
                          <span className="text-slate-400">•</span>
                          <div className="flex items-center gap-1">
                            <IoTimeOutline className="w-4 h-4" />
                            <span>{formatTimeAgo(item.createdAt)}</span>
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                          Berita Acara: {item.student.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-3">
                          <IoPersonOutline className="w-4 h-4 text-slate-500" />
                          <span className="text-sm text-slate-600">
                            {item.student.nis} - {item.student.major}
                          </span>
                        </div>
                        <p className="text-slate-600 leading-relaxed mb-4">
                          {getExcerpt(item.kronologi)}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-emerald-600 font-semibold text-sm group-hover:gap-2 flex items-center gap-1 transition-all">
                            Baca Selengkapnya
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </span>
                          {item.status && (
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                              {item.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="btn btn-circle bg-white hover:bg-emerald-50 border-slate-200 disabled:bg-slate-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="flex gap-2">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`btn btn-circle ${
                            pageNum === currentPage
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0'
                              : 'bg-white hover:bg-emerald-50 border-slate-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="btn btn-circle bg-white hover:bg-emerald-50 border-slate-200 disabled:bg-slate-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            <aside className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 sticky top-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <IoTrendingUp className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Berita Terbaru</h3>
                </div>
                <div className="space-y-4">
                  {recentPosts.map((item, index) => (
                    <div
                      key={item.id}
                      onClick={() => router.push(`/public/berita-acara/${item.id}`)}
                      className="group cursor-pointer pb-4 border-b border-slate-100 last:border-0 last:pb-0"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors line-clamp-2 mb-1">
                            {item.student.name}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <IoCalendarOutline className="w-3 h-3" />
                            <span>{formatDate(item.tanggal)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <IoNewspaperOutline className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold">Statistik</h3>
                </div>
                <div className="space-y-3">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-3xl font-bold mb-1">{stats.total}</div>
                    <div className="text-sm text-white/80">Total Berita</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-3xl font-bold mb-1">{stats.thisMonth}</div>
                    <div className="text-sm text-white/80">Bulan Ini</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-3xl font-bold mb-1">{stats.thisYear}</div>
                    <div className="text-sm text-white/80">Tahun Ini</div>
                  </div>
                </div>
              </div>

              {monthlyArchive.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <IoArchiveOutline className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Arsip {year}</h3>
                  </div>
                  <div className="space-y-2">
                    {monthlyArchive.map((item) => (
                      <button
                        key={item.month}
                        onClick={() => {
                          const monthNum = months.findIndex(m => m.label.substring(0, 3).toLowerCase() === item.month.toLowerCase()) + 1
                          setMonth(monthNum.toString())
                          handleSearch()
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
                      >
                        <span className="text-slate-700 font-medium">{item.month}</span>
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold">
                          {item.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </main>
  )
}

export default PublicBeritaAcaraContent
