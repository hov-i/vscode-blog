// @ts-nocheck
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { Link, Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  // 1. Create User (Admin)
  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
    },
  })

  // 2. Create Tags
  const tagsData = [
    { name: 'React' },
    { name: 'Next.js' },
    { name: 'TypeScript' },
    { name: 'TailwindCSS' },
    { name: 'Supabase' },
    { name: 'Prisma' },
    { name: 'FSD' },
    { name: 'Design' },
  ]

  console.log('Seeding tags...')
  for (const t of tagsData) {
    await prisma.tag.upsert({
      where: { name: t.name },
      update: {},
      create: t,
    })
  }

  // 3. Create Posts
  const postsData = [
    {
      title: 'Getting Started with Next.js 15',
      description: 'Learn the basics of the new App Router and Server Components.',
      content: 'This is a detailed guide on how to use Next.js 15...',
      published: true,
      tags: { connect: [{ name: 'Next.js' }, { name: 'React' }] },
    },
    {
      title: 'Why I Switched to Supabase',
      description: 'A comparison between Firebase and Supabase for modern web apps.',
      content: 'Supabase offers a great open-source alternative...',
      published: true,
      tags: { connect: [{ name: 'Supabase' }, { name: 'Prisma' }] },
    },
    {
      title: 'Understanding FSD Architecture',
      description: 'Feature-Sliced Design allows for scalable frontend codebases.',
      content: 'FSD divides the app into layers...',
      published: true,
      tags: { connect: [{ name: 'FSD' }] },
    },
    {
      title: 'Mastering TailwindCSS',
      description: 'Tips and tricks for building beautiful UIs faster.',
      content: 'TailwindCSS is a utility-first CSS framework...',
      published: true,
      tags: { connect: [{ name: 'TailwindCSS' }, { name: 'Design' }] },
    },
    {
      title: 'TypeScript Best Practices',
      description: 'How to write clean and type-safe code.',
      content: 'TypeScript adds static typing to JavaScript...',
      published: true,
      tags: { connect: [{ name: 'TypeScript' }] },
    },
    {
      title: 'Building a Blog with VSCode Theme',
      description: 'My journey of creating a unique developer blog.',
      content: 'I wanted a blog that looks like my favorite editor...',
      published: false,
      tags: { connect: [{ name: 'React' }, { name: 'Design' }] },
    },
  ]

  console.log('Seeding posts...')
  for (const p of postsData) {
    await prisma.post.create({
      data: {
        ...p,
        authorId: user.id,
      },
    })
  }

  // 4. Create Projects
  const projectsData = [
    {
      title: 'VSCode Blog',
      description: 'A developer blog that looks like VSCode.',
      repository: 'https://github.com/example/vscode-blog',
      tags: { connect: [{ name: 'Next.js' }, { name: 'React' }, { name: 'TailwindCSS' }] },
    },
    {
      title: 'E-commerce Dashboard',
      description: 'Admin dashboard for an online store.',
      demoUrl: 'https://demo.example.com',
      tags: { connect: [{ name: 'React' }, { name: 'FSD' }] },
    },
    {
      title: 'Task Manager API',
      description: 'Backend API for a task management app.',
      repository: 'https://github.com/example/task-api',
      tags: { connect: [{ name: 'TypeScript' }, { name: 'Supabase' }, { name: 'Prisma' }] },
    },
  ]

  console.log('Seeding projects...')
  for (const pr of projectsData) {
    await prisma.project.create({
      data: pr,
    })
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
