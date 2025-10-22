'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { IoArrowBack, IoSave, IoCreateOutline, IoPersonOutline, IoCalendarOutline, IoDocumentTextOutline, IoTimeOutline } from 'react-icons/io5'
import { updateBeritaAcara } from '../../actions'

type Student = {
  id: string
  nis: string
  name: string
  major: string | null
  academicYear: string
}

type BeritaAcara = {
  id: string
  studentId: string
  kronologi: string
  tanggal: Date
  pelapor: string | null
  saksi: string | null
  tindakLanjut: string | null
  status: string | null
  createdAt: Date
  updatedAt: Date
  student: {
    id: string
    nis: string
    name: string
    major: string | null
    academicYear: string
  }
}

type BeritaAcaraDetailProps = {
  beritaAcara: BeritaAcara
  students: Student[]
  isEdit: boolean
}

export default function BeritaAcaraDetail({ beritaAcara, students, isEdit: initialIsEdit }: BeritaAcaraDetailProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isEdit, setIsEdit] = useState(initialIsEdit)
  const [formData, setFormData] = useState({
    studentId: beritaAcara.studentId,
    kronologi: beritaAcara.kronologi,
    tanggal: new Date(beritaAcara.tanggal).toISOString().split('T')[0],
    pelapor: beritaAcara.pelapor || '',
    saksi: beritaAcara.saksi || '',
    tindakLanjut: beritaAcara.tindakLanjut || '',
    status: beritaAcara.status || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.studentId || !formData.kronologi || !formData.tanggal) {
      alert('Harap isi semua field yang wajib')
      return
    }

    startTransition(async () => {
      try {
        await updateBeritaAcara(beritaAcara.id, {
          studentId: formData.studentId,
          kronologi: formData.kronologi,
          tanggal: new Date(formData.tanggal),
          pelapor: formData.pelapor || undefined,
          saksi: formData.saksi || undefined,
          tindakLanjut: formData.tindakLanjut || undefined,
          status: formData.status || undefined,
        })
        alert('Berita acara berhasil diupdate')
        setIsEdit(false)
        router.refresh()
      } catch (error) {
        alert('Gagal mengupdate berita acara')
      }
    })
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <main className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            {isEdit ? 'Edit Berita Acara' : 'Detail Berita Acara'}
          </h1>
          <p className="text-slate-600">
            {isEdit ? 'Ubah informasi berita acara' : 'Informasi lengkap berita acara'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="btn bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
          >
            <IoArrowBack className="w-4 h-4" />
            Kembali
          </button>
          {!isEdit && (
            <button
              onClick={() => setIsEdit(true)}
              className="btn bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
            >
              <IoCreateOutline className="w-5 h-5" />
              Edit
            </button>
          )}
        </div>
      </div>

      {isEdit ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-slate-700 flex items-center gap-2">
                    <IoPersonOutline className="w-5 h-5" />
                    Siswa <span className="text-red-500">*</span>
                  </span>
                </label>
                <select
                  className="select select-bordered w-full rounded-xl bg-white border-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  required
                >
                  <option value="">Pilih Siswa</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} - {student.nis} ({student.major} - {student.academicYear})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-slate-700 flex items-center gap-2">
                    <IoCalendarOutline className="w-5 h-5" />
                    Tanggal Kejadian <span className="text-red-500">*</span>
                  </span>
                </label>
                <input
                  type="date"
                  className="input input-bordered w-full rounded-xl bg-white border-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-slate-700 flex items-center gap-2">
                  <IoDocumentTextOutline className="w-5 h-5" />
                  Kronologi Kejadian <span className="text-red-500">*</span>
                </span>
              </label>
              <textarea
                className="textarea textarea-bordered h-32 rounded-xl bg-white border-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Tuliskan kronologi kejadian secara detail..."
                value={formData.kronologi}
                onChange={(e) => setFormData({ ...formData, kronologi: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-slate-700">Pelapor (Opsional)</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full rounded-xl bg-white border-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Nama pelapor"
                  value={formData.pelapor}
                  onChange={(e) => setFormData({ ...formData, pelapor: e.target.value })}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-slate-700">Saksi (Opsional)</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full rounded-xl bg-white border-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Nama saksi"
                  value={formData.saksi}
                  onChange={(e) => setFormData({ ...formData, saksi: e.target.value })}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-slate-700">Tindak Lanjut (Opsional)</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24 rounded-xl bg-white border-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Rencana tindak lanjut..."
                value={formData.tindakLanjut}
                onChange={(e) => setFormData({ ...formData, tindakLanjut: e.target.value })}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-slate-700">Status (Opsional)</span>
              </label>
              <select
                className="select select-bordered w-full rounded-xl bg-white border-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="">Pilih Status</option>
                <option value="Draft">Draft</option>
                <option value="Final">Final</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={() => setIsEdit(false)}
                className="btn bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                disabled={isPending}
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                disabled={isPending}
              >
                <IoSave className="w-5 h-5" />
                {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-slate-200">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-slate-600 flex items-center gap-2 mb-2">
                    <IoPersonOutline className="w-5 h-5" />
                    Siswa
                  </label>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="font-semibold text-slate-900">{beritaAcara.student.name}</p>
                    <p className="text-sm text-slate-600">NIS: {beritaAcara.student.nis}</p>
                    <p className="text-sm text-slate-600">
                      {beritaAcara.student.major} - {beritaAcara.student.academicYear}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-600 flex items-center gap-2 mb-2">
                    <IoCalendarOutline className="w-5 h-5" />
                    Tanggal Kejadian
                  </label>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="font-semibold text-slate-900">{formatDate(beritaAcara.tanggal)}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-600 flex items-center gap-2 mb-2">
                  <IoDocumentTextOutline className="w-5 h-5" />
                  Kronologi Kejadian
                </label>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-slate-900 whitespace-pre-wrap">{beritaAcara.kronologi}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-slate-600 mb-2 block">Pelapor</label>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-slate-900">{beritaAcara.pelapor || '-'}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-600 mb-2 block">Saksi</label>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-slate-900">{beritaAcara.saksi || '-'}</p>
                  </div>
                </div>
              </div>

              {beritaAcara.tindakLanjut && (
                <div>
                  <label className="text-sm font-semibold text-slate-600 mb-2 block">Tindak Lanjut</label>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-slate-900 whitespace-pre-wrap">{beritaAcara.tindakLanjut}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-slate-600 mb-2 block">Status</label>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <span className={`badge ${beritaAcara.status ? 'badge-success' : 'badge-ghost'} rounded-lg`}>
                    {beritaAcara.status || 'Draft'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                <div>
                  <label className="text-sm font-semibold text-slate-600 flex items-center gap-2 mb-2">
                    <IoTimeOutline className="w-5 h-5" />
                    Dibuat
                  </label>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-slate-900">{formatDateTime(beritaAcara.createdAt)}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-600 flex items-center gap-2 mb-2">
                    <IoTimeOutline className="w-5 h-5" />
                    Terakhir Diupdate
                  </label>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-slate-900">{formatDateTime(beritaAcara.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
