'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export async function getSanctionTypes(params?: {
    search?: string
    level?: string
    page?: number
    limit?: number
}) {
    try {
        const page = params?.page || 1
        const limit = params?.limit || 10
        const skip = (page - 1) * limit

        const where: any = { isActive: true }

        if (params?.search) {
            where.OR = [
                { name: { contains: params.search, mode: 'insensitive' } },
                { description: { contains: params.search, mode: 'insensitive' } }
            ]
        }

        if (params?.level) {
            where.level = params.level
        }

        const [sanctionTypes, total] = await Promise.all([
            prisma.sanctionType.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' },
                include: {
                    violationTypes: {
                        include: {
                            violation: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            sanctions: true,
                            caseActions: true
                        }
                    }
                }
            }),
            prisma.sanctionType.count({ where })
        ])

        return {
            sanctionTypes,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        }
    } catch (error) {
        console.error('Error fetching sanction types:', error)
        throw new Error('Gagal mengambil data jenis sanksi')
    }
}

export async function getSanctionTypeStats() {
    try {
        const [total, ringan, sedang, berat] = await Promise.all([
            prisma.sanctionType.count({ where: { isActive: true } }),
            prisma.sanctionType.count({ where: { level: 'RINGAN', isActive: true } }),
            prisma.sanctionType.count({ where: { level: 'SEDANG', isActive: true } }),
            prisma.sanctionType.count({ where: { level: 'BERAT', isActive: true } })
        ])

        return {
            total,
            ringan,
            sedang,
            berat
        }
    } catch (error) {
        console.error('Error fetching sanction type stats:', error)
        throw new Error('Gagal mengambil statistik jenis sanksi')
    }
}

export async function createSanctionType(data: {
    name: string
    level: string
    description?: string
    duration?: number
}) {
    try {
        
        const existing = await prisma.sanctionType.findFirst({
            where: { 
                name: { equals: data.name, mode: 'insensitive' },
                isActive: true
            }
        })

        if (existing) {
            throw new Error('Nama jenis sanksi sudah ada')
        }

        await prisma.sanctionType.create({
            data: {
                name: data.name,
                level: data.level as any,
                description: data.description,
                duration: data.duration,
                isActive: true
            }
        })

        revalidatePath('/master/sanctions')
        return { success: true }
    } catch (error) {
        console.error('Error creating sanction type:', error)
        throw new Error(error instanceof Error ? error.message : 'Gagal membuat jenis sanksi')
    }
}

export async function updateSanctionType(sanctionTypeId: string, data: {
    name: string
    level: string
    description?: string
    duration?: number
    isActive?: boolean
}) {
    try {
        
        const existing = await prisma.sanctionType.findFirst({
            where: { 
                name: { equals: data.name, mode: 'insensitive' },
                isActive: true,
                NOT: { id: sanctionTypeId }
            }
        })

        if (existing) {
            throw new Error('Nama jenis sanksi sudah ada')
        }

        await prisma.sanctionType.update({
            where: { id: sanctionTypeId },
            data: {
                name: data.name,
                level: data.level as any,
                description: data.description,
                duration: data.duration,
                isActive: data.isActive
            }
        })

        revalidatePath('/master/sanctions')
        return { success: true }
    } catch (error) {
        console.error('Error updating sanction type:', error)
        throw new Error(error instanceof Error ? error.message : 'Gagal mengupdate jenis sanksi')
    }
}

export async function deleteSanctionType(sanctionTypeId: string) {
    try {
        
        const usage = await prisma.sanctionType.findUnique({
            where: { id: sanctionTypeId },
            include: {
                _count: {
                    select: {
                        sanctions: true,
                        caseActions: true,
                        violationTypes: true
                    }
                }
            }
        })

        if (!usage) {
            throw new Error('Jenis sanksi tidak ditemukan')
        }

        const totalUsage = usage._count.sanctions + usage._count.caseActions + usage._count.violationTypes

        if (totalUsage > 0) {
            
            await prisma.sanctionType.update({
                where: { id: sanctionTypeId },
                data: { isActive: false }
            })
        } else {
            
            await prisma.sanctionType.delete({
                where: { id: sanctionTypeId }
            })
        }

        revalidatePath('/master/sanctions')
        return { success: true }
    } catch (error) {
        console.error('Error deleting sanction type:', error)
        throw new Error(error instanceof Error ? error.message : 'Gagal menghapus jenis sanksi')
    }
}

export async function getSanctionType(sanctionTypeId: string) {
    try {
        const sanctionType = await prisma.sanctionType.findUnique({
            where: { id: sanctionTypeId },
            include: {
                violationTypes: {
                    include: {
                        violation: {
                            select: {
                                name: true,
                                category: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        sanctions: true,
                        caseActions: true
                    }
                }
            }
        })

        if (!sanctionType) {
            throw new Error('Jenis sanksi tidak ditemukan')
        }

        return sanctionType
    } catch (error) {
        console.error('Error fetching sanction type:', error)
        throw new Error('Gagal mengambil data jenis sanksi')
    }
}
