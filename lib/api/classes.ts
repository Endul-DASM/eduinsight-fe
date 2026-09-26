import { cache } from "react";
import { apiFetch, isMockMode } from "./client";
import { mockClasses } from "./mocks";
import type { SchoolClass, SchoolLevel } from "./types";

// GET /classes — every class, newest academic year first.
export const getClasses = cache(async (): Promise<SchoolClass[]> => {
  if (isMockMode) return mockClasses;

  return apiFetch<SchoolClass[]>("/classes");
});

export type ClassInput = {
  name: string;
  level: SchoolLevel;
  academicYear: string;
};

// POST /classes
export async function createClass(input: ClassInput): Promise<SchoolClass> {
  return apiFetch<SchoolClass>("/classes", { method: "POST", body: JSON.stringify(input) });
}
