import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    throw new Error("DATABASE_URL is not configured.")
  }

  const schemaMatch = dbUrl.match(/[?&]schema=([^&]+)/)
  const schemaName = schemaMatch ? schemaMatch[1] : 'public'

  const pool = new Pool({ 
    connectionString: dbUrl,
    options: `-c search_path=${schemaName}`
  })
  const adapter = new PrismaPg(pool, { schema: schemaName })
  return new PrismaClient({ adapter })
}

// Recursive dummy proxy to prevent crashes on chained property accesses during build time
const createDummyProxy = (): any => {
  return new Proxy(() => {}, {
    get(_target, prop) {
      if (prop === 'then') return undefined
      return createDummyProxy()
    },
    apply() {
      throw new Error("PrismaClient attempted to query the database, but DATABASE_URL is not configured.")
    }
  })
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!process.env.DATABASE_URL) {
      const dummy = createDummyProxy()
      return dummy[prop]
    }
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient()
    }
    const value = Reflect.get(globalForPrisma.prisma, prop)
    if (typeof value === 'function') {
      return value.bind(globalForPrisma.prisma)
    }
    return value
  }
})


