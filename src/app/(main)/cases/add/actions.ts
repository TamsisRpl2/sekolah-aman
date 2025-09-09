'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function getStudentsForCase() {
    try {
        const students = await prisma.student.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                nis: true,
                major: true
            },
            orderBy: { name: 'asc' }
        })

        return students
    } catch (error) {
        console.error('Error fetching students:', error)
        throw new Error('Gagal mengambil data siswa')
    }
}

export async function getViolationsForCase() {
    try {
        const violations = await prisma.violation.findMany({
            where: { isActive: true },
            include: {
                category: {
                    select: {
                        name: true,
                        level: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        })

        return violations
    } catch (error) {
        console.error('Error fetching violations:', error)
        throw new Error('Gagal mengambil data pelanggaran')
    }
}

export async function createCase(data: {
    studentId: string
    violationId: string
    violationDate: string
    classLevel: string
    description: string
    location?: string
    witnesses?: string
    evidenceUrls?: string[]
}) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            throw new Error('Unauthorized')
        }

const now = new Date()
        const year = now.getFullYear()
        const count = await prisma.violationCase.count({
            where: {
                createdAt: {
                    gte: new Date(year, 0, 1),
                    lt: new Date(year + 1, 0, 1)
                }
            }
        })
        const caseNumber = `VC-${year}-${String(count + 1).padStart(3, '0')}`

        const violationCase = await prisma.violationCase.create({
            data: {
                caseNumber,
                studentId: data.studentId,
                violationId: data.violationId,
                inputById: session.user.id,
                violationDate: new Date(data.violationDate),
                classLevel: data.classLevel,
                description: data.description,
                location: data.location,
                witnesses: data.witnesses,
                evidenceUrls: data.evidenceUrls || [],
                status: 'PENDING'
            }
        })

        revalidatePath('/cases')
        return { success: true, caseId: violationCase.id }
    } catch (error) {
        console.error('Error creating case:', error)
        throw new Error('Gagal membuat kasus pelanggaran')
    }
}

export async function createCaseAndRedirect(data: {
    studentId: string
    violationId: string
    violationDate: string
    classLevel: string
    description: string
    location?: string
    witnesses?: string
    evidenceUrls?: string[]
}) {
    const result = await createCase(data)
    if (result.success) {
        redirect('/cases')
    }
    return result
}
