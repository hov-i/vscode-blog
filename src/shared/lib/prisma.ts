import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient
  pool?: Pool
}

const connectionString = `${process.env.DATABASE_URL}`

// Supabase Transaction mode(6543) 기준 풀 설정
const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString,
    max: 5, // 서버리스 인스턴스당 3~5가 적정
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    keepAlive: true, // 콜드 스타트 시 TCP 왕복 절약
  })

const adapter = new PrismaPg(pool)

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

// production에서도 재사용 (람다 워밍 인스턴스에서 커넥션 재생성 방지)
globalForPrisma.prisma = prisma
globalForPrisma.pool = pool
