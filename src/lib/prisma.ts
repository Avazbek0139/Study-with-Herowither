import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

// On Vercel serverless functions, SQLite must live in /tmp to be writable
if (process.env.VERCEL && (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:'))) {
  const tmpDbPath = '/tmp/dev.db'
  process.env.DATABASE_URL = `file:${tmpDbPath}`

  // Copy existing seed/database if available to /tmp
  try {
    const localDbPath = path.join(process.cwd(), 'prisma', 'dev.db')
    if (fs.existsSync(localDbPath) && !fs.existsSync(tmpDbPath)) {
      fs.copyFileSync(localDbPath, tmpDbPath)
    }
  } catch (e) {
    console.warn('Could not copy dev.db to /tmp:', e)
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
