import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get total trucks count
    const totalTrucks = await db.truck.count()

    // Get active trucks count
    const activeTrucks = await db.truck.count({
      where: { status: 'ACTIVE' }
    })

    // Get upcoming maintenance (scheduled and not overdue)
    const today = new Date()
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    
    const upcomingMaintenance = await db.maintenanceRecord.count({
      where: {
        status: 'SCHEDULED',
        datePerformed: {
          gte: today,
          lte: thirtyDaysFromNow
        }
      }
    })

    // Get overdue repairs (scheduled and past due date)
    const overdueRepairs = await db.maintenanceRecord.count({
      where: {
        status: 'SCHEDULED',
        datePerformed: {
          lt: today
        }
      }
    })

    // Get total maintenance cost for last 6 months
    const sixMonthsAgo = new Date(today.getTime() - 6 * 30 * 24 * 60 * 60 * 1000)
    
    const maintenanceCosts = await db.maintenanceRecord.aggregate({
      where: {
        datePerformed: {
          gte: sixMonthsAgo
        }
      },
      _sum: {
        totalCost: true
      }
    })

    const totalMaintenanceCost = maintenanceCosts._sum.totalCost || 0

    // Get recent trucks
    const recentTrucks = await db.truck.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    // Get recent maintenance records
    const recentMaintenance = await db.maintenanceRecord.findMany({
      include: {
        truck: {
          select: {
            id: true,
            vin: true,
            make: true,
            model: true,
            year: true,
            licensePlate: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    return NextResponse.json({
      totalTrucks,
      activeTrucks,
      upcomingMaintenance,
      overdueRepairs,
      totalMaintenanceCost,
      recentTrucks,
      recentMaintenance
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}