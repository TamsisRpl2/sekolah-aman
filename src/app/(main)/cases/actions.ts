'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function getCases(params?: {
    search?: string
    status?: string
    page?: number
    limit?: number
}) {
    try {
        const page = params?.page || 1
        const limit = params?.limit || 10
        const skip = (page - 1) * limit

        const where: any = {}

        if (params?.search) {
            where.OR = [
                { caseNumber: { contains: params.search, mode: 'insensitive' } },
                { student: { name: { contains: params.search, mode: 'insensitive' } } },
                { student: { nis: { contains: params.search, mode: 'insensitive' } } },
            ]
        }

        if (params?.status) {
            where.status = params.status
        }

        const [cases, total] = await Promise.all([
            prisma.violationCase.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    student: {
                        select: {
                            name: true,
                            nis: true,
                            major: true
                        }
                    },
                    violation: {
                        select: {
                            name: true,
                            category: {
                                select: {
                                    level: true,
                                    name: true
                                }
                            }
                        }
                    },
                    inputBy: {
                        select: {
                            name: true
                        }
                    }
                }
            }),
            prisma.violationCase.count({ where })
        ])

        return {
            cases,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        }
    } catch (error) {
        console.error('Error fetching cases:', error)
        throw new Error('Gagal mengambil data kasus pelanggaran')
    }
}

export async function getCaseStats() {
    try {
        const [total, pending, proses, selesai, dibatalkan] = await Promise.all([
            prisma.violationCase.count(),
            prisma.violationCase.count({ where: { status: 'PENDING' } }),
            prisma.violationCase.count({ where: { status: 'PROSES' } }),
            prisma.violationCase.count({ where: { status: 'SELESAI' } }),
            prisma.violationCase.count({ where: { status: 'DIBATALKAN' } })
        ])

        return {
            total,
            pending,
            proses,
            selesai,
            dibatalkan
        }
    } catch (error) {
        console.error('Error fetching case stats:', error)
        throw new Error('Gagal mengambil statistik kasus')
    }
}

export async function updateCaseStatus(caseId: string, status: string) {
    try {
        await prisma.violationCase.update({
            where: { id: caseId },
            data: { status: status as any }
        })

        revalidatePath('/cases')
        return { success: true }
    } catch (error) {
        console.error('Error updating case status:', error)
        throw new Error('Gagal mengupdate status kasus')
    }
}

export async function deleteCase(caseId: string) {
    try {
        await prisma.violationCase.delete({
            where: { id: caseId }
        })

        revalidatePath('/cases')
        return { success: true }
    } catch (error) {
        console.error('Error deleting case:', error)
        throw new Error('Gagal menghapus kasus')
    }
}
