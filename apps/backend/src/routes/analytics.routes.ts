import { Router } from 'express';
import { prisma } from '../database/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.middleware.js';

export const analyticsRoutes = Router();

analyticsRoutes.use(authenticate);

// Get analytics dashboard data
analyticsRoutes.get('/dashboard', async (req: AuthRequest, res, next) => {
  try {
    const { startDate, endDate, workflowId } = req.query;

    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.startedAt = {};
      if (startDate) dateFilter.startedAt.gte = new Date(startDate as string);
      if (endDate) dateFilter.startedAt.lte = new Date(endDate as string);
    }

    const where = {
      organizationId: req.user!.organizationId || undefined,
      ...(workflowId && { workflowId: workflowId as string }),
      ...dateFilter,
    };

    // Total calls
    const totalCalls = await prisma.call.count({ where });

    // Completed calls
    const completedCalls = await prisma.call.count({
      where: { ...where, status: 'COMPLETED' },
    });

    // Average duration
    const avgDurationResult = await prisma.call.aggregate({
      where: { ...where, duration: { not: null } },
      _avg: { duration: true },
    });

    // Calls by status
    const callsByStatus = await prisma.call.groupBy({
      by: ['status'],
      where,
      _count: { id: true },
    });

    // Calls by workflow
    const callsByWorkflow = await prisma.call.groupBy({
      by: ['workflowId'],
      where,
      _count: { id: true },
    });

    // Recent calls
    const recentCalls = await prisma.call.findMany({
      where,
      take: 10,
      orderBy: { startedAt: 'desc' },
      include: {
        workflow: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({
      summary: {
        totalCalls,
        completedCalls,
        completionRate: totalCalls > 0 ? (completedCalls / totalCalls) * 100 : 0,
        averageDuration: avgDurationResult._avg.duration || 0,
      },
      callsByStatus: callsByStatus.map((item) => ({
        status: item.status,
        count: item._count.id,
      })),
      callsByWorkflow: callsByWorkflow.map((item) => ({
        workflowId: item.workflowId,
        count: item._count.id,
      })),
      recentCalls,
    });
  } catch (error) {
    next(error);
  }
});

// Get call volume over time
analyticsRoutes.get('/volume', async (req: AuthRequest, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    // This would typically use raw SQL for date grouping
    // For now, we'll return a simplified version
    const calls = await prisma.call.findMany({
      where: {
        organizationId: req.user!.organizationId || undefined,
        ...(startDate && { startedAt: { gte: new Date(startDate as string) } }),
        ...(endDate && { startedAt: { lte: new Date(endDate as string) } }),
      },
      select: {
        startedAt: true,
        status: true,
      },
      orderBy: { startedAt: 'asc' },
    });

    // Group by date (simplified - in production, use SQL GROUP BY)
    const volumeData: Record<string, number> = {};
    calls.forEach((call) => {
      const dateKey = call.startedAt.toISOString().split('T')[0];
      volumeData[dateKey] = (volumeData[dateKey] || 0) + 1;
    });

    res.json({
      volume: Object.entries(volumeData).map(([date, count]) => ({
        date,
        count,
      })),
    });
  } catch (error) {
    next(error);
  }
});

