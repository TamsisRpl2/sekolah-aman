'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function getStudents(params: {
    page?: number
    limit?: number
    search?: string
    classLevel?: string
    major?: string
    academicYear?: string
    isActive?: boolean
}) {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            classLevel = '',
            major = '',
            academicYear = '',
            isActive
        } = params

        const skip = (page - 1) * limit
        
        const where: any = {}

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { nis: { contains: search, mode: 'insensitive' } }
            ]
        }

        if (major) {
            where.major = major
        }

        if (academicYear) {
            where.academicYear = academicYear
        }

        if (isActive !== undefined) {
            where.isActive = isActive
        }

        const [students, total] = await Promise.all([
            prisma.student.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    nis: true,
                    phone: true,
                    photo: true,
                    gender: true,
                    major: true,
                    academicYear: true,
                    isActive: true,
                    birthPlace: true,
                    birthDate: true,
                    address: true,
                    parentPhone: true,
                    parentName: true,
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
            prisma.student.count({ where })
        ])

        const totalPages = Math.ceil(total / limit)

        return {
            students,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        }
    } catch (error) {
        console.error('Error fetching students:', error)
        throw new Error('Gagal mengambil data siswa')
    }
}

export async function deleteStudent(studentId: string, force: boolean = false) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            throw new Error('Unauthorized')
        }

        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                _count: {
                    select: {
                        violationCases: true
                    }
                }
            }
        })

        if (!student) {
            throw new Error('Siswa tidak ditemukan')
        }

        const violationCount = student._count.violationCases

        if (violationCount > 0 && !force) {
            await prisma.student.update({
                where: { id: studentId },
                data: { isActive: false }
            })

            revalidatePath('/students')
            return {
                type: 'soft_delete',
                message: `Siswa ${student.name} memiliki ${violationCount} riwayat pelanggaran. Akun telah dinonaktifkan.`,
                violationCount
            }
        } else {
            await prisma.student.delete({
                where: { id: studentId }
            })

            revalidatePath('/students')
            return {
                type: 'hard_delete',
                message: `Siswa ${student.name} berhasil dihapus permanen.`
            }
        }
    } catch (error) {
        console.error('Error deleting student:', error)
        throw new Error(error instanceof Error ? error.message : 'Gagal menghapus siswa')
    }
}

export async function getStudentStats() {
    try {
        const [
            totalStudents,
            activeStudents,
            inactiveStudents,
            maleStudents,
            femaleStudents,
            recentStudents
        ] = await Promise.all([
            prisma.student.count(),
            prisma.student.count({
                where: { isActive: true }
            }),
            prisma.student.count({
                where: { isActive: false }
            }),
            prisma.student.count({
                where: { gender: 'L' }
            }),
            prisma.student.count({
                where: { gender: 'P' }
            }),
            prisma.student.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    }
                }
            })
        ])

        return {
            totalStudents,
            activeStudents,
            inactiveStudents,
            maleStudents,
            femaleStudents,
            recentStudents
        }
    } catch (error) {
        console.error('Error fetching student stats:', error)
        throw new Error('Gagal mengambil statistik siswa')
    }
}
