"use client";

import { useEffect } from "react";
import { SESSION_EXPIRED_PATH } from "@/lib/auth/session-expiry";

// setTimeout fires immediately for delays above 2^31 - 1 ms (about 24.8 days).
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

// Logs out as soon as the session ends, even on a tab nobody is using, instead of failing on the next click.
export function SessionExpiryWatcher({ expiresAt }: { expiresAt: number }) {
  useEffect(() => {
    // A full page load, so the route can clear the cookie.
    const logOut = () => window.location.assign(SESSION_EXPIRED_PATH);
    let timer: ReturnType<typeof setTimeout>;

    function schedule() {
      clearTimeout(timer);
      const remaining = expiresAt - Date.now();
      if (remaining <= 0) return logOut();
      // Long sessions are checked again later instead of overflowing the timer.
      timer = setTimeout(schedule, Math.min(remaining, MAX_TIMEOUT_MS));
    }

    // Timers pause while a laptop sleeps or a tab is in the background, so check again when it comes back.
    function onVisible() {
      if (document.visibilityState === "visible") schedule();
    }

    schedule();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [expiresAt]);

  return null;
}
