'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function getSanctionHistory(params?: {
    search?: string
    status?: string
    level?: string
    page?: number
    limit?: number
    startDate?: string
    endDate?: string
}) {
    try {
        const page = params?.page || 1
        const limit = params?.limit || 10
        const skip = (page - 1) * limit

        const where: any = {}

        if (params?.search) {
            where.OR = [
                { 
                    case: {
                        student: {
                            name: { contains: params.search, mode: 'insensitive' }
                        }
                    }
                },
                { 
                    case: {
                        student: {
                            nis: { contains: params.search, mode: 'insensitive' }
                        }
                    }
                },
                { 
                    case: {
                        caseNumber: { contains: params.search, mode: 'insensitive' }
                    }
                },
                {
                    sanctionType: {
                        name: { contains: params.search, mode: 'insensitive' }
                    }
                }
            ]
        }

        if (params?.status) {
            if (params.status === 'completed') {
                where.isCompleted = true
            } else if (params.status === 'active') {
                where.isCompleted = false
            }
        }

        if (params?.level) {
            where.sanctionType = {
                level: params.level
            }
        }

        if (params?.startDate || params?.endDate) {
            where.startDate = {}
            if (params.startDate) {
                where.startDate.gte = new Date(params.startDate)
            }
            if (params.endDate) {
                where.startDate.lte = new Date(params.endDate)
            }
        }

        const [sanctions, total] = await Promise.all([
            prisma.sanction.findMany({
                where,
                skip,
                take: limit,
                orderBy: { startDate: 'desc' },
                include: {
                    case: {
                        select: {
                            caseNumber: true,
                            violationDate: true,
                            status: true,
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
                                            level: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    sanctionType: {
                        select: {
                            name: true,
                            level: true,
                            duration: true
                        }
                    },
                    givenBy: {
                        select: {
                            name: true
                        }
                    }
                }
            }),
            prisma.sanction.count({ where })
        ])

        return {
            sanctions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        }
    } catch (error) {
        console.error('Error fetching sanction history:', error)
        throw new Error('Gagal mengambil riwayat sanksi')
    }
}

export async function getSanctionStats() {
    try {
        const [
            totalSanctions,
            activeSanctions,
            completedSanctions,
            ringanSanctions,
            sedangSanctions,
            beratSanctions
        ] = await Promise.all([
            prisma.sanction.count(),
            prisma.sanction.count({ where: { isCompleted: false } }),
            prisma.sanction.count({ where: { isCompleted: true } }),
            prisma.sanction.count({
                where: {
                    sanctionType: {
                        level: 'RINGAN'
                    }
                }
            }),
            prisma.sanction.count({
                where: {
                    sanctionType: {
                        level: 'SEDANG'
                    }
                }
            }),
            prisma.sanction.count({
                where: {
                    sanctionType: {
                        level: 'BERAT'
                    }
                }
            })
        ])

        return {
            total: totalSanctions,
            active: activeSanctions,
            completed: completedSanctions,
            byLevel: {
                ringan: ringanSanctions,
                sedang: sedangSanctions,
                berat: beratSanctions
            }
        }
    } catch (error) {
        console.error('Error fetching sanction stats:', error)
        throw new Error('Gagal mengambil statistik sanksi')
    }
}

export async function getSanction(sanctionId: string) {
    try {
        const sanction = await prisma.sanction.findUnique({
            where: { id: sanctionId },
            include: {
                case: {
                    include: {
                        student: {
                            select: {
                                name: true,
                                nis: true,
                                major: true,
                                academicYear: true
                            }
                        },
                        violation: {
                            select: {
                                name: true,
                                description: true,
                                category: {
                                    select: {
                                        name: true,
                                        level: true
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
                },
                sanctionType: {
                    select: {
                        name: true,
                        level: true,
                        duration: true,
                        description: true
                    }
                },
                givenBy: {
                    select: {
                        name: true
                    }
                }
            }
        })

        if (!sanction) {
            throw new Error('Sanksi tidak ditemukan')
        }

        return sanction
    } catch (error) {
        console.error('Error fetching sanction:', error)
        throw new Error('Gagal mengambil data sanksi')
    }
}

export async function updateSanctionStatus(sanctionId: string, data: {
    isCompleted: boolean
    completedDate?: string
    notes?: string
}) {
    try {
        await prisma.sanction.update({
            where: { id: sanctionId },
            data: {
                isCompleted: data.isCompleted,
                completedDate: data.completedDate ? new Date(data.completedDate) : null,
                notes: data.notes
            }
        })

        revalidatePath('/sanctions-history')
        return { success: true }
    } catch (error) {
        console.error('Error updating sanction status:', error)
        throw new Error('Gagal mengupdate status sanksi')
    }
}

export async function getActiveSanctions() {
    try {
        const sanctions = await prisma.sanction.findMany({
            where: { 
                isCompleted: false,
                endDate: {
                    gte: new Date()
                }
            },
            orderBy: { startDate: 'desc' },
            include: {
                case: {
                    select: {
                        caseNumber: true,
                        student: {
                            select: {
                                name: true,
                                nis: true,
                                major: true
                            }
                        }
                    }
                },
                sanctionType: {
                    select: {
                        name: true,
                        level: true
                    }
                }
            }
        })

        return sanctions
    } catch (error) {
        console.error('Error fetching active sanctions:', error)
        throw new Error('Gagal mengambil data sanksi aktif')
    }
}

export async function getExpiringSanctions(days: number = 7) {
    try {
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + days)

        const sanctions = await prisma.sanction.findMany({
            where: {
                isCompleted: false,
                endDate: {
                    gte: new Date(),
                    lte: futureDate
                }
            },
            orderBy: { endDate: 'asc' },
            include: {
                case: {
                    select: {
                        caseNumber: true,
                        student: {
                            select: {
                                name: true,
                                nis: true,
                                major: true
                            }
                        }
                    }
                },
                sanctionType: {
                    select: {
                        name: true,
                        level: true
                    }
                }
            }
        })

        return sanctions
    } catch (error) {
        console.error('Error fetching expiring sanctions:', error)
        throw new Error('Gagal mengambil data sanksi yang akan berakhir')
    }
}

export async function getSanctionsByStudent(studentId: string) {
    try {
        const sanctions = await prisma.sanction.findMany({
            where: {
                case: {
                    studentId
                }
            },
            orderBy: { startDate: 'desc' },
            include: {
                case: {
                    select: {
                        caseNumber: true,
                        violationDate: true,
                        violation: {
                            select: {
                                name: true,
                                category: {
                                    select: {
                                        level: true
                                    }
                                }
                            }
                        }
                    }
                },
                sanctionType: {
                    select: {
                        name: true,
                        level: true,
                        duration: true
                    }
                },
                givenBy: {
                    select: {
                        name: true
                    }
                }
            }
        })

        return sanctions
    } catch (error) {
        console.error('Error fetching sanctions by student:', error)
        throw new Error('Gagal mengambil riwayat sanksi siswa')
    }
}
