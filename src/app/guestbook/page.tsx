import { Icon } from "@/shared/ui/icon";
import { FormattedDate } from "@/shared/ui/formatted-date";
import { getGuestbooks } from "@/shared/lib/services/guestbook.service";
import { createClient } from "@/shared/lib/supabase/server";
import { GuestbookItem } from "./guestbook-item";
import { GuestbookForm } from "./guestbook-form";

export default async function GuestbookPage() {
    const guestbooks = await getGuestbooks();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const isAdmin = user?.email === 'dbsghdql55555@gmail.com';

    return (
        <div className="max-w-4xl">
            <div className="mb-8">
                <div className="flex items-center mb-4">
                    <span className="text-xs px-2 py-1 rounded mr-2 bg-[var(--accent)] text-white font-medium">
                        JSON
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">guestbook.json</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                        GUESTBOOK
                    </h1>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <Icon name="users" className="w-4 h-4" />
                        <span>{guestbooks.length} messages</span>
                    </div>
                </div>
                <p className="text-sm mb-6 text-[var(--text-secondary)]">
                    방문해주셔서 감사합니다! 자유롭게 메시지를 남겨주세요.
                </p>
            </div>

            {/* 방명록 작성 폼 */}
            <div className="mb-8">
                <GuestbookForm user={user} />
            </div>

            {/* 방명록 목록 */}
            <div className="space-y-3 animate-slide-up stagger-3">
                {guestbooks.length === 0 ? (
                    <div className="p-8 rounded bg-[var(--bg-secondary)] text-center">
                        <Icon name="messageSquare" className="w-12 h-12 mx-auto mb-3 text-[var(--text-secondary)]" />
                        <p className="text-sm text-[var(--text-secondary)]">
                            아직 작성된 방명록이 없습니다.
                        </p>
                    </div>
                ) : (
                    guestbooks.map((guestbook: any) => (
                        <GuestbookItem
                            key={guestbook.id}
                            id={guestbook.id}
                            message={guestbook.message}
                            userName={guestbook.user.name || guestbook.user.email}
                            createdAt={<FormattedDate date={guestbook.createdAt} />}
                            isAdmin={isAdmin}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
