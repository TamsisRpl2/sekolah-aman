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

        const where: any = {}

        if (params?.search) {
            where.OR = [
                { name: { contains: params.search, mode: 'insensitive' } },
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
                    violationTypes: {
                        select: {
                            id: true,
                            description: true
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

export async function getSanctionTypes() {
    try {
        const sanctionTypes = await prisma.sanctionType.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        })

        return sanctionTypes
    } catch (error) {
        console.error('Error fetching sanction types:', error)
        throw new Error('Gagal mengambil data jenis sanksi')
    }
}

export async function getViolationStats() {
    try {
        const [total, ringan, sedang, berat, categories] = await Promise.all([
            prisma.violation.count(),
            prisma.violation.count({ 
                where: { 
                    category: { level: 'RINGAN' }
                }
            }),
            prisma.violation.count({ 
                where: { 
                    category: { level: 'SEDANG' }
                }
            }),
            prisma.violation.count({ 
                where: { 
                    category: { level: 'BERAT' }
                }
            }),
            prisma.violationCategory.count({ where: { isActive: true } })
        ])

        return {
            totalViolations: total,
            violationsByLevel: {
                ringan,
                sedang,
                berat
            },
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
    types?: string[]
    points?: string
    sanctions?: string[]
}) {
    try {
        
        const existing = await prisma.violation.findFirst({
            where: { 
                code: { equals: data.code, mode: 'insensitive' }
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
                points: data.points || 'SP 1'
            }
        })

        // Handle violation types - create multiple types
        if (data.types && data.types.length > 0) {
            const validTypes = data.types.filter(t => t.trim() !== '')
            
            for (const typeDesc of validTypes) {
                await prisma.violationType.create({
                    data: {
                        violationId: violation.id,
                        description: typeDesc.trim()
                    }
                })
            }
        }

        // Handle sanctions - create sanctionTypes if not exist and link them
        if (data.sanctions && data.sanctions.length > 0) {
            const validSanctions = data.sanctions.filter(s => s.trim() !== '')
            
            for (const sanctionName of validSanctions) {
                // Check if sanctionType exists, if not create it
                let sanctionType = await prisma.sanctionType.findFirst({
                    where: { 
                        name: { equals: sanctionName.trim(), mode: 'insensitive' }
                    }
                })

                if (!sanctionType) {
                    // Create new sanctionType with default values
                    sanctionType = await prisma.sanctionType.create({
                        data: {
                            name: sanctionName.trim(),
                            level: 'RINGAN', // default level
                            isActive: true
                        }
                    })
                }

                // Link violation with sanctionType
                await prisma.violationSanctionType.create({
                    data: {
                        violationId: violation.id,
                        sanctionTypeId: sanctionType.id
                    }
                })
            }
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
    types?: string[]
    points?: string
    sanctions?: string[]
}) {
    try {
        
        const existing = await prisma.violation.findFirst({
            where: { 
                code: { equals: data.code, mode: 'insensitive' },
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
                points: data.points || 'SP 1'
            }
        })

        // Handle violation types update
        if (data.types !== undefined) {
            
            // Delete existing types
            await prisma.violationType.deleteMany({
                where: { violationId }
            })

            // Add new types
            if (data.types.length > 0) {
                const validTypes = data.types.filter(t => t.trim() !== '')
                
                for (const typeDesc of validTypes) {
                    await prisma.violationType.create({
                        data: {
                            violationId,
                            description: typeDesc.trim()
                        }
                    })
                }
            }
        }

        // Handle sanctions update
        if (data.sanctions !== undefined) {
            
            // Delete existing sanction relations
            await prisma.violationSanctionType.deleteMany({
                where: { violationId }
            })

            // Add new sanctions
            if (data.sanctions.length > 0) {
                const validSanctions = data.sanctions.filter(s => s.trim() !== '')
                
                for (const sanctionName of validSanctions) {
                    // Check if sanctionType exists, if not create it
                    let sanctionType = await prisma.sanctionType.findFirst({
                        where: { 
                            name: { equals: sanctionName.trim(), mode: 'insensitive' }
                        }
                    })

                    if (!sanctionType) {
                        // Create new sanctionType with default values
                        sanctionType = await prisma.sanctionType.create({
                            data: {
                                name: sanctionName.trim(),
                                level: 'RINGAN', // default level
                                isActive: true
                            }
                        })
                    }

                    // Link violation with sanctionType
                    await prisma.violationSanctionType.create({
                        data: {
                            violationId,
                            sanctionTypeId: sanctionType.id
                        }
                    })
                }
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
            throw new Error('Pelanggaran tidak dapat dihapus karena sudah digunakan dalam ' + usage._count.violationCases + ' kasus pelanggaran')
        }

        // Delete related records first (violationTypes will be cascade deleted automatically)
        await prisma.violationSanctionType.deleteMany({
            where: { violationId }
        })
        
        // Delete the violation
        await prisma.violation.delete({
            where: { id: violationId }
        })

        revalidatePath('/master/violations')
        return { success: true }
    } catch (error) {
        console.error('Error deleting violation:', error)
        throw new Error(error instanceof Error ? error.message : 'Gagal menghapus pelanggaran')
    }
}

export async function updateViolationCategory(categoryId: string, data: {
    code: string
    name: string
    level: string
    description?: string
    isActive?: boolean
}) {
    try {
        // Check duplicate code
        const existing = await prisma.violationCategory.findFirst({
            where: { 
                code: { equals: data.code, mode: 'insensitive' },
                isActive: true,
                NOT: { id: categoryId }
            }
        })

        if (existing) {
            throw new Error('Kode kategori sudah ada')
        }

        await prisma.violationCategory.update({
            where: { id: categoryId },
            data: {
                code: data.code,
                name: data.name,
                level: data.level as any,
                description: data.description,
                isActive: data.isActive
            }
        })

        revalidatePath('/master/violations')
        return { success: true }
    } catch (error) {
        console.error('Error updating violation category:', error)
        throw new Error(error instanceof Error ? error.message : 'Gagal mengupdate kategori pelanggaran')
    }
}

export async function deleteViolationCategory(categoryId: string, forceDelete: boolean = false) {
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

        if (usage._count.violations > 0 && !forceDelete) {
            throw new Error(`Kategori masih digunakan oleh ${usage._count.violations} pelanggaran. Gunakan force delete untuk menghapus paksa.`)
        }

        if (forceDelete) {
            // Delete all violations in this category first
            const violations = await prisma.violation.findMany({
                where: { categoryId },
                select: { id: true }
            })

            // Delete sanction relations for each violation
            for (const violation of violations) {
                await prisma.violationSanctionType.deleteMany({
                    where: { violationId: violation.id }
                })
            }

            // Delete all violations
            await prisma.violation.deleteMany({
                where: { categoryId }
            })
        }

        await prisma.violationCategory.delete({
            where: { id: categoryId }
        })

        revalidatePath('/master/violations')
        return { success: true, message: 'Kategori berhasil dihapus' }
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
                                level: true,
                                duration: true
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
