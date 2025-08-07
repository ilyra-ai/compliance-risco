export type Role = 'admin' | 'user';

export type AuthUser = {
  username: string;
  role: Role;
  token: string;
};

const STORAGE_KEY = 'auth';

export const auth = {
  save(user: AuthUser) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  },
  get(): AuthUser | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  },
  clear() {
    localStorage.removeItem(STORAGE_KEY);
  },
  isAuthenticated(): boolean {
    return !!auth.get()?.token;
  },
  hasRole(role: Role): boolean {
    const u = auth.get();
    return !!u && u.role === role;
  }
};
