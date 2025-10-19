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
  try {
    window.dispatchEvent(
      new CustomEvent("auth:change", { detail: { authed: true } })
    );
  } catch {}
}

export function logout() {
  localStorage.removeItem("token");
  // Soft reload to clear statefully cached data
  try {
    window.dispatchEvent(
      new CustomEvent("auth:change", { detail: { authed: false } })
    );
  } catch {}
  window.location.href = "/";
}
