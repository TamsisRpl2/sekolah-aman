'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IoAdd, IoSearch, IoRefresh, IoDocumentText, IoPeople, IoCalendar, IoEye, IoTrash, IoCreateOutline } from 'react-icons/io5'
import { deleteBeritaAcara } from '../actions'

type BeritaAcaraContentProps = {
  beritaAcara: any[]
  stats: {
    total: number
    thisMonth: number
    thisYear: number
  }
  initialSearch: string
  initialStudentId: string
  initialStartDate: string
  initialEndDate: string
}

export default function BeritaAcaraContent({
  beritaAcara,
  stats,
  initialSearch,
  initialStudentId,
  initialStartDate,
  initialEndDate,
}: BeritaAcaraContentProps) {
  const router = useRouter()
  const [search, setSearch] = useState(initialSearch)
  const [studentId, setStudentId] = useState(initialStudentId)
  const [startDate, setStartDate] = useState(initialStartDate)
  const [endDate, setEndDate] = useState(initialEndDate)

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (studentId) params.set('studentId', studentId)
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    router.push(`/berita-acara?${params.toString()}`)
  }

  const handleReset = () => {
    setSearch('')
    setStudentId('')
    setStartDate('')
    setEndDate('')
    router.push('/berita-acara')
  }

  const handleRefresh = () => {
    router.refresh()
  }

  const handleDelete = async (id: string, studentName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus berita acara siswa "${studentName}"?`)) {
      try {
        await deleteBeritaAcara(id)
        router.refresh()
      } catch (error) {
        alert('Gagal menghapus berita acara')
      }
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <main className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Berita Acara
          </h1>
          <p className="text-slate-600">Kelola berita acara kejadian siswa</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            className="btn bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
          >
            <IoRefresh className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => router.push('/berita-acara/add')}
            className="btn bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
          >
            <IoAdd className="w-5 h-5" />
            Tambah Berita Acara
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
              <IoDocumentText className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-600 font-medium">Total Berita Acara</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                {stats.total}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
              <IoCalendar className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-600 font-medium">Bulan Ini</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
                {stats.thisMonth}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg">
              <IoPeople className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-600 font-medium">Tahun Ini</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                {stats.thisYear}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-slate-200">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Cari berita acara..."
              className="input input-bordered w-full rounded-xl bg-white border-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <input
              type="date"
              className="input input-bordered w-full rounded-xl bg-white border-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              className="input input-bordered w-full rounded-xl bg-white border-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="btn bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl flex-1"
              >
                <IoSearch className="w-4 h-4" />
                Cari
              </button>
              <button
                onClick={handleReset}
                className="btn bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {beritaAcara.length === 0 ? (
          <div className="text-center py-12">
            <IoDocumentText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Tidak Ada Berita Acara</h3>
            <p className="text-slate-600 mb-4">Belum ada berita acara yang dibuat.</p>
            <button
              onClick={() => router.push('/berita-acara/add')}
              className="btn bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
            >
              <IoAdd className="w-5 h-5" />
              Tambah Berita Acara Pertama
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                <tr>
                  <th className="text-slate-700 font-semibold">No</th>
                  <th className="text-slate-700 font-semibold">Tanggal</th>
                  <th className="text-slate-700 font-semibold">Siswa</th>
                  <th className="text-slate-700 font-semibold">Kronologi</th>
                  <th className="text-slate-700 font-semibold">Pelapor</th>
                  <th className="text-slate-700 font-semibold">Status</th>
                  <th className="text-slate-700 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {beritaAcara.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="font-medium">{index + 1}</td>
                    <td>{formatDate(item.tanggal)}</td>
                    <td>
                      <div>
                        <div className="font-medium text-slate-900">{item.student.name}</div>
                        <div className="text-sm text-slate-600">{item.student.nis}</div>
                      </div>
                    </td>
                    <td>
                      <div className="max-w-xs truncate" title={item.kronologi}>
                        {item.kronologi}
                      </div>
                    </td>
                    <td>
                      <span className="text-slate-700">{item.pelapor || '-'}</span>
                    </td>
                    <td>
                      <span className={`badge ${item.status ? 'badge-success' : 'badge-ghost'} rounded-lg`}>
                        {item.status || 'Draft'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => router.push(`/berita-acara/${item.id}`)}
                          className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white border-0 rounded-lg"
                          title="Lihat Detail"
                        >
                          <IoEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/berita-acara/${item.id}?edit=true`)}
                          className="btn btn-sm bg-amber-500 hover:bg-amber-600 text-white border-0 rounded-lg"
                          title="Edit"
                        >
                          <IoCreateOutline className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.student.name)}
                          className="btn btn-sm bg-red-500 hover:bg-red-600 text-white border-0 rounded-lg"
                          title="Hapus"
                        >
                          <IoTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
