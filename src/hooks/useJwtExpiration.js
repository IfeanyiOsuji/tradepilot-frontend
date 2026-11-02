
import { useEffect, useRef } from "react";
import { getJwtExpiration } from "../utils/jwt";

export function useJwtExpiration(token, onExpired) {
  const callbackRef = useRef(onExpired);

  useEffect(() => {
    callbackRef.current = onExpired;
  }, [onExpired]);

  useEffect(() => {
    if (!token) return;

    const expiresAt = getJwtExpiration(token);

    if (expiresAt === null || expiresAt <= Date.now()) {
      callbackRef.current();
      return;
    }

    const checkExpiration = () => {
      if (Date.now() >= expiresAt) {
        callbackRef.current();
      }
    };

    // Periodic checking also handles browser timer throttling.
    const intervalId = window.setInterval(checkExpiration, 1000);

    window.addEventListener("focus", checkExpiration);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", checkExpiration);
    };
  }, [token]);
}
