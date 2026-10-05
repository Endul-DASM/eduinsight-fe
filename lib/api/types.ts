// Shapes the backend is expected to return. Keep these in sync with the API contract.

export type UserRole = "guru" | "siswa" | "admin";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  initials: string;
};

export type TeacherSummary = {
  id: string;
  name: string;
  email: string;
};

// The backend accepts only SMP and SMA for now; SD is sent so grades 1–6 work once it does.
export type SchoolLevel = "SD" | "SMP" | "SMA";

export type SchoolClass = {
  id: string;
  name: string;
  level: SchoolLevel;
  academicYear: string;
};

// One subject taught in one class, e.g. Matematika for X IPA 1: the teacher's workspace.
export type Subject = {
  id: string;
  slug: string;
  name: string;
  kkmDefault: number;
  class: SchoolClass;
  teachers: TeacherSummary[];
  // Code students use to join the subject. Not provided by the backend yet.
  joinCode?: string | null;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: string;
  user: CurrentUser;
};
