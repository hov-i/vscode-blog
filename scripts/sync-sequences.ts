import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const tables = ['User', 'Post', 'Project', 'Comment', 'Tag', 'Guestbook', 'ProjectStar'];

  console.log('🔄 Starting sequence synchronization...');

  for (const table of tables) {
    try {
      // PostgreSQL query to reset the sequence to the max id + 1
      const query = `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), coalesce(max(id), 0) + 1, false) FROM "${table}";`;
      
      await prisma.$executeRawUnsafe(query);
      console.log(`✅ Reset sequence for ${table}`);
    } catch (error) {
      console.error(`❌ Error resetting sequence for ${table}:`, error);
    }
  }

  console.log('✨ Sequence synchronization completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
