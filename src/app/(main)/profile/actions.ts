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

export async function getUserStats(userId: string) {
    try {
        
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, name: true, email: true, image: true }
        })

        if (!user) {
            throw new Error('User tidak ditemukan')
        }

        let stats = {
            casesHandled: 0,
            studentsHandled: 0,
            violationsReported: 0,
            activeThisMonth: 0
        }

        if (user.role === 'GURU' || user.role === 'ADMIN') {
            
            const casesHandled = await prisma.violationCase.count({
                where: { inputById: userId }
            })

const studentsHandled = await prisma.violationCase.groupBy({
                by: ['studentId'],
                where: { inputById: userId }
            })

const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            const violationsThisMonth = await prisma.violationCase.count({
                where: {
                    inputById: userId,
                    createdAt: {
                        gte: startOfMonth
                    }
                }
            })

            stats = {
                casesHandled,
                studentsHandled: studentsHandled.length,
                violationsReported: casesHandled,
                activeThisMonth: violationsThisMonth
            }
        }

        return { user, stats }
    } catch (error) {
        console.error('Error fetching user stats:', error)
        throw new Error('Gagal mengambil statistik user')
    }
}
