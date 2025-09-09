import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search')
        const isActive = searchParams.get('isActive')

        const where: any = {}

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ]
        }

        if (isActive !== null) {
            where.isActive = isActive === 'true'
        }

        const sanctionTypes = await prisma.sanctionType.findMany({
            where,
            orderBy: { name: 'asc' }
        })

        return NextResponse.json({ sanctionTypes })
    } catch (error) {
        console.error('Error fetching sanction types:', error)
        return NextResponse.json(
            { error: 'Gagal mengambil data jenis sanksi' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, description, isActive = true } = body

        if (!name) {
            return NextResponse.json(
                { error: 'Nama sanksi wajib diisi' },
                { status: 400 }
            )
        }

        // Check if sanction type already exists
        const existingSanctionType = await prisma.sanctionType.findFirst({
            where: { name }
        })

        if (existingSanctionType) {
            return NextResponse.json(
                { error: 'Jenis sanksi dengan nama tersebut sudah ada' },
                { status: 400 }
            )
        }

        const sanctionType = await prisma.sanctionType.create({
            data: {
                name,
                description,
                isActive
            }
        })

        return NextResponse.json({ sanctionType }, { status: 201 })
    } catch (error) {
        console.error('Error creating sanction type:', error)
        return NextResponse.json(
            { error: 'Gagal membuat jenis sanksi' },
            { status: 500 }
        )
    }
}
