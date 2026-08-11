import 'dotenv/config'
import { defineConfig } from '@prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // 마이그레이션/introspect는 pgbouncer를 우회한 직접 연결(5432)을 써야 함
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
})
