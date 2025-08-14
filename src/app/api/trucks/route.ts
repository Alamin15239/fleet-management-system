import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { logEntityChange } from '@/lib/audit-logging'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')

    let whereClause = {}
    
    if (search) {
      whereClause = {
        OR: [
          { vin: { contains: search, mode: 'insensitive' } },
          { make: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } },
          { licensePlate: { contains: search, mode: 'insensitive' } }
        ]
      }
    }
    
    if (status && status !== 'all') {
      whereClause = {
        ...whereClause,
        status: status
      }
    }

    const trucks = await db.truck.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(trucks)
  } catch (error) {
    console.error('Error fetching trucks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trucks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request)
    
    const body = await request.json()
    const { vin, make, model, year, licensePlate, currentMileage, status } = body

    // Check if truck with VIN already exists
    const existingTruck = await db.truck.findUnique({
      where: { vin }
    })

    if (existingTruck) {
      return NextResponse.json(
        { error: 'Truck with this VIN already exists' },
        { status: 400 }
      )
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

    const truck = await db.truck.create({
      data: truckData
    })

    // Log the creation
    await logEntityChange(
      'CREATE',
      'TRUCK',
      truck.id,
      user.userId,
      null,
      truckData,
      request
    )

    return NextResponse.json(truck, { status: 201 })
  } catch (error) {
    console.error('Error creating truck:', error)
    return NextResponse.json(
      { error: 'Failed to create truck' },
      { status: 500 }
    )
  }
}