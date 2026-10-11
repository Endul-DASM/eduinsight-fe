// Forms of address that belong with the name after them: "Bu Mayla" is greeted as "Bu Mayla", not "Bu".
const HONORIFICS = new Set(["bu", "ibu", "pak", "bapak"]);

// The first word of a user's name, for greetings and the navbar: "Mayla Putri Ananda" → "Mayla", "Bu Mayla" →
// "Bu Mayla". A username has no spaces, so it is shown whole until the full name is filled in (BR-11).
export function firstName(name: string): string {
  const words = name.trim().split(/\s+/);
  const [first = "", second] = words;
  if (second && HONORIFICS.has(first.toLowerCase().replace(/\.$/, ""))) return `${first} ${second}`;
  return first;
}
