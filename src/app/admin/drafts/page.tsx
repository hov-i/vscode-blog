import { createClient } from '@/shared/lib/supabase/server'
import { redirect } from 'next/navigation'
import DraftsClient from './drafts-client'

const ADMIN_EMAIL = 'dbsghdql55555@gmail.com'

export interface DraftPost {
  id: number
  title: string
  description: string | null
  content: string
  tags: string | null
  source_project: string | null
  status: string
  created_at: string
  conversation_data: object | null
}

export default async function AdminDraftsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect('/')
  }

  const { data: drafts, error } = await supabase
    .from('draft_posts')
    .select('*')
    .in('status', ['draft', 'pending'])
    .order('created_at', { ascending: false })

  if (error) {
    console.error('draft 불러오기 실패:', error)
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="mb-4 sm:mb-6 border-b border-[var(--border-color)] pb-3 sm:pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">Draft Posts</h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              자동 생성된 초안 목록 — 발제할 글을 선택해줘
            </p>
          </div>
          <a
            href="/admin/topics"
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] underline"
          >
            ← Topics
          </a>
        </div>
      </div>
      <DraftsClient drafts={drafts ?? []} />
    </div>
  )
}
