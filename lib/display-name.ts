// The first word of a user's name, for greetings and the navbar: "Mayla Putri Ananda" → "Mayla". A username has no
// spaces, so it is shown whole until the full name is filled in (BR-11).
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}
