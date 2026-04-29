import { createClient } from '@/shared/lib/supabase/server'
import { redirect } from 'next/navigation'
import TopicsClient from './topics-client'

const ADMIN_EMAIL = 'dbsghdql55555@gmail.com'

export interface TopicCluster {
  id: number
  theme: string
  angle: string | null
  quality_score: number
  source_projects: string[] | null
  tech_stack: string[] | null
  insights: { topic: string; summary: string; excerpt: string; sourceProject: string; techStack: string[] }[]
  last_updated_at: string
  created_at: string
}

export default async function AdminTopicsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect('/')
  }

  const { data: clusters, error } = await supabase
    .from('topic_clusters')
    .select('*')
    .eq('is_drafted', false)
    .order('quality_score', { ascending: false })
    .order('last_updated_at', { ascending: false })

  if (error) {
    console.error('topic_clusters 불러오기 실패:', error)
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="mb-4 sm:mb-6 border-b border-[var(--border-color)] pb-3 sm:pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">Topic Clusters</h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              누적된 주제 후보 — 글로 발제하고 싶은 주제를 골라줘
            </p>
          </div>
          <a
            href="/admin/drafts"
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] underline"
          >
            Drafts →
          </a>
        </div>
      </div>
      <TopicsClient clusters={(clusters ?? []) as TopicCluster[]} />
    </div>
  )
}
