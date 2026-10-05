import type { ReactNode } from "react";
import { SessionExpiryWatcher } from "@/components/auth/session-expiry-watcher";
import { getSessionExpiresAt } from "@/lib/api/session";

// Every signed-in page: logs the user out when the session ends.
export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  // Undefined in mock mode, which has no sessions.
  const expiresAt = await getSessionExpiresAt();

  return (
    <>
      {expiresAt && <SessionExpiryWatcher expiresAt={expiresAt} />}
      {children}
    </>
  );
}
