'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function updateProfilePhoto(formData: FormData) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            throw new Error('Unauthorized')
        }

        const file = formData.get('photo') as File
        if (!file) {
            throw new Error('No file provided')
        }

if (!file.type.startsWith('image/')) {
            throw new Error('File harus berupa gambar')
        }

if (file.size > 5 * 1024 * 1024) {
            throw new Error('Ukuran file maksimal 5MB')
        }

const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { image: true }
        })

if (currentUser?.image) {
            try {
                const publicId = currentUser.image.split('/').pop()?.split('.')[0]
                if (publicId) {
                    await cloudinary.uploader.destroy(`sekolah-aman/profiles/${publicId}`)
                }
            } catch (error) {
                console.log('Could not delete old photo:', error)
            }
        }

const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    resource_type: 'image',
                    folder: 'sekolah-aman/profiles',
                    transformation: [
                        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
                        { quality: 'auto:good' }
                    ]
                },
                (error, result) => {
                    if (error) reject(error)
                    else resolve(result)
                }
            ).end(buffer)
        }) as any

await prisma.user.update({
            where: { id: session.user.id },
            data: { image: result.secure_url }
        })

        revalidatePath('/profile')
        return { success: true, photoUrl: result.secure_url }
    } catch (error) {
        console.error('Error updating profile photo:', error)
        throw new Error(error instanceof Error ? error.message : 'Gagal mengupdate foto profil')
    }
}

export async function updateUserProfile(data: {
    name: string
    phone?: string
    address?: string
}) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            throw new Error('Unauthorized')
        }

        if (!data.name || data.name.trim().length === 0) {
            throw new Error('Nama tidak boleh kosong')
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name: data.name.trim(),
                phone: data.phone?.trim() || null,
                address: data.address?.trim() || null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
                role: true,
                image: true,
            }
        })

        revalidatePath('/profile')
        return { 
            success: true, 
            user: updatedUser 
        }
    } catch (error) {
        console.error('Error updating user profile:', error)
        throw new Error(error instanceof Error ? error.message : 'Gagal mengupdate profil')
    }
}

export async function getUserProfile(userId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            throw new Error('Unauthorized')
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { 
                id: true,
                name: true, 
                email: true, 
                phone: true,
                address: true,
                role: true,
                image: true,
                createdAt: true,
                isActive: true
            }
        })

        if (!user) {
            throw new Error('User tidak ditemukan')
        }

        return user
    } catch (error) {
        console.error('Error fetching user profile:', error)
        throw new Error('Gagal mengambil data profil')
    }
}

export async function getUserStats(userId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            throw new Error('Unauthorized')
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, name: true, email: true, image: true }
        })

        if (!user) {
            throw new Error('User tidak ditemukan')
        }

        const totalCasesReviewed = await prisma.violationCase.count({
            where: { inputById: userId }
        })

        const totalCasesResolved = await prisma.violationCase.count({
            where: { 
                inputById: userId,
                status: 'SELESAI'
            }
        })

        const firstCase = await prisma.violationCase.findFirst({
            where: { inputById: userId },
            orderBy: { createdAt: 'asc' },
            select: { createdAt: true }
        })

        let activeDays = 0
        if (firstCase) {
            const startDate = new Date(firstCase.createdAt)
            const endDate = new Date()
            const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
            activeDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        }

        const recentCases = await prisma.violationCase.findMany({
            where: { inputById: userId },
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                caseNumber: true,
                description: true,
                status: true,
                createdAt: true,
                student: {
                    select: {
                        name: true
                    }
                },
                violation: {
                    select: {
                        name: true
                    }
                }
            }
        })

        const formattedCases = recentCases.map(c => ({
            id: c.id,
            title: `${c.caseNumber} - ${c.violation.name}`,
            status: c.status,
            createdAt: c.createdAt.toISOString(),
            student: {
                name: c.student.name
            }
        }))

        return {
            totalCasesReviewed,
            totalCasesResolved,
            activeDays,
            recentCases: formattedCases
        }
    } catch (error) {
        console.error('Error fetching user stats:', error)
        throw new Error('Gagal mengambil statistik user')
    }
}
