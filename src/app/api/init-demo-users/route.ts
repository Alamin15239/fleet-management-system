import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const defaultAdmin = {
      email: 'alamin.kha.saadfreeh@gmail.com',
      name: 'System Administrator',
      password: 'oOck7534#@',
      role: 'ADMIN'
    }

    // Check if default admin already exists
    const existingAdmin = await db.user.findUnique({
      where: { email: defaultAdmin.email }
    })

    if (existingAdmin) {
      return NextResponse.json({
        message: 'Default admin already exists',
        admin: {
          id: existingAdmin.id,
          email: existingAdmin.email,
          name: existingAdmin.name,
          role: existingAdmin.role,
          isActive: existingAdmin.isActive,
          createdAt: existingAdmin.createdAt
        }
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(defaultAdmin.password, 10)

    // Create default admin
    const newAdmin = await db.user.create({
      data: {
        email: defaultAdmin.email,
        name: defaultAdmin.name,
        password: hashedPassword,
        role: defaultAdmin.role,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      message: 'Default admin created successfully',
      admin: newAdmin
    })
  } catch (error) {
    console.error('Error creating default admin:', error)
    return NextResponse.json(
      { error: 'Failed to create default admin' },
      { status: 500 }
    )
  }
}