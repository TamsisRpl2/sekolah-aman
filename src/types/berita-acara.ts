export type BeritaAcara = {
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

export type BeritaAcaraStats = {
  total: number
  thisMonth: number
  thisYear: number
}

export type CreateBeritaAcaraInput = {
  studentId: string
  kronologi: string
  tanggal: Date
  pelapor?: string
  saksi?: string
  tindakLanjut?: string
  status?: string
}

export type UpdateBeritaAcaraInput = {
  studentId?: string
  kronologi?: string
  tanggal?: Date
  pelapor?: string
  saksi?: string
  tindakLanjut?: string
  status?: string
}
