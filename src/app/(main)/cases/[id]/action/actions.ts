'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function getCaseForAction(caseId: string) {
    try {
        const violationCase = await prisma.violationCase.findUnique({
            where: { id: caseId },
            include: {
                student: {
                    select: {
                        name: true,
                        nis: true,
                        major: true
                    }
                },
                violation: {
                    select: {
                        id: true,
                        name: true,
                        category: {
                            select: {
                                level: true
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
        console.error('Error fetching case for action:', error)
        throw new Error('Gagal mengambil data kasus')
    }
}

export async function getSanctionTypes() {
    try {
        const sanctionTypes = await prisma.sanctionType.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        })

        return sanctionTypes
    } catch (error) {
        console.error('Error fetching sanction types:', error)
        throw new Error('Gagal mengambil data jenis sanksi')
    }
}

export async function getSanctionTypesForViolation(violationId: string) {
    try {
        const violation = await prisma.violation.findUnique({
            where: { id: violationId },
            include: {
                sanctionTypes: {
                    include: {
                        sanctionType: true
                    }
                }
            }
        })

        if (!violation) {
            throw new Error('Pelanggaran tidak ditemukan')
        }

        return violation.sanctionTypes.map(vs => vs.sanctionType)
    } catch (error) {
        console.error('Error fetching sanction types for violation:', error)
        throw new Error('Gagal mengambil data sanksi untuk pelanggaran')
    }
}

export async function createCaseAction(caseId: string, data: {
    sanctionTypeId: string
    description: string
    followUpDate?: string
    evidenceUrls?: string[]
    notes?: string
    isCompleted?: boolean
}) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            throw new Error('Unauthorized')
        }

        const lastAction = await prisma.caseAction.findFirst({
            where: { 
                caseId,
                deletedAt: null
            },
            orderBy: { createdAt: 'desc' },
            select: { isCompleted: true }
        })

        if (lastAction && lastAction.isCompleted) {
            throw new Error('Tidak dapat menambah tindakan baru. Tindakan terakhir sudah selesai. Silakan edit tindakan terakhir untuk mengubah statusnya.')
        }

        const caseAction = await prisma.caseAction.create({
            data: {
                caseId,
                actionById: session.user.id,
                sanctionTypeId: data.sanctionTypeId,
                actionType: 'SANKSI',
                description: data.description,
                followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
                evidenceUrls: data.evidenceUrls || [],
                notes: data.notes,
                isCompleted: data.isCompleted || false
            }
        })

        const newStatus = data.isCompleted ? 'SELESAI' : 'PROSES'
        await prisma.violationCase.update({
            where: { id: caseId },
            data: { status: newStatus }
        })

        revalidatePath(`/cases/${caseId}`)
        revalidatePath(`/cases/${caseId}/action`)
        return { success: true, actionId: caseAction.id }
    } catch (error) {
        console.error('Error creating case action:', error)
        throw new Error(error instanceof Error ? error.message : 'Gagal membuat tindakan kasus')
    }
}

export async function getCaseAction(actionId: string) {
    try {
        const action = await prisma.caseAction.findUnique({
            where: { id: actionId },
            include: {
                sanctionType: {
                    select: {
                        name: true,
                        level: true,
                        duration: true
                    }
                },
                actionBy: {
                    select: {
                        name: true
                    }
                }
            }
        })

        if (!action) {
            throw new Error('Tindakan tidak ditemukan')
        }

        return action
    } catch (error) {
        console.error('Error fetching case action:', error)
        throw new Error('Gagal mengambil data tindakan')
    }
}

export async function updateCaseAction(actionId: string, data: {
    sanctionTypeId?: string
    description?: string
    followUpDate?: string
    evidenceUrls?: string[]
    notes?: string
    isCompleted?: boolean
}) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            throw new Error('Unauthorized')
        }

        const updateData: any = {
            editedById: session.user.id,
            editedAt: new Date()
        }

        if (data.sanctionTypeId) updateData.sanctionTypeId = data.sanctionTypeId
        if (data.description) updateData.description = data.description
        if (data.followUpDate !== undefined) {
            updateData.followUpDate = data.followUpDate ? new Date(data.followUpDate) : null
        }
        if (data.evidenceUrls) updateData.evidenceUrls = data.evidenceUrls
        if (data.notes !== undefined) updateData.notes = data.notes
        if (data.isCompleted !== undefined) updateData.isCompleted = data.isCompleted

        await prisma.caseAction.update({
            where: { id: actionId },
            data: updateData
        })

        const action = await prisma.caseAction.findUnique({
            where: { id: actionId },
            select: { caseId: true, isCompleted: true }
        })

        if (action) {
            const lastAction = await prisma.caseAction.findFirst({
                where: { 
                    caseId: action.caseId,
                    deletedAt: null
                },
                orderBy: { createdAt: 'desc' },
                select: { isCompleted: true }
            })

            const newStatus = lastAction?.isCompleted ? 'SELESAI' : 'PROSES'
            await prisma.violationCase.update({
                where: { id: action.caseId },
                data: { status: newStatus }
            })

            revalidatePath(`/cases/${action.caseId}`)
            revalidatePath(`/cases/${action.caseId}/action`)
        }

        return { success: true }
    } catch (error) {
        console.error('Error updating case action:', error)
        throw new Error('Gagal mengupdate tindakan')
    }
}

export async function deleteCaseAction(actionId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            throw new Error('Unauthorized')
        }

        await prisma.caseAction.update({
            where: { id: actionId },
            data: {
                deletedById: session.user.id,
                deletedAt: new Date()
            }
        })

        const action = await prisma.caseAction.findUnique({
            where: { id: actionId },
            select: { caseId: true }
        })

        if (action) {
            revalidatePath(`/cases/${action.caseId}`)
            revalidatePath(`/cases/${action.caseId}/action`)
        }

        return { success: true }
    } catch (error) {
        console.error('Error deleting case action:', error)
        throw new Error('Gagal menghapus tindakan')
    }
}

export async function getCaseActions(caseId: string) {
    try {
        const actions = await prisma.caseAction.findMany({
            where: { 
                caseId,
                deletedAt: null
            },
            orderBy: { createdAt: 'desc' },
            include: {
                actionBy: {
                    select: {
                        name: true
                    }
                },
                sanctionType: {
                    select: {
                        id: true,
                        name: true,
                        level: true
                    }
                },
                editedBy: {
                    select: {
                        name: true
                    }
                }
            }
        })

        return actions
    } catch (error) {
        console.error('Error fetching case actions:', error)
        throw new Error('Gagal mengambil data tindakan kasus')
    }
}

export async function getLastAction(caseId: string) {
    try {
        const lastAction = await prisma.caseAction.findFirst({
            where: { 
                caseId,
                deletedAt: null
            },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                isCompleted: true,
                createdAt: true
            }
        })

        return lastAction
    } catch (error) {
        console.error('Error fetching last action:', error)
        return null
    }
}
