"use server";

import { prisma } from '@/shared/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase/server'
import { User } from '@prisma/client'

const ADMIN_EMAIL = 'dbsghdql55555@gmail.com'

async function ensureAdmin(): Promise<User> {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  if (!authUser || authUser.email !== ADMIN_EMAIL) {
    throw new Error('Unauthorized: Admin access required')
  }

  const fullName = authUser.user_metadata?.full_name || authUser.email!.split('@')[0]
  
  return prisma.user.upsert({
    where: { email: authUser.email! },
    update: {
      name: fullName,
    },
    create: {
      email: authUser.email!,
      name: fullName,
    }
  })
}

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
  const user = await ensureAdmin()

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
  await ensureAdmin()

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const content = formData.get('content') as string
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
      content: content || '',
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

export async function updatePost(id: string, formData: FormData) {
  await ensureAdmin()

  const postId = Number(id)
  if (isNaN(postId)) {
    throw new Error('Invalid post id')
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const content = formData.get('content') as string
  const tagsString = formData.get('tags') as string

  if (!title || !content) {
    throw new Error('Title and Content are required')
  }

  const tagNames = tagsString
    ? tagsString.split(',').map((t) => t.trim()).filter(Boolean)
    : []

  const tagsConnect = []
  for (const name of tagNames) {
    const tag = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    })
    tagsConnect.push({ id: tag.id })
  }

  await prisma.post.update({
    where: { id: postId },
    data: {
      title,
      description: description || '',
      content,
      tags: {
        set: [],
        connect: tagsConnect,
      },
    },
  })

  revalidatePath('/posts')
  revalidatePath(`/posts/${postId}`)
  revalidatePath('/')
  redirect(`/posts/${postId}`)
}

export async function updateProject(id: string, formData: FormData) {
  await ensureAdmin()

  const projectId = Number(id)
  if (isNaN(projectId)) {
    throw new Error('Invalid project id')
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const content = formData.get('content') as string
  const repository = formData.get('repository') as string
  const demoUrl = formData.get('demoUrl') as string
  const tagsString = formData.get('tags') as string

  if (!title) {
    throw new Error('Title is required')
  }

  let tagNames: string[] = []
  try {
    if (tagsString.trim().startsWith('[')) {
      tagNames = JSON.parse(tagsString)
    } else {
      tagNames = tagsString.split(',').map((t) => t.trim()).filter(Boolean)
    }
  } catch (e) {
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

  await prisma.project.update({
    where: { id: projectId },
    data: {
      title,
      description: description || '',
      content: content || '',
      repository: repository || '',
      demoUrl: demoUrl || '',
      tags: {
        set: [],
        connect: tagsConnect,
      },
    },
  })

  revalidatePath('/projects')
  revalidatePath(`/projects/${projectId}`)
  revalidatePath('/')
  redirect(`/projects/${projectId}`)
}

export async function deletePost(id: string) {
  await ensureAdmin()

  await prisma.post.delete({
    where: { id: Number(id) },
  })

  revalidatePath('/posts')
  revalidatePath('/')
  redirect('/posts')
}

export async function deleteProject(id: string) {
  await ensureAdmin()

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

export async function createGuestbook(message: string) {
    const user = await getCurrentPrismaUser()
    if (!user) throw new Error('Authentication required')

    if (!message.trim()) {
        throw new Error('Message is required')
    }

    await prisma.guestbook.create({
        data: {
            message: message.trim(),
            userId: user.id
        }
    })

    revalidatePath('/guestbook')
}

export async function deleteGuestbook(id: number) {
    await ensureAdmin()

    await prisma.guestbook.delete({
        where: { id }
    })

    revalidatePath('/guestbook')
}

