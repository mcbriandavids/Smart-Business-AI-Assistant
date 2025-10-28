// Decode JWT payload (naive, no validation)
export function getUser(): any {
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

export function login(token: string) {
  localStorage.setItem("token", token);
}

export function logout() {
  localStorage.removeItem("token");
  // Soft reload to clear statefully cached data
  window.location.href = "/";
}
