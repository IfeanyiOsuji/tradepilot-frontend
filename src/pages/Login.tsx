
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../services/api";
import { getTokenExpiration, isSessionExpired, saveSession } from "../utils/session";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authApi.login({ email, password });

saveSession(result.accessToken, {
  userId: result.userId,
  fullName: result.fullName,
  email: result.email,
});

console.log("LOGIN DEBUG:", {
  tokenStored: Boolean(localStorage.getItem("accessToken")),
  lastActivityAt: localStorage.getItem("lastActivityAt"),
  sessionExpired: isSessionExpired(),
  tokenExpiresAt: new Date(
    getTokenExpiration(result.accessToken) ?? 0
  ).toLocaleString(),
  currentTime: new Date().toLocaleString(),
});

navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>TradePilot AI</h1>
        <p className="auth-subtitle">Sign in to manage your business.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </section>
    </main>
  );
}
