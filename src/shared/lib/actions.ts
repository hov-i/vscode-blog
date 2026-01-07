"use server";

import { prisma } from '@/shared/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase/server'

async function getCurrentPrismaUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user || !user.email) return null
  
  const fullName = user.user_metadata?.full_name || user.email.split('@')[0]
  
  return prisma.user.upsert({
    where: { email: user.email },
    update: {
      name: fullName,
    },
    create: {
      email: user.email,
      name: fullName,
    }
  })
}

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const content = formData.get('content') as string
  const tagsString = formData.get('tags') as string

  if (!title || !content) {
    throw new Error('Title and Content are required')
  }

  // Parse tags: split by comma, trim, and filter empty strings
  const tagNames = tagsString
    ? tagsString.split(',').map((t) => t.trim()).filter(Boolean)
    : []

  // Create tags if they don't exist
  const tagsConnect = []
  for (const name of tagNames) {
    const tag = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    })
    tagsConnect.push({ id: tag.id })
  }

  // Create post using current authenticated user
  const user = await getCurrentPrismaUser()

  if (!user) {
    throw new Error('Authentication required to create a post')
  }

  await prisma.post.create({
    data: {
      title,
      description: description || '',
      content,
      published: true,
      authorId: user.id,
      tags: {
        connect: tagsConnect,
      },
    },
  })

  revalidatePath('/posts')
  revalidatePath('/')
  redirect('/posts')
}

export async function createProject(formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const repository = formData.get('repository') as string
  const demoUrl = formData.get('demoUrl') as string
  const tagsString = formData.get('tags') as string
  
  // Parse tags. In the UI this might come as JSON array string or just comma separated
  // We'll support comma separated for simplicity consistent with posts
  let tagNames: string[] = []
  try {
     // Try parsing as JSON array first (from the specialized project UI input)
     if (tagsString.trim().startsWith('[')) {
        tagNames = JSON.parse(tagsString)
     } else {
        tagNames = tagsString.split(',').map((t) => t.trim()).filter(Boolean)
     }
  } catch (e) {
      // Fallback to comma split if JSON parse fails
      tagNames = tagsString.split(',').map((t) => t.trim()).filter(Boolean)
  }

  const tagsConnect = []
  for (const name of tagNames) {
    const tag = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    })
    tagsConnect.push({ id: tag.id })
  }

  await prisma.project.create({
    data: {
      title,
      description: description || '',
      repository: repository || '',
      demoUrl: demoUrl || '',
      tags: {
        connect: tagsConnect,
      },
    },
  })

  revalidatePath('/projects')
  revalidatePath('/')
  redirect('/projects')
}

export async function deletePost(id: string) {
  await prisma.post.delete({
    where: { id: Number(id) },
  })

  revalidatePath('/posts')
  revalidatePath('/')
  redirect('/posts')
}

export async function deleteProject(id: string) {
  await prisma.project.delete({
    where: { id: Number(id) },
  })

  revalidatePath('/projects')
  revalidatePath('/')
  redirect('/projects')
}

export async function toggleProjectStar(projectId: number) {
  const user = await getCurrentPrismaUser()
  if (!user) throw new Error('Authentication required')

  const existingStar = await prisma.projectStar.findUnique({
    where: {
      userId_projectId: {
        userId: user.id,
        projectId: projectId
      }
    }
  })

  if (existingStar) {
    await prisma.projectStar.delete({
      where: { id: existingStar.id }
    })
  } else {
    await prisma.projectStar.create({
      data: {
        userId: user.id,
        projectId: projectId
      }
    })
  }

  revalidatePath(`/projects/${projectId}`)
  revalidatePath('/projects')
  revalidatePath('/')
}

export async function addComment(postId: number, content: string) {
    const user = await getCurrentPrismaUser()
    if (!user) throw new Error('Authentication required')

    if (!content.trim()) return;

    await prisma.comment.create({
        data: {
            content,
            postId,
            userId: user.id
        }
    })

    // Update comment count
    await prisma.post.update({
        where: { id: postId },
        data: {
            commentsCount: {
                increment: 1
            }
        }
    })

    revalidatePath(`/posts/${postId}`)
    revalidatePath('/posts')
}
