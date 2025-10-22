'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getBeritaAcaraList(params?: {
  search?: string
  studentId?: string
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}) {
  const where: any = {}

  if (params?.search) {
    where.OR = [
      { kronologi: { contains: params.search, mode: 'insensitive' } },
      { pelapor: { contains: params.search, mode: 'insensitive' } },
      { student: { name: { contains: params.search, mode: 'insensitive' } } },
      { student: { nis: { contains: params.search, mode: 'insensitive' } } },
    ]
  }

  if (params?.studentId) {
    where.studentId = params.studentId
  }

  if (params?.startDate || params?.endDate) {
    where.tanggal = {}
    if (params.startDate) {
      where.tanggal.gte = new Date(params.startDate)
    }
    if (params.endDate) {
      where.tanggal.lte = new Date(params.endDate)
    }
  }

  const [beritaAcara, total] = await Promise.all([
    prisma.beritaAcara.findMany({
      where,
      include: {
        student: true,
      },
      orderBy: {
        tanggal: 'desc',
      },
      take: params?.limit || 50,
      skip: params?.offset || 0,
    }),
    prisma.beritaAcara.count({ where }),
  ])

  return {
    beritaAcara,
    total,
    limit: params?.limit || 50,
    offset: params?.offset || 0,
  }
}

export async function getBeritaAcaraById(id: string) {
  return await prisma.beritaAcara.findUnique({
    where: { id },
    include: {
      student: true,
    },
  })
}

export async function createBeritaAcara(data: {
  studentId: string
  kronologi: string
  tanggal: Date
  pelapor?: string
  saksi?: string
  tindakLanjut?: string
  status?: string
}) {
  const beritaAcara = await prisma.beritaAcara.create({
    data: {
      studentId: data.studentId,
      kronologi: data.kronologi,
      tanggal: data.tanggal,
      pelapor: data.pelapor,
      saksi: data.saksi,
      tindakLanjut: data.tindakLanjut,
      status: data.status,
    },
  })

  revalidatePath('/berita-acara')
  return beritaAcara
}

export async function updateBeritaAcara(
  id: string,
  data: {
    studentId?: string
    kronologi?: string
    tanggal?: Date
    pelapor?: string
    saksi?: string
    tindakLanjut?: string
    status?: string
  }
) {
  const beritaAcara = await prisma.beritaAcara.update({
    where: { id },
    data,
  })

  revalidatePath('/berita-acara')
  revalidatePath(`/berita-acara/${id}`)
  return beritaAcara
}

export async function deleteBeritaAcara(id: string) {
  await prisma.beritaAcara.delete({
    where: { id },
  })

  revalidatePath('/berita-acara')
}

export async function getStudentsForDropdown() {
  return await prisma.student.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      nis: true,
      name: true,
      major: true,
      academicYear: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
}

export async function getBeritaAcaraStats() {
  const [total, thisMonth, thisYear] = await Promise.all([
    prisma.beritaAcara.count(),
    prisma.beritaAcara.count({
      where: {
        tanggal: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    prisma.beritaAcara.count({
      where: {
        tanggal: {
          gte: new Date(new Date().getFullYear(), 0, 1),
        },
      },
    }),
  ])

  return {
    total,
    thisMonth,
    thisYear,
  }
}
