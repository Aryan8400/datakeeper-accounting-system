/** localStorage persistence until Supabase integration */

const KEYS = {
  materials: "dk_materials",
  sales: "dk_sales",
  users: "dk_users",
  session: "dk_session",
  theme: "dk_theme",
};

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  getMaterials: (fallback) => load(KEYS.materials, fallback),
  setMaterials: (data) => save(KEYS.materials, data),
  getSales: (fallback) => load(KEYS.sales, fallback),
  setSales: (data) => save(KEYS.sales, data),
  getUsers: (fallback) => load(KEYS.users, fallback),
  setUsers: (data) => save(KEYS.users, data),
  getSession: () => load(KEYS.session, null),
  setSession: (data) => save(KEYS.session, data),
  clearSession: () => localStorage.removeItem(KEYS.session),
  getTheme: () => load(KEYS.theme, "light"),
  setTheme: (theme) => save(KEYS.theme, theme),
};
