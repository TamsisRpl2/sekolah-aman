'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'

export async function createTeacher(data: {
    name: string
    email: string
    password: string
    role: 'GURU' | 'ADMIN'
    phone?: string
    address?: string
}) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            throw new Error('Unauthorized')
        }

const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        })

        if (existingUser) {
            throw new Error('Email sudah digunakan')
        }

const hashedPassword = await bcrypt.hash(data.password, 12)

const createData: any = {
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: data.role,
            isActive: true
        }

if (data.phone) createData.phone = data.phone
        if (data.address) createData.address = data.address

const newTeacher = await prisma.user.create({
            data: createData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                address: true,
                isActive: true,
                createdAt: true
            }
        })

        revalidatePath('/users/teachers')

        return { teacher: newTeacher }
    } catch (error) {
        console.error('Error creating teacher:', error)
        throw new Error(error instanceof Error ? error.message : 'Gagal membuat data guru')
    }
}

export async function createTeacherAndRedirect(formData: FormData) {
    try {
        const data = {
            name: String(formData.get('name') || ''),
            email: String(formData.get('email') || ''),
            password: String(formData.get('password') || ''),
            role: String(formData.get('role') || 'GURU') as 'GURU' | 'ADMIN',
            phone: String(formData.get('phone') || '') || undefined,
            address: String(formData.get('address') || '') || undefined
        }

if (!data.name.trim()) {
            throw new Error('Nama guru wajib diisi')
        }
        if (!data.email.trim()) {
            throw new Error('Email wajib diisi')
        }
        if (!data.password.trim()) {
            throw new Error('Password wajib diisi')
        }
        if (data.password.length < 6) {
            throw new Error('Password minimal 6 karakter')
        }

        await createTeacher(data)
        
        revalidatePath('/users/teachers')
    } catch (error) {
        throw error
    }
    
    redirect('/users/teachers')
}
