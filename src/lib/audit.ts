import { prisma } from './prisma'

interface AuditLogData {
  action: string
  entity: string
  entityId?: string
  userId?: string
  oldData?: any
  newData?: any
  ipAddress?: string
  userAgent?: string
}

export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    // If userId is provided, check if user exists first
    if (data.userId) {
      const userExists = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { id: true }
      })
      
      if (!userExists) {
        console.warn(`User ${data.userId} not found, creating audit log without userId`)
        data.userId = undefined
      }
    }

    await prisma.auditLog.create({
      data: {
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        userId: data.userId,
        oldData: data.oldData,
        newData: data.newData,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      }
    })
  } catch (error) {
    console.warn('Failed to create audit log:', error)
    // Don't throw - audit logging should not break the main operation
  }
}
