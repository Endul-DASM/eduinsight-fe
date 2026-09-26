// Card artwork is a frontend concern, so it is keyed by slug instead of coming from the API.
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

// Subjects the backend adds later still get a stable pattern.
export function getSubjectPattern(slug: string): string {
  if (patterns[slug]) return patterns[slug];

  const hash = [...slug].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return fallbackPatterns[hash % fallbackPatterns.length];
}
