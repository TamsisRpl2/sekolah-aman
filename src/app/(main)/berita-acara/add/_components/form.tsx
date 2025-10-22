'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { IoArrowBack, IoSave, IoPersonOutline, IoCalendarOutline, IoDocumentTextOutline } from 'react-icons/io5'
import { createBeritaAcara } from '../../actions'

type Student = {
  id: string
  nis: string
  name: string
  major: string | null
  academicYear: string
}

type BeritaAcaraFormProps = {
  students: Student[]
}

export default function BeritaAcaraForm({ students }: BeritaAcaraFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    studentId: '',
    kronologi: '',
    tanggal: new Date().toISOString().split('T')[0],
    pelapor: '',
    saksi: '',
    tindakLanjut: '',
    status: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.studentId || !formData.kronologi || !formData.tanggal) {
      alert('Harap isi semua field yang wajib')
      return
    }

    startTransition(async () => {
      try {
        await createBeritaAcara({
          studentId: formData.studentId,
          kronologi: formData.kronologi,
          tanggal: new Date(formData.tanggal),
          pelapor: formData.pelapor || undefined,
          saksi: formData.saksi || undefined,
          tindakLanjut: formData.tindakLanjut || undefined,
          status: formData.status || undefined,
        })
        alert('Berita acara berhasil ditambahkan')
        router.push('/berita-acara')
        router.refresh()
      } catch (error) {
        alert('Gagal menambahkan berita acara')
      }
    })
  }

  return (
    <main className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Tambah Berita Acara
          </h1>
          <p className="text-slate-600">Buat berita acara kejadian siswa baru</p>
        </div>
        <button
          onClick={() => router.back()}
          className="btn bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
        >
          <IoArrowBack className="w-4 h-4" />
          Kembali
        </button>
      </div>

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
              onClick={() => router.back()}
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
              {isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
