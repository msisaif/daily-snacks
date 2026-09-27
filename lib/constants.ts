export const CATEGORIES = ["healthy", "unhealthy"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  healthy: "হেলদি",
  unhealthy: "আনহেলদি",
};

export const ROLES = ["member", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  member: "সদস্য",
  admin: "অ্যাডমিন",
};
