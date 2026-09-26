// Card artwork is a frontend concern, so it is keyed by slug instead of coming from the API.
// Backend slugs end with the class name (matematika-x-ipa-1), so keys match as a prefix.
const patterns: Record<string, string> = {
  matematika: "/subjects/matematika.svg",
  "matematika-lanjut": "/subjects/matematika-lanjut.svg",
  biologi: "/subjects/biologi.svg",
  fisika: "/subjects/fisika.svg",
  kimia: "/subjects/kimia.svg",
  sosiologi: "/subjects/sosiologi.svg",
  geografi: "/subjects/geografi.svg",
  ekonomi: "/subjects/ekonomi.svg",
  "bahasa-indonesia": "/subjects/bahasa-indonesia.svg",
  "bahasa-inggris": "/subjects/bahasa-inggris.svg",
};

const fallbackPatterns = Object.values(patterns);

// Longest first, so matematika-lanjut-x-ipa-1 is not matched by "matematika".
const patternKeys = Object.keys(patterns).sort((a, b) => b.length - a.length);

// Subjects without their own artwork still get a stable pattern.
export function getSubjectPattern(slug: string): string {
  const key = patternKeys.find((candidate) => slug === candidate || slug.startsWith(`${candidate}-`));
  if (key) return patterns[key];

  const hash = [...slug].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return fallbackPatterns[hash % fallbackPatterns.length];
}
