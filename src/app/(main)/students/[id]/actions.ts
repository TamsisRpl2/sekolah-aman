'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function getStudent(studentId: string) {
    try {
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

        return { student }
    } catch (error) {
        console.error('Error fetching student:', error)
        throw new Error(error instanceof Error ? error.message : 'Gagal mengambil data siswa')
    }
}

export async function updateStudent(studentId: string, data: {
    name: string
    nis: string
    gender: 'L' | 'P'
    birthPlace?: string
    birthDate?: string
    address?: string
    phone?: string
    parentName?: string
    parentPhone?: string
    major?: string
    academicYear: string
    photo?: string
}) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            throw new Error('Unauthorized')
        }

        const existingStudent = await prisma.student.findFirst({
            where: {
                nis: data.nis,
                id: { not: studentId }
            }
        })

        if (existingStudent) {
            throw new Error('NIS sudah digunakan oleh siswa lain')
        }
        const updateData: any = {
            name: data.name,
            nis: data.nis,
            gender: data.gender,
            academicYear: data.academicYear,
            updatedAt: new Date()
        }

        if (data.birthPlace) updateData.birthPlace = data.birthPlace
        if (data.birthDate) updateData.birthDate = new Date(data.birthDate)
        if (data.address) updateData.address = data.address
        if (data.phone) updateData.phone = data.phone
        if (data.parentName) updateData.parentName = data.parentName
        if (data.parentPhone) updateData.parentPhone = data.parentPhone
        if (data.major) updateData.major = data.major
        if (data.photo) updateData.photo = data.photo

        const updatedStudent = await prisma.student.update({
            where: { id: studentId },
            data: updateData
        })

        revalidatePath(`/students/${studentId}`)
        revalidatePath('/students')

        return { student: updatedStudent }
    } catch (error) {
        console.error('Error updating student:', error)
        throw new Error(error instanceof Error ? error.message : 'Gagal mengupdate data siswa')
    }
}

export async function deleteStudentById(studentId: string, force: boolean = false) {
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
