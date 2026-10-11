"use client";

import { useSyncExternalStore } from "react";

// "Tampilkan Ringkasan (Ya/Tidak)" in Spesifikasi Soal decides whether Review shows the kisi-kisi summary
// (FR-G-044). The backend has no field for it, so it stays in this browser, per assessment. A new assessment has no
// id until it is saved, so its choice waits under "pending" until Review of that assessment reads it.

const PREFIX = "eduinsight:assessment-summary:";
const PENDING = `${PREFIX}pending`;
const EVENT = "eduinsight:assessment-summary";

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Private windows and blocked storage: the summary just shows, which is the default.
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function saveSummaryPreference(assessmentId: string | null, show: boolean) {
  write(assessmentId ? `${PREFIX}${assessmentId}` : PENDING, show ? "ya" : "tidak");
}

// True unless the teacher chose "Tidak". Server rendering shows it, like the default.
export function useSummaryPreference(assessmentId: string | null): boolean {
  const value = useSyncExternalStore(
    subscribe,
    () => (assessmentId ? read(`${PREFIX}${assessmentId}`) : null) ?? read(PENDING),
    () => null,
  );
  return value !== "tidak";
}

// Moves the choice made before the draft existed onto the draft.
export function claimPendingSummaryPreference(assessmentId: string) {
  const pending = read(PENDING);
  if (pending === null) return;
  if (read(`${PREFIX}${assessmentId}`) === null) write(`${PREFIX}${assessmentId}`, pending);
  write(PENDING, null);
}
