import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { logEntityChange } from '@/lib/audit-logging'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const truck = await db.truck.findUnique({
      where: { id: params.id },
      include: {
        maintenanceRecords: {
          orderBy: { datePerformed: 'desc' }
        }
      }
    })

    if (!truck) {
      return NextResponse.json(
        { error: 'Truck not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(truck)
  } catch (error) {
    console.error('Error fetching truck:', error)
    return NextResponse.json(
      { error: 'Failed to fetch truck' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { vin, make, model, year, licensePlate, currentMileage, status } = body

    // Check if truck exists
    const existingTruck = await db.truck.findUnique({
      where: { id: params.id }
    })

    if (!existingTruck) {
      return NextResponse.json(
        { error: 'Truck not found' },
        { status: 404 }
      )
    }

    // Check if VIN is being changed and already exists
    if (vin !== existingTruck.vin) {
      const vinExists = await db.truck.findUnique({
        where: { vin }
      })

      if (vinExists) {
        return NextResponse.json(
          { error: 'Truck with this VIN already exists' },
          { status: 400 }
        )
      }
    }

    const truckData = {
      vin,
      make,
      model,
      year: parseInt(year),
      licensePlate,
      currentMileage: parseInt(currentMileage),
      status
    }

    const truck = await db.truck.update({
      where: { id: params.id },
      data: truckData
    })

    // Log the update
    await logEntityChange(
      'UPDATE',
      'TRUCK',
      params.id,
      session.user.id,
      existingTruck,
      truckData,
      request
    )

    return NextResponse.json(truck)
  } catch (error) {
    console.error('Error updating truck:', error)
    return NextResponse.json(
      { error: 'Failed to update truck' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if truck exists
    const existingTruck = await db.truck.findUnique({
      where: { id: params.id }
    })

    if (!existingTruck) {
      return NextResponse.json(
        { error: 'Truck not found' },
        { status: 404 }
      )
    }

    // Delete associated maintenance records first
    await db.maintenanceRecord.deleteMany({
      where: { truckId: params.id }
    })

    // Delete the truck
    await db.truck.delete({
      where: { id: params.id }
    })

    // Log the deletion
    await logEntityChange(
      'DELETE',
      'TRUCK',
      params.id,
      session.user.id,
      existingTruck,
      null,
      request
    )

    return NextResponse.json({ message: 'Truck deleted successfully' })
  } catch (error) {
    console.error('Error deleting truck:', error)
    return NextResponse.json(
      { error: 'Failed to delete truck' },
      { status: 500 }
    )
  }
}