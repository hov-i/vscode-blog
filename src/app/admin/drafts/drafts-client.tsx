"use client"

import { useState, useTransition } from 'react'
import { DraftPost } from './page'
import { publishDraft, deleteDraft, regenerateDraft } from './actions'

export default function DraftsClient({ drafts }: { drafts: DraftPost[] }) {
  const [selected, setSelected] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

  if (drafts.length === 0) {
    return (
      <div className="text-center py-20 text-[var(--text-secondary)] text-sm">
        아직 초안이 없어~ 파이프라인 돌리면 여기 나타날 거야!
      </div>
    )
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-200px)]">
      {/* 목록 */}
      <div className="w-64 flex-shrink-0 overflow-y-auto border-r border-[var(--border-color)] pr-4 space-y-2">
        {drafts.map((draft) => (
          <button
            key={draft.id}
            onClick={() => setSelected(draft.id)}
            className={`w-full text-left p-3 rounded border text-xs transition-colors ${
              selected === draft.id
                ? 'border-[var(--accent)] bg-[var(--bg-secondary)]'
                : 'border-[var(--border-color)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            <p className="font-medium text-[var(--text-primary)] truncate">{draft.title}</p>
            <p className="text-[var(--text-secondary)] mt-1 truncate">{draft.source_project}</p>
            <p className="text-[var(--text-secondary)] mt-1">
              {new Date(draft.created_at).toLocaleDateString('ko-KR')}
            </p>
          </button>
        ))}
      </div>

      {/* 상세 */}
      <div className="flex-1 overflow-y-auto">
        {selected === null ? (
          <div className="flex items-center justify-center h-full text-[var(--text-secondary)] text-sm">
            왼쪽에서 초안을 선택해줘
          </div>
        ) : (
          <DraftDetail
            key={selected}
            draft={drafts.find((d) => d.id === selected)!}
            isPending={isPending}
            startTransition={startTransition}
            onDeleted={() => setSelected(null)}
          />
        )}
      </div>
    </div>
  )
}

function DraftDetail({
  draft,
  isPending,
  startTransition,
  onDeleted,
}: {
  draft: DraftPost
  isPending: boolean
  startTransition: (fn: () => void) => void
  onDeleted: () => void
}) {
  const [title, setTitle] = useState(draft.title)
  const [description, setDescription] = useState(draft.description ?? '')
  const [tags, setTags] = useState(draft.tags ?? '')
  const [content, setContent] = useState(draft.content)
  const [isRegenerating, setIsRegenerating] = useState(false)

  const handlePublish = () => {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('draftId', String(draft.id))
      formData.append('title', title)
      formData.append('description', description)
      formData.append('tags', tags)
      formData.append('content', content)
      await publishDraft(formData)
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      await deleteDraft(draft.id)
      onDeleted()
    })
  }

  const handleRegenerate = async () => {
    if (!draft.conversation_data) {
      alert('재생성용 대화 데이터가 없어요! 새 파이프라인으로 생성된 초안만 재생성 가능해~')
      return
    }
    setIsRegenerating(true)
    try {
      const result = await regenerateDraft(draft.id)
      setTitle(result.title)
      setDescription(result.description)
      setTags(result.tags)
      setContent(result.content)
    } catch (e) {
      alert(`재생성 실패: ${e instanceof Error ? e.message : '알 수 없는 오류'}`)
    } finally {
      setIsRegenerating(false)
    }
  }

  const isDisabled = isPending || isRegenerating

  return (
    <div className="flex flex-col h-full font-mono text-sm">
      {/* 상단 액션 바 */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--border-color)]">
        <span className="text-xs text-[var(--text-secondary)]">{draft.source_project}</span>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={isDisabled}
            className="px-3 py-1.5 text-xs rounded border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-50"
          >
            삭제
          </button>
          <button
            onClick={handleRegenerate}
            disabled={isDisabled || !draft.conversation_data}
            className="px-3 py-1.5 text-xs rounded border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-50"
          >
            {isRegenerating ? '재생성 중...' : '🔄 재생성'}
          </button>
          <button
            onClick={handlePublish}
            disabled={isDisabled}
            className="px-3 py-1.5 text-xs rounded bg-[var(--accent)] text-white hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? '발행 중...' : '발제하기'}
          </button>
        </div>
      </div>

      {/* 편집 폼 */}
      <div className="space-y-3 flex-1 overflow-y-auto">
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded p-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">Tags</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded p-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded p-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded p-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] resize-none font-mono text-xs"
          />
        </div>
      </div>
    </div>
  )
}
