"use server";

import { apiFetch, isMockMode } from "@/lib/api/client";
import { mockSubjects } from "@/lib/api/mocks";
import type { Subject } from "@/lib/api/types";

export async function createSubject(data: { name: string }): Promise<Subject> {
  if (isMockMode) {
    const slug = data.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    const subject: Subject = { id: `mock-${Date.now()}`, slug, name: data.name };
    mockSubjects.push(subject);
    return subject;
  }

  return apiFetch<Subject>("/subjects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
