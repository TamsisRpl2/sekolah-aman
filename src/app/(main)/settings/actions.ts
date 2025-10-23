'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function changePassword(data: {
    currentPassword: string
    newPassword: string
}) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            throw new Error('Unauthorized')
        }

        if (!data.currentPassword || !data.newPassword) {
            throw new Error('Password saat ini dan password baru harus diisi')
        }

        if (data.newPassword.length < 8) {
            throw new Error('Password baru minimal 8 karakter')
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true, password: true, email: true }
        })

        if (!user) {
            throw new Error('User tidak ditemukan')
        }

        const isPasswordValid = await bcrypt.compare(
            data.currentPassword,
            user.password
        )

        if (!isPasswordValid) {
            throw new Error('Password saat ini salah')
        }

        const hashedNewPassword = await bcrypt.hash(data.newPassword, 12)

        await prisma.user.update({
            where: { id: session.user.id },
            data: { password: hashedNewPassword }
        })

        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: 'CHANGE_PASSWORD',
                entity: 'User',
                entityId: session.user.id,
                newData: {
                    email: user.email,
                    timestamp: new Date()
                }
            }
        })

        revalidatePath('/settings')
        return { success: true, message: 'Password berhasil diubah' }
    } catch (error) {
        console.error('Error changing password:', error)
        throw new Error(error instanceof Error ? error.message : 'Gagal mengubah password')
    }
}

export async function getSystemConfigs() {
    try {
        const configs = await prisma.config.findMany({
            orderBy: { key: 'asc' }
        })

const configObj = configs.reduce((acc: any, config) => {
            acc[config.key] = {
                value: config.value,
                description: config.description,
                updatedAt: config.updatedAt
            }
            return acc
        }, {})

        return configObj
    } catch (error) {
        console.error('Error fetching system configs:', error)
        throw new Error('Gagal mengambil konfigurasi sistem')
    }
}

export async function updateSystemConfig(key: string, value: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            throw new Error('Unauthorized')
        }

        if (session.user.role !== 'ADMIN') {
            throw new Error('Hanya admin yang dapat mengubah konfigurasi sistem')
        }

        await prisma.config.upsert({
            where: { key },
            update: { value },
            create: {
                key,
                value,
                description: `Konfigurasi ${key}`
            }
        })

        revalidatePath('/settings')
        return { success: true }
    } catch (error) {
        console.error('Error updating system config:', error)
        throw new Error(error instanceof Error ? error.message : 'Gagal mengupdate konfigurasi')
    }
}

export async function getAuditLogs(params?: {
    page?: number
    limit?: number
    action?: string
    entity?: string
    userId?: string
    startDate?: string
    endDate?: string
}) {
    try {
        const page = params?.page || 1
        const limit = params?.limit || 20
        const skip = (page - 1) * limit

        const where: any = {}

        if (params?.action) {
            where.action = { contains: params.action, mode: 'insensitive' }
        }

        if (params?.entity) {
            where.entity = { contains: params.entity, mode: 'insensitive' }
        }

        if (params?.userId) {
            where.userId = params.userId
        }

        if (params?.startDate || params?.endDate) {
            where.timestamp = {}
            if (params.startDate) {
                where.timestamp.gte = new Date(params.startDate)
            }
            if (params.endDate) {
                where.timestamp.lte = new Date(params.endDate)
            }
        }

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { timestamp: 'desc' },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            role: true
                        }
                    }
                }
            }),
            prisma.auditLog.count({ where })
        ])

        return {
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        }
    } catch (error) {
        console.error('Error fetching audit logs:', error)
        throw new Error('Gagal mengambil log audit')
    }
}

export async function getSystemStats() {
    try {
        const [
            totalUsers,
            totalStudents,
            totalCases,
            totalViolations,
            totalSanctions,
            recentLogins,
            systemHealth
        ] = await Promise.all([
            prisma.user.count({ where: { isActive: true } }),
            prisma.student.count({ where: { isActive: true } }),
            prisma.violationCase.count(),
            prisma.violation.count(),
            prisma.sanctionType.count(),
            prisma.auditLog.count({
                where: {
                    action: 'LOGIN',
                    timestamp: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) 
                    }
                }
            }),
            
            prisma.user.findFirst().then(() => ({ database: 'healthy' })).catch(() => ({ database: 'error' }))
        ])

        return {
            counts: {
                totalUsers,
                totalStudents,
                totalCases,
                totalViolations,
                totalSanctions
            },
            activity: {
                recentLogins
            },
            system: systemHealth
        }
    } catch (error) {
        console.error('Error fetching system stats:', error)
        throw new Error('Gagal mengambil statistik sistem')
    }
}

export async function logAuditAction(data: {
    action: string
    entity: string
    entityId?: string
    oldData?: any
    newData?: any
    ipAddress?: string
    userAgent?: string
}) {
    try {
        const session = await getServerSession(authOptions)
        
        await prisma.auditLog.create({
            data: {
                userId: session?.user?.id || null,
                action: data.action,
                entity: data.entity,
                entityId: data.entityId,
                oldData: data.oldData ? JSON.parse(JSON.stringify(data.oldData)) : null,
                newData: data.newData ? JSON.parse(JSON.stringify(data.newData)) : null,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent
            }
        })

        return { success: true }
    } catch (error) {
        console.error('Error logging audit action:', error)
        
        return { success: false }
    }
}

export async function clearOldAuditLogs(daysToKeep: number = 90) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            throw new Error('Unauthorized')
        }

        if (session.user.role !== 'ADMIN') {
            throw new Error('Hanya admin yang dapat menghapus log audit')
        }

        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

        const result = await prisma.auditLog.deleteMany({
            where: {
                timestamp: {
                    lt: cutoffDate
                }
            }
        })

await logAuditAction({
            action: 'CLEANUP',
            entity: 'AuditLog',
            newData: { deletedCount: result.count, cutoffDate }
        })

        revalidatePath('/settings')
        return { success: true, deletedCount: result.count }
    } catch (error) {
        console.error('Error clearing old audit logs:', error)
        throw new Error(error instanceof Error ? error.message : 'Gagal menghapus log audit lama')
    }
}

export async function backupDatabase() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            throw new Error('Unauthorized')
        }

        if (session.user.role !== 'ADMIN') {
            throw new Error('Hanya admin yang dapat melakukan backup database')
        }

await logAuditAction({
            action: 'BACKUP',
            entity: 'Database',
            newData: { timestamp: new Date() }
        })

        revalidatePath('/settings')
        return { success: true, message: 'Backup database telah dijadwalkan' }
    } catch (error) {
        console.error('Error backing up database:', error)
        throw new Error(error instanceof Error ? error.message : 'Gagal melakukan backup database')
    }
}

export async function getActiveUsers() {
    try {
        const activeUsers = await prisma.user.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { name: 'asc' }
        })

        return activeUsers
    } catch (error) {
        console.error('Error fetching active users:', error)
        throw new Error('Gagal mengambil data pengguna aktif')
    }
}
