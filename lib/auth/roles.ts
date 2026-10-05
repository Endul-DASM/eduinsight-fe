import type { UserRole } from "@/lib/api/types";

// The two roles that have their own sign-in and sign-up pages (SRS IF-UI-07).
export type AuthRole = "student" | "teacher";

type RoleConfig = {
  // How the backend names this role.
  apiRole: Extract<UserRole, "siswa" | "guru">;
  label: string;
  loginPath: string;
  registerPath: string;
  registerAccountPath: string;
  registerGooglePath: string;
  // Where a signed-in user of this role lands.
  homePath: string;
  // Integer width/height for next/image; className keeps the exact Figma size.
  icon: { src: string; width: number; height: number; className: string };
  iconBackground: string;
};

export const authRoles: Record<AuthRole, RoleConfig> = {
  teacher: {
    apiRole: "guru",
    label: "Guru",
    loginPath: "/login/teacher",
    registerPath: "/register/teacher",
    registerAccountPath: "/register/teacher/account",
    registerGooglePath: "/register/teacher/google",
    homePath: "/choose-subject",
    icon: { src: "/auth/graduation-cap.svg", width: 37, height: 30, className: "h-[30px] w-[36.667px]" },
    iconBackground: "bg-[rgba(216,226,255,0.5)]",
  },
  student: {
    apiRole: "siswa",
    label: "Siswa",
    loginPath: "/login/student",
    registerPath: "/register/student",
    registerAccountPath: "/register/student/account",
    registerGooglePath: "/register/student/google",
    homePath: "/student",
    icon: { src: "/auth/student.svg", width: 27, height: 27, className: "size-[26.667px]" },
    iconBackground: "bg-[rgba(216,226,252,0.5)]",
  },
};

export function isAuthRole(value: unknown): value is AuthRole {
  return value === "student" || value === "teacher";
}

// The sign-in page for an account; null for roles without one, such as admin.
export function authRoleOf(apiRole: UserRole): AuthRole | null {
  if (apiRole === "guru") return "teacher";
  if (apiRole === "siswa") return "student";
  return null;
}
