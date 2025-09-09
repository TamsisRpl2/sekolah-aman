import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const sanctionType = await prisma.sanctionType.findUnique({
            where: { id: params.id }
        })

        if (!sanctionType) {
            return NextResponse.json(
                { error: 'Jenis sanksi tidak ditemukan' },
                { status: 404 }
            )
        }

        return NextResponse.json({ sanctionType })
    } catch (error) {
        console.error('Error fetching sanction type:', error)
        return NextResponse.json(
            { error: 'Gagal mengambil data jenis sanksi' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()
        const { name, description, isActive } = body

        if (!name) {
            return NextResponse.json(
                { error: 'Nama sanksi wajib diisi' },
                { status: 400 }
            )
        }

        // Check if another sanction type with the same name exists
        const existingSanctionType = await prisma.sanctionType.findFirst({
            where: {
                name,
                NOT: { id: params.id }
            }
        })

        if (existingSanctionType) {
            return NextResponse.json(
                { error: 'Jenis sanksi dengan nama tersebut sudah ada' },
                { status: 400 }
            )
        }

        const sanctionType = await prisma.sanctionType.update({
            where: { id: params.id },
            data: {
                name,
                description,
                isActive
            }
        })

        return NextResponse.json({ sanctionType })
    } catch (error) {
        console.error('Error updating sanction type:', error)
        return NextResponse.json(
            { error: 'Gagal mengupdate jenis sanksi' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Check if sanction type is being used in any violations
        const violationCount = await prisma.violationSanctionType.count({
            where: { sanctionTypeId: params.id }
        })

        if (violationCount > 0) {
            return NextResponse.json(
                {
                    error: `Tidak dapat menghapus jenis sanksi karena sedang digunakan dalam ${violationCount} pelanggaran`,
                    type: 'in_use'
                },
                { status: 400 }
            )
        }

        await prisma.sanctionType.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ message: 'Jenis sanksi berhasil dihapus' })
    } catch (error) {
        console.error('Error deleting sanction type:', error)
        return NextResponse.json(
            { error: 'Gagal menghapus jenis sanksi' },
            { status: 500 }
        )
    }
}
