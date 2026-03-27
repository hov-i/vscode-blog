"use server"

import { prisma } from '@/shared/lib/prisma'
import { createClient } from '@/shared/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const ADMIN_EMAIL = 'dbsghdql55555@gmail.com'

async function ensureAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) throw new Error('Unauthorized')
  return { supabase, user }
}

export async function publishDraft(formData: FormData) {
  const { supabase, user } = await ensureAdmin()

  const draftId = Number(formData.get('draftId'))
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const content = formData.get('content') as string
  const tagsString = formData.get('tags') as string

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

  const prismaUser = await prisma.user.upsert({
    where: { email: user.email! },
    update: {},
    create: {
      email: user.email!,
      name: user.user_metadata?.full_name || user.email!.split('@')[0],
    },
  })

  await prisma.post.create({
    data: {
      title,
      description: description || '',
      content,
      published: true,
      authorId: prismaUser.id,
      tags: { connect: tagsConnect },
    },
  })

  // draft 상태를 published로 업데이트
  await supabase
    .from('draft_posts')
    .update({ status: 'published' })
    .eq('id', draftId)

  revalidatePath('/posts')
  revalidatePath('/')
  redirect('/posts')
}

export async function deleteDraft(draftId: number) {
  const { supabase } = await ensureAdmin()

  await supabase
    .from('draft_posts')
    .delete()
    .eq('id', draftId)

  revalidatePath('/admin/drafts')
}
