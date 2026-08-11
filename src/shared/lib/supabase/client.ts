import type { SupabaseClient } from '@supabase/supabase-js'

let clientPromise: Promise<SupabaseClient> | null = null

/**
 * Supabase 브라우저 클라이언트를 지연 로딩한다.
 *
 * @supabase/ssr 번들(~200KB)을 정적으로 import하면 이 모듈을 참조하는
 * 클라이언트 컴포넌트가 모든 페이지의 초기 번들에 SDK를 끌어온다.
 * 동적 import로 분리해 실제로 인증이 필요한 시점(마운트 후 세션 확인,
 * 로그인 버튼 클릭)에만 받아오게 한다.
 *
 * 여러 번 호출해도 같은 인스턴스를 재사용한다.
 */
export function getClient(): Promise<SupabaseClient> {
  if (!clientPromise) {
    clientPromise = import('@supabase/ssr').then(({ createBrowserClient }) =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
    )
  }
  return clientPromise
}
