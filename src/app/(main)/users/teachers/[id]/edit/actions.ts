'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function getTeacherForEdit(teacherId: string) {
    try {
        const teacher = await prisma.user.findUnique({
            where: { 
                id: teacherId,
                role: 'GURU'
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                address: true,
                image: true,
                isActive: true,
                createdAt: true,
                _count: {
                    select: {
                        violationCases: true,
                        caseActions: true
                    }
                }
            }
        })

        if (!teacher) {
            throw new Error('Guru tidak ditemukan')
        }

        return teacher
    } catch (error) {
        console.error('Error fetching teacher for edit:', error)
        throw new Error('Gagal mengambil data guru')
    }
}

export async function updateTeacherData(teacherId: string, data: {
    email: string
    name: string
    phone?: string
    address?: string
    image?: string
    isActive?: boolean
    password?: string
}) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            throw new Error('Unauthorized')
        }

        if (session.user.role !== 'ADMIN' && session.user.id !== teacherId) {
            throw new Error('Anda tidak memiliki akses untuk mengedit data guru ini')
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                email: data.email,
                NOT: { id: teacherId }
            }
        })

        if (existingUser) {
            throw new Error('Email sudah digunakan oleh pengguna lain')
        }

        const updateData: any = {
            email: data.email,
            name: data.name,
            phone: data.phone,
            address: data.address,
            image: data.image
        }

        if (session.user.role === 'ADMIN' && data.isActive !== undefined) {
            updateData.isActive = data.isActive
        }

        if (data.password && data.password.trim() !== '') {
            if (data.password.length < 6) {
                throw new Error('Password minimal 6 karakter')
            }
            updateData.password = await bcrypt.hash(data.password, 12)
        }

        await prisma.user.update({
            where: { id: teacherId },
            data: updateData
        })

        revalidatePath('/users/teachers')
        revalidatePath(`/users/teachers/${teacherId}`)
        revalidatePath(`/users/teachers/${teacherId}/edit`)
        return { success: true }
    } catch (error) {
        console.error('Error updating teacher:', error)
        throw new Error(error instanceof Error ? error.message : 'Gagal mengupdate data guru')
    }
}

export async function updateTeacherAndRedirect(teacherId: string, data: {
    email: string
    name: string
    phone?: string
    address?: string
    image?: string
    isActive?: boolean
    password?: string
}) {
    await updateTeacherData(teacherId, data)
    redirect(`/users/teachers/${teacherId}`)
}

export async function changeTeacherPassword(teacherId: string, data: {
    currentPassword?: string
    newPassword: string
    confirmPassword: string
}) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            throw new Error('Unauthorized')
        }

        if (session.user.role !== 'ADMIN' && session.user.id !== teacherId) {
            throw new Error('Anda tidak memiliki akses untuk mengubah password guru ini')
        }

        if (data.newPassword !== data.confirmPassword) {
            throw new Error('Konfirmasi password tidak cocok')
        }

        if (data.newPassword.length < 6) {
            throw new Error('Password minimal 6 karakter')
        }

        if (session.user.role !== 'ADMIN') {
            if (!data.currentPassword) {
                throw new Error('Password saat ini diperlukan')
            }

            const teacher = await prisma.user.findUnique({
                where: { id: teacherId },
                select: { password: true }
            })

            if (!teacher) {
                throw new Error('Guru tidak ditemukan')
            }

            const isCurrentPasswordValid = await bcrypt.compare(data.currentPassword, teacher.password)
            if (!isCurrentPasswordValid) {
                throw new Error('Password saat ini tidak benar')
            }
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(data.newPassword, 12)

        await prisma.user.update({
            where: { id: teacherId },
            data: { password: hashedPassword }
        })

        revalidatePath(`/users/teachers/${teacherId}/edit`)
        return { success: true }
    } catch (error) {
        console.error('Error changing teacher password:', error)
        throw new Error(error instanceof Error ? error.message : 'Gagal mengubah password')
    }
}

export async function validateTeacherEmail(email: string, currentTeacherId?: string) {
    try {
        const where: any = { email }
        
        if (currentTeacherId) {
            where.NOT = { id: currentTeacherId }
        }

        const existingUser = await prisma.user.findFirst({ where })
        
        return {
            isValid: !existingUser,
            message: existingUser ? 'Email sudah digunakan' : 'Email tersedia'
        }
    } catch (error) {
        console.error('Error validating teacher email:', error)
        throw new Error('Gagal memvalidasi email')
    }
}

export async function deleteTeacher(teacherId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            throw new Error('Unauthorized')
        }

        if (session.user.role !== 'ADMIN') {
            throw new Error('Hanya admin yang dapat menghapus guru')
        }

        // Don't allow deleting self
        if (session.user.id === teacherId) {
            throw new Error('Anda tidak dapat menghapus akun sendiri')
        }

        // Check if teacher has activity (cases, actions, sanctions)
        const teacher = await prisma.user.findUnique({
            where: { id: teacherId },
            include: {
                _count: {
                    select: {
                        violationCases: true,
                        caseActions: true,
                        sanctions: true
                    }
                }
            }
        })

        if (!teacher) {
            throw new Error('Guru tidak ditemukan')
        }

        const totalActivity = teacher._count.violationCases + teacher._count.caseActions + teacher._count.sanctions

        if (totalActivity > 0) {
            // Soft delete by setting isActive to false
            await prisma.user.update({
                where: { id: teacherId },
                data: { isActive: false }
            })
        } else {
            // Hard delete if no activity
            await prisma.user.delete({
                where: { id: teacherId }
            })
        }

        revalidatePath('/users/teachers')
        return { success: true }
    } catch (error) {
        console.error('Error deleting teacher:', error)
        throw new Error(error instanceof Error ? error.message : 'Gagal menghapus guru')
    }
}
