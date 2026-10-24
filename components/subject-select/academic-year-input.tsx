"use client";

import { type ChangeEvent, type KeyboardEvent, useLayoutEffect, useRef, useState } from "react";
import { TextField } from "@/components/auth/text-field";

const YEAR_DIGITS = 4;
const MAX_DIGITS = YEAR_DIGITS * 2;

const digitsOf = (text: string) => text.replace(/\D/g, "").slice(0, MAX_DIGITS);

// "2026" stays as is; from the fourth digit on the slash is shown, so "20262027" reads "2026/2027".
export function formatAcademicYear(digits: string): string {
  return digits.length >= YEAR_DIGITS ? `${digits.slice(0, YEAR_DIGITS)}/${digits.slice(YEAR_DIGITS)}` : digits;
}

// Where the caret goes after `count` digits: past the slash once the first year is complete.
const caretAfter = (count: number) => (count >= YEAR_DIGITS ? count + 1 : count);

// Tahun Ajaran: the teacher types only digits and the slash is added (UAT MAPEL-U01). Typing "/" does nothing, and
// Backspace right after the slash removes the digit before it instead of getting stuck on the slash.
export function AcademicYearInput({ defaultValue = "", error }: { defaultValue?: string; error?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [digits, setDigits] = useState(() => digitsOf(defaultValue));
  const caret = useRef<number | null>(null);
  const value = formatAcademicYear(digits);

  // Put the caret back after React writes the reformatted value.
  useLayoutEffect(() => {
    if (caret.current === null || !inputRef.current) return;
    inputRef.current.setSelectionRange(caret.current, caret.current);
    caret.current = null;
  }, [digits]);

  function update(next: string, caretAt: number) {
    caret.current = caretAt;
    setDigits(next);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    // Typing, pasting or a mobile keyboard: keep the digits and the caret's place among them.
    const raw = event.target.value;
    const next = digitsOf(raw);
    const before = digitsOf(raw.slice(0, event.target.selectionStart ?? raw.length)).length;
    update(next, caretAfter(Math.min(before, next.length)));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const input = event.currentTarget;
    const start = input.selectionStart ?? value.length;
    const collapsed = start === (input.selectionEnd ?? start);

    if (event.key.length === 1) {
      // Letters, "/" and other symbols are ignored, so the caret does not move; so is a digit past the eighth.
      if (!/\d/.test(event.key) || (collapsed && digits.length >= MAX_DIGITS)) event.preventDefault();
      return;
    }
    if (event.key === "Backspace" && collapsed && value[start - 1] === "/") {
      event.preventDefault();
      update(digits.slice(0, YEAR_DIGITS - 1) + digits.slice(YEAR_DIGITS), YEAR_DIGITS - 1);
    } else if (event.key === "Delete" && collapsed && value[start] === "/") {
      event.preventDefault();
      update(digits.slice(0, YEAR_DIGITS) + digits.slice(YEAR_DIGITS + 1), YEAR_DIGITS);
    }
  }

  return (
    <TextField
      autoComplete="off"
      error={error}
      inputMode="numeric"
      label="Tahun Ajaran"
      // No maxLength: it would cut pasted text such as "2026 / 2027" before the spaces are dropped. digitsOf caps it.
      name="academicYear"
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder="2026/2027"
      ref={inputRef}
      value={value}
    />
  );
}
