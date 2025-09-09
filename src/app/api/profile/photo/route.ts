import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadProfileToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('photo') as File
        
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ 
                error: 'Invalid file type. Please upload JPG, PNG, or GIF.' 
            }, { status: 400 })
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ 
                error: 'File size must be less than 5MB' 
            }, { status: 400 })
        }

        // Get current user data to check for existing photo
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { image: true }
        })

        // Delete old photo from Cloudinary if exists
        if (currentUser?.image && currentUser.image.includes('cloudinary.com')) {
            try {
                // Extract public_id from Cloudinary URL
                const publicIdMatch = currentUser.image.match(/\/([^\/]+)\/([^\/]+)\/([^\.]+)/)
                if (publicIdMatch) {
                    const publicId = `${publicIdMatch[1]}/${publicIdMatch[2]}/${publicIdMatch[3]}`
                    await deleteFromCloudinary(publicId)
                }
            } catch (error) {
                console.error('Error deleting old photo:', error)
                // Continue with upload even if deletion fails
            }
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Upload to Cloudinary
        const uploadResult = await uploadProfileToCloudinary(buffer, session.user.id)

        // Update user's image in database
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: { image: uploadResult.secure_url }
        })

        return NextResponse.json({ 
            success: true, 
            imageUrl: uploadResult.secure_url,
            message: 'Profile photo updated successfully' 
        })

    } catch (error) {
        console.error('Error uploading profile photo:', error)
        return NextResponse.json({ 
            error: 'Failed to upload photo' 
        }, { status: 500 })
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { image: true, name: true, email: true }
        })

        return NextResponse.json({ user })

    } catch (error) {
        console.error('Error fetching user profile:', error)
        return NextResponse.json({ 
            error: 'Failed to fetch profile' 
        }, { status: 500 })
    }
}
