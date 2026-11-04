
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleSubmit(
  event: React.FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  setError("");

  // Validate password confirmation before API call
  if (password !== confirmPassword) {
    setError("Password and confirm password do not match.");
    return;
  }

  if (password.length < 8) {
    setError("Password must contain at least 8 characters.");
    return;
  }

  setLoading(true);

  try {
    await authApi.register({
      fullName: fullName.trim(),
      email: email.trim(),
      password,
    });

    navigate("/login", {
      replace: true,
      state: {
        message: "Account created successfully. Please sign in.",
        email: email.trim(),
      },
    });
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Registration failed. Please try again."
    );
  } finally {
    setLoading(false);
  }
}

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>TradePilot AI</h1>
        <p className="auth-subtitle">Create your business account.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="fullName">Full name</label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Your full name"
            required
          />

          <label htmlFor="registerEmail">Email address</label>
          <input
            id="registerEmail"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />

          <label htmlFor="registerPassword">Password</label>
          <input
            id="registerPassword"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create a password"
            minLength={8}
            required
          />

          <label htmlFor="Confirm Password">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="confirm your password"
            minLength={8}
            required
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
