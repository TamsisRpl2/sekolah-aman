'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function getTeachers(params: {
    page?: number
    limit?: number
    search?: string
    role?: string
    isActive?: boolean
}) {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            role = '',
            isActive
        } = params

        const skip = (page - 1) * limit
        
        const where: any = {
            role: { in: ['GURU', 'ADMIN'] }
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ]
        }

        if (role && (role === 'GURU' || role === 'ADMIN')) {
            where.role = role
        }

        if (isActive !== undefined) {
            where.isActive = isActive
        }

        const [teachers, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    image: true,
                    role: true,
                    address: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,
                    _count: {
                        select: {
                            violationCases: true
                        }
                    }
                },
                skip,
                take: limit,
                orderBy: {
                    name: 'asc'
                }
            }),
            prisma.user.count({ where })
        ])

        const totalPages = Math.ceil(total / limit)

        return {
            teachers,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        }
    } catch (error) {
        console.error('Error fetching teachers:', error)
        throw new Error('Gagal mengambil data guru')
    }
}

export async function deleteTeacher(teacherId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            throw new Error('Unauthorized')
        }

const teacher = await prisma.user.findUnique({
            where: { id: teacherId, role: { in: ['GURU', 'ADMIN'] } },
            include: {
                _count: {
                    select: {
                        violationCases: true
                    }
                }
            }
        })

        if (!teacher) {
            throw new Error('Guru tidak ditemukan')
        }

const casesCount = teacher._count.violationCases

        if (casesCount > 0) {
            
            await prisma.user.update({
                where: { id: teacherId },
                data: { isActive: false }
            })

            revalidatePath('/users/teachers')
            return {
                type: 'soft_delete',
                message: `Guru ${teacher.name} memiliki ${casesCount} riwayat kasus. Akun telah dinonaktifkan.`,
                casesCount
            }
        } else {
            
            await prisma.user.delete({
                where: { id: teacherId }
            })

            revalidatePath('/users/teachers')
            return {
                type: 'hard_delete',
                message: `Guru ${teacher.name} berhasil dihapus permanen.`
            }
        }
    } catch (error) {
        console.error('Error deleting teacher:', error)
        throw new Error(error instanceof Error ? error.message : 'Gagal menghapus guru')
    }
}

export async function getTeacherStats() {
    try {
        const [
            totalTeachers,
            activeTeachers,
            adminCount,
            guruCount,
            recentTeachers
        ] = await Promise.all([
            prisma.user.count({
                where: { role: { in: ['GURU', 'ADMIN'] } }
            }),
            prisma.user.count({
                where: { role: { in: ['GURU', 'ADMIN'] }, isActive: true }
            }),
            prisma.user.count({
                where: { role: 'ADMIN' }
            }),
            prisma.user.count({
                where: { role: 'GURU' }
            }),
            prisma.user.count({
                where: {
                    role: { in: ['GURU', 'ADMIN'] },
                    createdAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
                    }
                }
            })
        ])

        return {
            totalTeachers,
            activeTeachers,
            adminCount,
            guruCount,
            recentTeachers
        }
    } catch (error) {
        console.error('Error fetching teacher stats:', error)
        throw new Error('Gagal mengambil statistik guru')
    }
}
