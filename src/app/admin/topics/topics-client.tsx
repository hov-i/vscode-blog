"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopicCluster } from './page'
import { generateFromCluster, deleteCluster } from './actions'

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const day = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (day === 0) return '오늘'
  if (day === 1) return '어제'
  if (day < 7) return `${day}일 전`
  if (day < 30) return `${Math.floor(day / 7)}주 전`
  return `${Math.floor(day / 30)}달 전`
}

export default function TopicsClient({ clusters }: { clusters: TopicCluster[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<number | null>(null)
  const [pendingId, setPendingId] = useState<number | null>(null)

  if (clusters.length === 0) {
    return (
      <div className="text-center py-20 text-[var(--text-secondary)] text-sm">
        아직 누적된 주제가 없어~ 매주 월요일 파이프라인이 돌면 여기 쌓일 거야.
      </div>
    )
  }

  const handleGenerate = async (clusterId: number) => {
    if (pendingId !== null) return
    setPendingId(clusterId)
    try {
      const result = await generateFromCluster(clusterId)
      router.push(`/admin/drafts`)
      router.refresh()
      // 성공 후 추가 안내
      console.log('생성된 draft:', result)
    } catch (e) {
      alert(`발제 실패: ${e instanceof Error ? e.message : '알 수 없는 오류'}`)
      setPendingId(null)
    }
  }

  const handleDelete = async (clusterId: number) => {
    if (!confirm('이 주제 클러스터를 삭제할까? (복구 불가)')) return
    if (pendingId !== null) return
    setPendingId(clusterId)
    try {
      await deleteCluster(clusterId)
      router.refresh()
      if (selected === clusterId) setSelected(null)
    } catch (e) {
      alert(`삭제 실패: ${e instanceof Error ? e.message : '알 수 없는 오류'}`)
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-120px)] md:h-[calc(100vh-150px)]">
      {/* 목록 */}
      <div
        className={`${
          selected !== null ? 'hidden md:flex' : 'flex'
        } flex-col w-full md:w-72 flex-shrink-0 overflow-y-auto md:border-r border-[var(--border-color)] md:pr-4 space-y-2`}
      >
        {clusters.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelected(c.id)}
            className={`w-full text-left p-3 rounded border text-xs transition-colors ${
              selected === c.id
                ? 'border-[var(--accent)] bg-[var(--bg-secondary)]'
                : 'border-[var(--border-color)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-[var(--text-primary)] flex-1 break-words">
                {c.theme}
              </p>
              <span className="text-[var(--text-secondary)] flex-shrink-0">
                ⭐{c.quality_score}
              </span>
            </div>
            <p className="text-[var(--text-secondary)] mt-1.5">
              인사이트 {c.insights?.length ?? 0}개 · {formatRelative(c.last_updated_at)}
            </p>
            {c.tech_stack && c.tech_stack.length > 0 && (
              <p className="text-[var(--text-secondary)] mt-1 truncate">
                {c.tech_stack.slice(0, 4).join(', ')}
                {c.tech_stack.length > 4 ? ` +${c.tech_stack.length - 4}` : ''}
              </p>
            )}
          </button>
        ))}
      </div>

      {/* 상세 */}
      <div
        className={`${
          selected === null ? 'hidden md:flex' : 'flex'
        } flex-col flex-1 overflow-y-auto md:overflow-visible`}
      >
        {selected === null ? (
          <div className="flex items-center justify-center h-full text-[var(--text-secondary)] text-sm">
            왼쪽에서 주제를 선택해줘
          </div>
        ) : (
          <ClusterDetail
            cluster={clusters.find((c) => c.id === selected)!}
            isPending={pendingId === selected}
            onBack={() => setSelected(null)}
            onGenerate={() => handleGenerate(selected)}
            onDelete={() => handleDelete(selected)}
          />
        )}
      </div>
    </div>
  )
}

function ClusterDetail({
  cluster,
  isPending,
  onBack,
  onGenerate,
  onDelete,
}: {
  cluster: TopicCluster
  isPending: boolean
  onBack: () => void
  onGenerate: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex flex-col h-full font-mono text-sm">
      {/* 상단 액션 바 */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-4 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            onClick={onBack}
            className="md:hidden px-2 py-1.5 text-xs rounded border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] flex-shrink-0"
            aria-label="목록으로"
          >
            ←
          </button>
          <span className="text-xs text-[var(--text-secondary)] truncate">
            {(cluster.source_projects ?? []).join(', ')}
          </span>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={onDelete}
            disabled={isPending}
            className="px-2 sm:px-3 py-1.5 text-xs rounded border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-50"
          >
            삭제
          </button>
          <button
            onClick={onGenerate}
            disabled={isPending}
            className="px-2 sm:px-3 py-1.5 text-xs rounded bg-[var(--accent)] text-white hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? '발제 중...' : '✍️ 이 주제로 발제'}
          </button>
        </div>
      </div>

      {/* 메타 + 인사이트 목록 */}
      <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto">
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">{cluster.theme}</h2>
          {cluster.angle && (
            <p className="text-xs text-[var(--text-secondary)] mt-1">방향: {cluster.angle}</p>
          )}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {(cluster.tech_stack ?? []).map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 text-xs rounded bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)]"
              >
                {t}
              </span>
            ))}
          </div>
          <div className="text-xs text-[var(--text-secondary)] mt-3 flex gap-3 flex-wrap">
            <span>품질 {cluster.quality_score}/5</span>
            <span>인사이트 {cluster.insights?.length ?? 0}개</span>
            <span>업데이트 {new Date(cluster.last_updated_at).toLocaleDateString('ko-KR')}</span>
          </div>
        </div>

        <div className="border-t border-[var(--border-color)] pt-4">
          <h3 className="text-xs text-[var(--text-secondary)] mb-2">포함된 인사이트</h3>
          <div className="space-y-3">
            {(cluster.insights ?? []).map((ins, i) => (
              <div
                key={i}
                className="p-3 rounded border border-[var(--border-color)] bg-[var(--bg-secondary)]"
              >
                <p className="font-medium text-[var(--text-primary)]">{ins.topic}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">{ins.summary}</p>
                {ins.excerpt && (
                  <blockquote className="text-xs text-[var(--text-secondary)] mt-2 pl-2 border-l-2 border-[var(--border-color)]">
                    {ins.excerpt}
                  </blockquote>
                )}
                <p className="text-xs text-[var(--text-secondary)] mt-2 opacity-70">
                  {ins.sourceProject}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
