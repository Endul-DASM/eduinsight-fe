const API_BASE_URL = process.env.API_BASE_URL;

// Without API_BASE_URL the app runs on the mock data in lib/api/mocks.
export const isMockMode = !API_BASE_URL;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { Accept: "application/json", ...init?.headers },
  });

  if (!response.ok) {
    throw new ApiError(response.status, `${init?.method ?? "GET"} ${path} failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}
