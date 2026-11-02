
import { useEffect, useState } from "react";
import {
  clearSession,
  getLastActivity,
  getToken,
  getTokenExpiration,
  INACTIVITY_TIMEOUT_MS,
  isSessionExpired,
  SESSION_CHANGED_EVENT,
  updateActivity,
  WARNING_DURATION_MS,
} from "../utils/session";

export function useSessionTimeout() {
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(60);

  useEffect(() => {
    const checkSession = () => {
      if (isSessionExpired()) {
        clearSession();
        setShowWarning(false);
        return;
      }

      const token = getToken();
      const lastActivity = getLastActivity();

      if (!token || lastActivity === null) return;

      const inactivityRemaining =
        INACTIVITY_TIMEOUT_MS -
        (Date.now() - lastActivity);

      const tokenExpiration = getTokenExpiration(token);

      const tokenRemaining = tokenExpiration === null
        ? 0
        : tokenExpiration - Date.now();

      const remaining = Math.min(
        inactivityRemaining,
        tokenRemaining
      );

      setRemainingSeconds(
        Math.max(0, Math.ceil(remaining / 1000))
      );

      setShowWarning(
        inactivityRemaining <= WARNING_DURATION_MS &&
        inactivityRemaining > 0
      );
    };

    const handleActivity = () => {
      if (isSessionExpired()) {
        checkSession();
        return;
      }

      updateActivity();
      checkSession();
    };

    const events = [
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
    ];

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, {
        passive: true,
      });
    });

    const interval = window.setInterval(checkSession, 1000);

    window.addEventListener("focus", checkSession);
    window.addEventListener("storage", checkSession);
    window.addEventListener(
      SESSION_CHANGED_EVENT,
      checkSession
    );

    document.addEventListener(
      "visibilitychange",
      checkSession
    );

    checkSession();

    return () => {
      window.clearInterval(interval);

      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });

      window.removeEventListener("focus", checkSession);
      window.removeEventListener("storage", checkSession);
      window.removeEventListener(
        SESSION_CHANGED_EVENT,
        checkSession
      );

      document.removeEventListener(
        "visibilitychange",
        checkSession
      );
    };
  }, []);

  return { showWarning, remainingSeconds };
}
