export interface Student {
  id: string
  nis: string
  name: string
  gender: 'L' | 'P' // Laki-laki | Perempuan (sesuai Prisma schema)
  birthPlace?: string | null
  birthDate?: Date | null
  phone?: string | null
  address?: string | null
  parentName?: string | null
  parentPhone?: string | null
  major?: string | null
  academicYear: string
  isActive: boolean
  photo?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface StudentFormData {
  nis: string
  name: string
  gender: 'L' | 'P' // Laki-laki | Perempuan (sesuai Prisma schema)
  birthPlace?: string
  birthDate?: string
  phone?: string
  parentPhone?: string
  major?: string
  academicYear: string
  parentName?: string
  address?: string
  isActive: boolean
  photo?: string
}

export interface StudentsListResponse {
  students: Student[]
  total: number
  page: number
  limit: number
  totalPages: number
}
