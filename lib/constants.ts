export const CATEGORIES = ["healthy", "unhealthy"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  healthy: "ফ্রেশ এবং নিউট্রিশন",
  unhealthy: "ক্রিসপি এন্ড স্ন্যাকস",
};

// যেখানে জায়গা কম (টেবিলের মাথা, এক লাইনের হিসাব)
export const CATEGORY_SHORT_LABELS: Record<Category, string> = {
  healthy: "ফ্রেশ",
  unhealthy: "ক্রিসপি",
};

export const CATEGORY_OPTIONS = CATEGORIES.map((value) => ({
  value,
  label: CATEGORY_LABELS[value],
}));

export const ROLES = ["member", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  member: "সদস্য",
  admin: "অ্যাডমিন",
};

export const MENU_STATUSES = ["draft", "open", "closed", "delivered"] as const;
export type MenuStatus = (typeof MENU_STATUSES)[number];

export const MENU_STATUS_LABELS: Record<MenuStatus, string> = {
  draft: "খসড়া",
  open: "খোলা",
  closed: "বন্ধ",
  delivered: "ডেলিভারি হয়েছে",
};

export const ROLE_OPTIONS =ROLES.map((value) => ({
  value,
  label: ROLE_LABELS[value],
}));
