// Shapes the backend is expected to return. Keep these in sync with the API contract.

export type Subject = {
  id: string;
  slug: string;
  name: string;
};

export type Teacher = {
  id: string;
  name: string;
  initials: string;
};
