
const TOKEN_KEY = "accessToken";
const USER_KEY = "user";
const LAST_ACTIVITY_KEY = "lastActivityAt";

export const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;
export const WARNING_DURATION_MS = 60 * 1000;

export const SESSION_CHANGED_EVENT =
  "tradepilot:session-changed";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getTokenExpiration(
  token: string
): number | null {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const base64 = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const padded = base64.padEnd(
      Math.ceil(base64.length / 4) * 4,
      "="
    );

    const payload = JSON.parse(atob(padded));

    if (typeof payload.exp !== "number") {
      return null;
    }

    return payload.exp * 1000;
  } catch {
    return null;
  }
}

export function isTokenExpired(
  token: string
): boolean {
  const expiration = getTokenExpiration(token);

  return expiration === null ||
    Date.now() >= expiration;
}

export function getLastActivity(): number | null {
  const value = localStorage.getItem(LAST_ACTIVITY_KEY);

  if (!value) {
    return null;
  }

  const timestamp = Number(value);

  return Number.isFinite(timestamp) && timestamp > 0
    ? timestamp
    : null;
}

export function isSessionExpired(): boolean {
  const token = getToken();

  if (!token || isTokenExpired(token)) {
    return true;
  }

  const lastActivity = getLastActivity();

  if (lastActivity === null) {
    return true;
  }

  return Date.now() - lastActivity >=
    INACTIVITY_TIMEOUT_MS;
}

export function saveSession(
  token: string,
  user: {
    userId: number;
    fullName: string;
    email: string;
  }
): void {
  localStorage.setItem(TOKEN_KEY, token);

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(user)
  );

  localStorage.setItem(
    LAST_ACTIVITY_KEY,
    Date.now().toString()
  );

  window.dispatchEvent(
    new Event(SESSION_CHANGED_EVENT)
  );
}

export function updateActivity(): void {
  if (!getToken() || isSessionExpired()) {
    return;
  }

  localStorage.setItem(
    LAST_ACTIVITY_KEY,
    Date.now().toString()
  );
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(LAST_ACTIVITY_KEY);

  window.dispatchEvent(
    new Event(SESSION_CHANGED_EVENT)
  );
}
