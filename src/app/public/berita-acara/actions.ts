'use server'

import { prisma } from '@/lib/prisma'

export async function getPublicBeritaAcaraList(params?: {
  search?: string
  month?: string
  year?: string
  limit?: number
  offset?: number
}) {
  const where: any = {}

  if (params?.search) {
    where.OR = [
      { kronologi: { contains: params.search, mode: 'insensitive' } },
      { student: { name: { contains: params.search, mode: 'insensitive' } } },
      { student: { nis: { contains: params.search, mode: 'insensitive' } } },
    ]
  }

  if (params?.month && params?.year) {
    const startDate = new Date(parseInt(params.year), parseInt(params.month) - 1, 1)
    const endDate = new Date(parseInt(params.year), parseInt(params.month), 0)
    where.tanggal = {
      gte: startDate,
      lte: endDate,
    }
  } else if (params?.year) {
    const startDate = new Date(parseInt(params.year), 0, 1)
    const endDate = new Date(parseInt(params.year), 11, 31)
    where.tanggal = {
      gte: startDate,
      lte: endDate,
    }
  }

  const [beritaAcara, total] = await Promise.all([
    prisma.beritaAcara.findMany({
      where,
      select: {
        id: true,
        tanggal: true,
        kronologi: true,
        status: true,
        createdAt: true,
        student: {
          select: {
            name: true,
            nis: true,
            major: true,
            academicYear: true,
          },
        },
      },
      orderBy: {
        tanggal: 'desc',
      },
      take: params?.limit || 20,
      skip: params?.offset || 0,
    }),
    prisma.beritaAcara.count({ where }),
  ])

  return {
    beritaAcara,
    total,
    limit: params?.limit || 20,
    offset: params?.offset || 0,
  }
}

export async function getPublicBeritaAcaraStats() {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()

  const [total, thisMonth, thisYear] = await Promise.all([
    prisma.beritaAcara.count(),
    prisma.beritaAcara.count({
      where: {
        tanggal: {
          gte: new Date(currentYear, currentMonth, 1),
        },
      },
    }),
    prisma.beritaAcara.count({
      where: {
        tanggal: {
          gte: new Date(currentYear, 0, 1),
        },
      },
    }),
  ])

  const byMonth = await prisma.beritaAcara.groupBy({
    by: ['tanggal'],
    where: {
      tanggal: {
        gte: new Date(currentYear, 0, 1),
      },
    },
    _count: true,
  })

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthName = new Date(currentYear, i, 1).toLocaleDateString('id-ID', { month: 'short' })
    const count = byMonth.filter(item => {
      const month = new Date(item.tanggal).getMonth()
      return month === i
    }).reduce((sum, item) => sum + item._count, 0)
    return { month: monthName, count }
  })

  return {
    total,
    thisMonth,
    thisYear,
    monthlyData,
  }
}

export async function getPublicBeritaAcaraById(id: string) {
  return await prisma.beritaAcara.findUnique({
    where: { id },
    select: {
      id: true,
      tanggal: true,
      kronologi: true,
      status: true,
      createdAt: true,
      student: {
        select: {
          name: true,
          nis: true,
          major: true,
          academicYear: true,
        },
      },
    },
  })
}
