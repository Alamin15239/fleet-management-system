import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const defaultAdmin = {
    email: 'alamin.kha.saadfreeh@gmail.com',
    name: 'System Administrator',
    password: 'oOck7534#@',
    role: 'ADMIN'
  }

  // Check if default admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: defaultAdmin.email }
  })

  if (existingAdmin) {
    console.log('Default admin already exists:', existingAdmin.email)
    return
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(defaultAdmin.password, 10)

  // Create default admin
  const newAdmin = await prisma.user.create({
    data: {
      email: defaultAdmin.email,
      name: defaultAdmin.name,
      password: hashedPassword,
      role: defaultAdmin.role,
      isActive: true
    }
  })

  console.log('Default admin created successfully:', newAdmin.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })