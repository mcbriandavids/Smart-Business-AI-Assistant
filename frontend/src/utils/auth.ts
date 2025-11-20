export function getToken(): string | null {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function getUser(): any {
  try {
    const rawUser = localStorage.getItem("user");
    if (rawUser) return JSON.parse(rawUser);
  } catch {
    // ignore malformed user cache
  }
  const token = getToken();
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function login(token: string, user?: any) {
  localStorage.setItem("token", token);
  if (user) {
    try {
      localStorage.setItem("user", JSON.stringify(user));
    } catch {
      // ignore storage issues; token still stored
    }
  }
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  // Soft reload to clear statefully cached data
  window.location.href = "/";
}
