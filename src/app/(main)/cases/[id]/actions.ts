'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export async function getCase(caseId: string) {
    try {
        const violationCase = await prisma.violationCase.findUnique({
            where: { id: caseId },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        nis: true,
                        major: true,
                        academicYear: true,
                        photo: true
                    }
                },
                violation: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        category: {
                            select: {
                                name: true,
                                level: true
                            }
                        }
                    }
                },
                inputBy: {
                    select: {
                        name: true
                    }
                },
                actions: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        actionBy: {
                            select: {
                                name: true
                            }
                        },
                        sanctionType: {
                            select: {
                                name: true,
                                level: true
                            }
                        }
                    }
                },
                sanctions: {
                    include: {
                        sanctionType: {
                            select: {
                                name: true,
                                level: true,
                                duration: true
                            }
                        },
                        givenBy: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        })

        if (!violationCase) {
            throw new Error('Kasus tidak ditemukan')
        }

        return violationCase
    } catch (error) {
        console.error('Error fetching case:', error)
        throw new Error('Gagal mengambil data kasus')
    }
}

export async function updateCase(caseId: string, data: {
    studentId?: string
    violationId?: string
    violationDate?: string
    classLevel?: string
    description?: string
    location?: string
    witnesses?: string
    evidenceUrls?: string[]
    status?: string
    notes?: string
}) {
    try {
        const updateData: any = {}

        if (data.studentId) updateData.studentId = data.studentId
        if (data.violationId) updateData.violationId = data.violationId
        if (data.violationDate) updateData.violationDate = new Date(data.violationDate)
        if (data.classLevel) updateData.classLevel = data.classLevel
        if (data.description) updateData.description = data.description
        if (data.location !== undefined) updateData.location = data.location
        if (data.witnesses !== undefined) updateData.witnesses = data.witnesses
        if (data.evidenceUrls) updateData.evidenceUrls = data.evidenceUrls
        if (data.status) updateData.status = data.status
        if (data.notes !== undefined) updateData.notes = data.notes

        await prisma.violationCase.update({
            where: { id: caseId },
            data: updateData
        })

        revalidatePath('/cases')
        revalidatePath(`/cases/${caseId}`)
        return { success: true }
    } catch (error) {
        console.error('Error updating case:', error)
        throw new Error('Gagal mengupdate kasus')
    }
}

export async function deleteCaseById(caseId: string) {
    try {
        await prisma.caseAction.deleteMany({
            where: { caseId }
        })

        await prisma.sanction.deleteMany({
            where: { caseId }
        })

        await prisma.violationCase.delete({
            where: { id: caseId }
        })

        revalidatePath('/cases')
        return { success: true }
    } catch (error) {
        console.error('Error deleting case:', error)
        throw new Error('Gagal menghapus kasus')
    }
}

export async function deleteCaseAndRedirect(caseId: string) {
    await deleteCaseById(caseId)
    redirect('/cases')
}
