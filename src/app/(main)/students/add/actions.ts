'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function createStudent(data: {
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

        const existingStudent = await prisma.student.findUnique({
            where: { nis: data.nis }
        })

        if (existingStudent) {
            throw new Error('NIS sudah digunakan')
        }

        const createData: any = {
            name: data.name,
            nis: data.nis,
            gender: data.gender,
            academicYear: data.academicYear,
            isActive: true
        }

        if (data.birthPlace) createData.birthPlace = data.birthPlace
        if (data.birthDate) createData.birthDate = new Date(data.birthDate)
        if (data.address) createData.address = data.address
        if (data.phone) createData.phone = data.phone
        if (data.parentName) createData.parentName = data.parentName
        if (data.parentPhone) createData.parentPhone = data.parentPhone
        if (data.major) createData.major = data.major
        if (data.photo) createData.photo = data.photo

        const newStudent = await prisma.student.create({
            data: createData
        })

        revalidatePath('/students')

        return { student: newStudent }
    } catch (error) {
        console.error('Error creating student:', error)
        throw new Error(error instanceof Error ? error.message : 'Gagal membuat data siswa')
    }
}

export async function createStudentAndRedirect(formData: FormData) {
    try {
        const data = {
            name: String(formData.get('name') || ''),
            nis: String(formData.get('nis') || ''),
            gender: String(formData.get('gender') || 'L') as 'L' | 'P',
            birthPlace: String(formData.get('birthPlace') || '') || undefined,
            birthDate: String(formData.get('birthDate') || '') || undefined,
            address: String(formData.get('address') || '') || undefined,
            phone: String(formData.get('phone') || '') || undefined,
            parentName: String(formData.get('parentName') || '') || undefined,
            parentPhone: String(formData.get('parentPhone') || '') || undefined,
            major: String(formData.get('major') || '') || undefined,
            academicYear: String(formData.get('academicYear') || ''),
            photo: String(formData.get('photo') || '') || undefined
        }

        if (!data.name.trim()) {
            throw new Error('Nama siswa wajib diisi')
        }
        if (!data.nis.trim()) {
            throw new Error('NIS wajib diisi')
        }
        if (!data.academicYear.trim()) {
            throw new Error('Tahun ajaran wajib diisi')
        }

        await createStudent(data)
        
        revalidatePath('/students')
    } catch (error) {
        throw error
    }
    
    redirect('/students')
}
