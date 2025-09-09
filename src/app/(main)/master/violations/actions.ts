'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export async function getViolationCategories() {
    try {
        const categories = await prisma.violationCategory.findMany({
            where: { isActive: true },
            orderBy: { code: 'asc' },
            include: {
                _count: {
                    select: {
                        violations: true
                    }
                }
            }
        })

        return categories
    } catch (error) {
        console.error('Error fetching violation categories:', error)
        throw new Error('Gagal mengambil data kategori pelanggaran')
    }
}

export async function getViolations(params?: {
    search?: string
    categoryId?: string
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
                { description: { contains: params.search, mode: 'insensitive' } },
                { code: { contains: params.search, mode: 'insensitive' } }
            ]
        }

        if (params?.categoryId) {
            where.categoryId = params.categoryId
        }

        if (params?.level) {
            where.category = {
                level: params.level
            }
        }

        const [violations, total] = await Promise.all([
            prisma.violation.findMany({
                where,
                skip,
                take: limit,
                orderBy: { code: 'asc' },
                include: {
                    category: {
                        select: {
                            name: true,
                            level: true,
                            code: true
                        }
                    },
                    sanctionTypes: {
                        include: {
                            sanctionType: {
                                select: {
                                    name: true,
                                    level: true
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            violationCases: true
                        }
                    }
                }
            }),
            prisma.violation.count({ where })
        ])

        return {
            violations,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        }
    } catch (error) {
        console.error('Error fetching violations:', error)
        throw new Error('Gagal mengambil data pelanggaran')
    }
}

export async function getViolationStats() {
    try {
        const [total, ringan, sedang, berat, categories] = await Promise.all([
            prisma.violation.count({ where: { isActive: true } }),
            prisma.violation.count({ 
                where: { 
                    isActive: true,
                    category: { level: 'RINGAN' }
                }
            }),
            prisma.violation.count({ 
                where: { 
                    isActive: true,
                    category: { level: 'SEDANG' }
                }
            }),
            prisma.violation.count({ 
                where: { 
                    isActive: true,
                    category: { level: 'BERAT' }
                }
            }),
            prisma.violationCategory.count({ where: { isActive: true } })
        ])

        return {
            total,
            ringan,
            sedang,
            berat,
            categories
        }
    } catch (error) {
        console.error('Error fetching violation stats:', error)
        throw new Error('Gagal mengambil statistik pelanggaran')
    }
}

export async function createViolationCategory(data: {
    code: string
    name: string
    level: string
    description?: string
}) {
    try {
        
        const existing = await prisma.violationCategory.findFirst({
            where: { 
                code: { equals: data.code, mode: 'insensitive' },
                isActive: true
            }
        })

        if (existing) {
            throw new Error('Kode kategori sudah ada')
        }

        await prisma.violationCategory.create({
            data: {
                code: data.code,
                name: data.name,
                level: data.level as any,
                description: data.description,
                isActive: true
            }
        })

        revalidatePath('/master/violations')
        return { success: true }
    } catch (error) {
        console.error('Error creating violation category:', error)
        throw new Error(error instanceof Error ? error.message : 'Gagal membuat kategori pelanggaran')
    }
}

export async function createViolation(data: {
    categoryId: string
    code: string
    name: string
    description: string
    maxCount: number
    period: string
    points?: number
    sanctionTypeIds?: string[]
}) {
    try {
        
        const existing = await prisma.violation.findFirst({
            where: { 
                code: { equals: data.code, mode: 'insensitive' },
                isActive: true
            }
        })

        if (existing) {
            throw new Error('Kode pelanggaran sudah ada')
        }

        const violation = await prisma.violation.create({
            data: {
                categoryId: data.categoryId,
                code: data.code,
                name: data.name,
                description: data.description,
                maxCount: data.maxCount,
                period: data.period,
                points: data.points || 0,
                isActive: true
            }
        })

if (data.sanctionTypeIds && data.sanctionTypeIds.length > 0) {
            await prisma.violationSanctionType.createMany({
                data: data.sanctionTypeIds.map(sanctionTypeId => ({
                    violationId: violation.id,
                    sanctionTypeId
                }))
            })
        }

        revalidatePath('/master/violations')
        return { success: true }
    } catch (error) {
        console.error('Error creating violation:', error)
        throw new Error(error instanceof Error ? error.message : 'Gagal membuat pelanggaran')
    }
}

export async function updateViolation(violationId: string, data: {
    categoryId: string
    code: string
    name: string
    description: string
    maxCount: number
    period: string
    points?: number
    sanctionTypeIds?: string[]
    isActive?: boolean
}) {
    try {
        
        const existing = await prisma.violation.findFirst({
            where: { 
                code: { equals: data.code, mode: 'insensitive' },
                isActive: true,
                NOT: { id: violationId }
            }
        })

        if (existing) {
            throw new Error('Kode pelanggaran sudah ada')
        }

        await prisma.violation.update({
            where: { id: violationId },
            data: {
                categoryId: data.categoryId,
                code: data.code,
                name: data.name,
                description: data.description,
                maxCount: data.maxCount,
                period: data.period,
                points: data.points || 0,
                isActive: data.isActive
            }
        })

if (data.sanctionTypeIds !== undefined) {
            
            await prisma.violationSanctionType.deleteMany({
                where: { violationId }
            })

if (data.sanctionTypeIds.length > 0) {
                await prisma.violationSanctionType.createMany({
                    data: data.sanctionTypeIds.map(sanctionTypeId => ({
                        violationId,
                        sanctionTypeId
                    }))
                })
            }
        }

        revalidatePath('/master/violations')
        return { success: true }
    } catch (error) {
        console.error('Error updating violation:', error)
        throw new Error(error instanceof Error ? error.message : 'Gagal mengupdate pelanggaran')
    }
}

export async function deleteViolation(violationId: string) {
    try {
        
        const usage = await prisma.violation.findUnique({
            where: { id: violationId },
            include: {
                _count: {
                    select: {
                        violationCases: true
                    }
                }
            }
        })

        if (!usage) {
            throw new Error('Pelanggaran tidak ditemukan')
        }

        if (usage._count.violationCases > 0) {
            
            await prisma.violation.update({
                where: { id: violationId },
                data: { isActive: false }
            })
        } else {
            
            await prisma.violationSanctionType.deleteMany({
                where: { violationId }
            })
            
            await prisma.violation.delete({
                where: { id: violationId }
            })
        }

        revalidatePath('/master/violations')
        return { success: true }
    } catch (error) {
        console.error('Error deleting violation:', error)
        throw new Error(error instanceof Error ? error.message : 'Gagal menghapus pelanggaran')
    }
}

export async function deleteViolationCategory(categoryId: string) {
    try {
        
        const usage = await prisma.violationCategory.findUnique({
            where: { id: categoryId },
            include: {
                _count: {
                    select: {
                        violations: true
                    }
                }
            }
        })

        if (!usage) {
            throw new Error('Kategori tidak ditemukan')
        }

        if (usage._count.violations > 0) {
            throw new Error('Kategori masih digunakan oleh pelanggaran lain')
        }

        await prisma.violationCategory.delete({
            where: { id: categoryId }
        })

        revalidatePath('/master/violations')
        return { success: true }
    } catch (error) {
        console.error('Error deleting violation category:', error)
        throw new Error(error instanceof Error ? error.message : 'Gagal menghapus kategori pelanggaran')
    }
}

export async function getViolation(violationId: string) {
    try {
        const violation = await prisma.violation.findUnique({
            where: { id: violationId },
            include: {
                category: {
                    select: {
                        name: true,
                        level: true,
                        code: true
                    }
                },
                sanctionTypes: {
                    include: {
                        sanctionType: {
                            select: {
                                id: true,
                                name: true,
                                level: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        violationCases: true
                    }
                }
            }
        })

        if (!violation) {
            throw new Error('Pelanggaran tidak ditemukan')
        }

        return violation
    } catch (error) {
        console.error('Error fetching violation:', error)
        throw new Error('Gagal mengambil data pelanggaran')
    }
}
