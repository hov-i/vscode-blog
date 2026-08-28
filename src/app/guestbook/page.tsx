import { getGuestbooks } from "@/shared/lib/services/guestbook.service";
import { GuestbookDashboard, type GuestbookEntry } from "@/widgets/guestbook/guestbook-dashboard";

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
