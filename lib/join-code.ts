// Shared by the join modal (client) and its Server Function.

const JOIN_CODE_PATTERN = /^[A-Za-z0-9-]{1,32}$/;

export function validateJoinCode(joinCode: string): string | undefined {
  if (!joinCode) return "Masukkan kode kelas dari guru kamu.";
  if (!JOIN_CODE_PATTERN.test(joinCode)) return "Kode kelas hanya berisi huruf, angka, atau tanda hubung (maks. 32).";
  return undefined;
}
