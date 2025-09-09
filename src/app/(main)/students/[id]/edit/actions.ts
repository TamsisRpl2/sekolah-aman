'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export async function getStudentForEdit(studentId: string) {
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

        return student
    } catch (error) {
        console.error('Error fetching student for edit:', error)
        throw new Error('Gagal mengambil data siswa')
    }
}

export async function updateStudentData(studentId: string, data: {
    nis: string
    name: string
    gender: 'L' | 'P'
    birthPlace?: string
    birthDate?: string
    address?: string
    phone?: string
    parentPhone?: string
    parentName?: string
    major?: string
    academicYear: string
    photo?: string
    isActive?: boolean
}) {
    try {
        const existingStudent = await prisma.student.findFirst({
            where: {
                nis: data.nis,
                NOT: { id: studentId }
            }
        })

        if (existingStudent) {
            throw new Error('NIS sudah digunakan oleh siswa lain')
        }

        await prisma.student.update({
            where: { id: studentId },
            data: {
                nis: data.nis,
                name: data.name,
                gender: data.gender,
                birthPlace: data.birthPlace,
                birthDate: data.birthDate ? new Date(data.birthDate) : null,
                address: data.address,
                phone: data.phone,
                parentPhone: data.parentPhone,
                parentName: data.parentName,
                major: data.major,
                academicYear: data.academicYear,
                photo: data.photo,
                isActive: data.isActive
            }
        })

        revalidatePath('/students')
        revalidatePath(`/students/${studentId}`)
        revalidatePath(`/students/${studentId}/edit`)
        return { success: true }
    } catch (error) {
        console.error('Error updating student:', error)
        throw new Error(error instanceof Error ? error.message : 'Gagal mengupdate data siswa')
    }
}

export async function updateStudentAndRedirect(studentId: string, data: {
    nis: string
    name: string
    gender: 'L' | 'P'
    birthPlace?: string
    birthDate?: string
    address?: string
    phone?: string
    parentPhone?: string
    parentName?: string
    major?: string
    academicYear: string
    photo?: string
    isActive?: boolean
}) {
    await updateStudentData(studentId, data)
    redirect(`/students/${studentId}`)
}

export async function getStudentViolationHistory(studentId: string) {
    try {
        const violations = await prisma.violationCase.findMany({
            where: { studentId },
            orderBy: { violationDate: 'desc' },
            include: {
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
                },
                actions: {
                    select: {
                        id: true,
                        actionType: true,
                        description: true,
                        isCompleted: true
                    }
                }
            }
        })

        return violations
    } catch (error) {
        console.error('Error fetching student violation history:', error)
        throw new Error('Gagal mengambil riwayat pelanggaran siswa')
    }
}

export async function validateNIS(nis: string, currentStudentId?: string) {
    try {
        const where: any = { nis }
        
        if (currentStudentId) {
            where.NOT = { id: currentStudentId }
        }

        const existingStudent = await prisma.student.findFirst({ where })
        
        return {
            isValid: !existingStudent,
            message: existingStudent ? 'NIS sudah digunakan' : 'NIS tersedia'
        }
    } catch (error) {
        console.error('Error validating NIS:', error)
        throw new Error('Gagal memvalidasi NIS')
    }
}
