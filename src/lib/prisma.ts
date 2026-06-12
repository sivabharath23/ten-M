import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const dbUrl = process.env.DATABASE_URL || ''
const schemaMatch = dbUrl.match(/[?&]schema=([^&]+)/)
const schemaName = schemaMatch ? schemaMatch[1] : 'public'

function createPrismaClient() {
  const pool = new Pool({ 
    connectionString: dbUrl,
    options: `-c search_path=${schemaName}`
  })
  const adapter = new PrismaPg(pool, { schema: schemaName })
  return new PrismaClient({ adapter })
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = createPrismaClient()
} else {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
  }
  prisma = globalForPrisma.prisma
}

export { prisma }
