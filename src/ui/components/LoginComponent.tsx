/**
 * LoginComponent.tsx
 * Login form with email/password, rate limiting feedback, session management
 */

import React, { useState } from "react";

interface LoginComponentProps {
  onLoginSuccess: (token: string, userId: string) => void;
  onSwitchToRegister: () => void;
}

const LoginComponent: React.FC<LoginComponentProps> = ({
  onLoginSuccess,
  onSwitchToRegister
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Check rate limiting first
      const checkResponse = await fetch("/api/auth/check-login-limit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const checkData = await checkResponse.json();

      if (!checkData.allowed) {
        const lockTime = new Date(checkData.lockedUntil);
        setLockedUntil(checkData.lockedUntil);
        setError(`Account temporarily locked. Try again at ${lockTime.toLocaleTimeString()}`);
        setLoading(false);
        return;
      }

      // Attempt login
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Success
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userId", data.userId);
      onLoginSuccess(data.token, data.userId);
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isLockedOut = lockedUntil && Date.now() < lockedUntil;

  return (
    <div className="auth-container">
      <h2>Accedi a Echi di Gloria</h2>
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tuo.email@example.com"
            disabled={isLockedOut || loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 8 caracteres"
            disabled={isLockedOut || loading}
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          type="submit"
          disabled={isLockedOut || loading}
          className="btn-primary"
        >
          {loading ? "Caricamento..." : "Accedi"}
        </button>
      </form>

      <div className="auth-switch">
        <p>Non hai un account?</p>
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="btn-link"
        >
          Registrati qui
        </button>
      </div>

      <div className="security-notice">
        <p>🔒 La tua password è protetta con hash bcrypt-PBKDF2</p>
      </div>
    </div>
  );
};

export default LoginComponent;
