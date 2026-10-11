// Card covers are a frontend concern, so they come from the subject id instead of the API (Figma New Design 22:3475).
const gradients = [
  "linear-gradient(65deg, #9d218c, #0058be)",
  "linear-gradient(65deg, #0058be, #20ccea)",
  "linear-gradient(65deg, #be003c, #20ccea)",
];

// The same subject always gets the same cover.
export function getSubjectGradient(id: string): string {
  const hash = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
}
