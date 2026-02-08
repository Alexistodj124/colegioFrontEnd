export function setSession(loginResp) {
  localStorage.setItem("token", loginResp.access_token);
  localStorage.setItem("user", JSON.stringify(loginResp.user));
  localStorage.setItem("roles", JSON.stringify(loginResp.roles || []));
  localStorage.setItem("permissions", JSON.stringify(loginResp.permissions || []));
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("roles");
  localStorage.removeItem("permissions");
}

export function getUser() {
  try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
}
export function getRoles() {
  try { return JSON.parse(localStorage.getItem("roles") || "[]"); } catch { return []; }
}
export function getPerms() {
  try { return JSON.parse(localStorage.getItem("permissions") || "[]"); } catch { return []; }
}
export function isLoggedIn() {
  return !!localStorage.getItem("token");
}

export function hasRole(role) {
  return getRoles().includes(role);
}

export function hasPerm(code) {
  return getPerms().includes(code);
}
