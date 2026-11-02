
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Assistant from "./pages/Assistant";
import Sales from "./pages/Sales";
import Expenses from "./pages/Expenses";
import Inventory from "./pages/Inventory";
import AppLayout from "./layouts/appLayout";

import {
  clearSession,
  isSessionExpired,
  SESSION_CHANGED_EVENT,
} from "./utils/session";

import { useSessionTimeout } from "./hooks/useSessionTimeout";

function ProtectedRoute({
  children,
}: {
  children: ReactNode;
}) {
  const [authenticated, setAuthenticated] = useState(
    () => !isSessionExpired()
  );

  useEffect(() => {
    const checkAuthentication = () => {
      setAuthenticated(!isSessionExpired());
    };

    window.addEventListener(
      SESSION_CHANGED_EVENT,
      checkAuthentication
    );

    window.addEventListener(
      "storage",
      checkAuthentication
    );

    window.addEventListener(
      "focus",
      checkAuthentication
    );

    document.addEventListener(
      "visibilitychange",
      checkAuthentication
    );

    // Verify authentication when component mounts.
    checkAuthentication();

    return () => {
      window.removeEventListener(
        SESSION_CHANGED_EVENT,
        checkAuthentication
      );

      window.removeEventListener(
        "storage",
        checkAuthentication
      );

      window.removeEventListener(
        "focus",
        checkAuthentication
      );

      document.removeEventListener(
        "visibilitychange",
        checkAuthentication
      );
    };
  }, []);

  const { showWarning, remainingSeconds } =
    useSessionTimeout();

  const sessionValid = authenticated && !isSessionExpired();

  if (!sessionValid) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      {showWarning && (
        <div
          role="alert"
          className="session-warning"
        >
          <span>
            Your session will expire due to inactivity
            in {remainingSeconds} seconds.
          </span>

          <button
            type="button"
            onClick={clearSession}
          >
            Logout now
          </button>
        </div>
      )}

      {children}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/assistant" element={<Assistant />} />
        </Route>

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
