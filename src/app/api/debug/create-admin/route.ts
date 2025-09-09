import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // Force create admin user for debugging
    const adminPassword = await bcrypt.hash('password', 12)

    const admin = await prisma.user.upsert({
      where: { email: 'admin@sekolahaman.com' },
      update: {},
      create: {
        email: 'admin@sekolahaman.com',
        name: 'Administrator',
        role: 'ADMIN',
        password: adminPassword,
        isActive: true,
      },
    })

    return NextResponse.json({
      message: 'Admin user created successfully',
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    })

  } catch (error) {
    console.error('Error creating admin:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
