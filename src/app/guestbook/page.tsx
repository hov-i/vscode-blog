import { getGuestbooks } from "@/shared/lib/services/guestbook.service";
import { GuestbookDashboard, type GuestbookEntry } from "@/widgets/guestbook/guestbook-dashboard";

// Reads the DB directly on every render — force dynamic so Next never
// attempts to prerender this at build time (Vercel's build machine can't
// reach the DB; only the deployed runtime can).
export const dynamic = "force-dynamic";

export default async function GuestbookPage() {
  const guestbooks = await getGuestbooks();
  const entries: GuestbookEntry[] = guestbooks.map((g) => ({
    id: g.id,
    message: g.message,
    createdAt: g.createdAt,
    userName: g.user.name || g.user.email,
  }));

  return <GuestbookDashboard entries={entries} />;
}
