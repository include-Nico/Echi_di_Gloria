/**
 * RegisterComponent.tsx
 * Registration with email verification flow
 * Steps: 1) Create account → 2) Email sent → 3) Verify code → 4) Ready to play
 */

import React, { useState } from "react";

interface RegisterComponentProps {
  onRegisterSuccess: (userId: string) => void;
  onSwitchToLogin: () => void;
}

type RegisterStep = "form" | "verify" | "success";

const RegisterComponent: React.FC<RegisterComponentProps> = ({
  onRegisterSuccess,
  onSwitchToLogin
}) => {
  const [step, setStep] = useState<RegisterStep>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      setUserId(data.userId);
      setStep("verify");
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code: verificationCode.toUpperCase()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Verification failed");
        return;
      }

      setStep("success");
      setTimeout(() => {
        if (userId) {
          onRegisterSuccess(userId);
        }
      }, 2000);
    } catch (err) {
      setError("Verification error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      setError(null);
    } catch (err) {
      setError("Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {step === "form" && (
        <>
          <h2>Crea il tuo Account</h2>
          <form onSubmit={handleCreateAccount} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tuo.email@example.com"
                disabled={loading}
                required
              />
              <small>Usiamo l'email solo per il login e il recupero password</small>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 caratteri"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password-confirm">Conferma Password</label>
              <input
                type="password"
                id="password-confirm"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Ripeti la password"
                disabled={loading}
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Creazione..." : "Crea Account"}
            </button>
          </form>
        </>
      )}

      {step === "verify" && (
        <>
          <h2>Verifica Email</h2>
          <div className="verify-notice">
            <p>Abbiamo inviato un codice di verifica a <strong>{email}</strong></p>
            <p>Controlla lo spam se non vedi il messaggio</p>
          </div>

          <form onSubmit={handleVerifyEmail} className="auth-form">
            <div className="form-group">
              <label htmlFor="code">Codice di Verifica</label>
              <input
                type="text"
                id="code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                placeholder="Es: ABC123XY"
                maxLength={8}
                disabled={loading}
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Verifica..." : "Verifica Email"}
            </button>

            <button
              type="button"
              onClick={handleResendCode}
              disabled={loading}
              className="btn-secondary"
            >
              Reinvia Codice
            </button>
          </form>
        </>
      )}

      {step === "success" && (
        <>
          <h2>✅ Account Creato!</h2>
          <div className="success-message">
            <p>La tua email è verificata e il tuo account è pronto.</p>
            <p>Accedi ora per iniziare a giocare!</p>
          </div>
        </>
      )}

      {step !== "success" && (
        <div className="auth-switch">
          <p>Hai già un account?</p>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="btn-link"
          >
            Accedi qui
          </button>
        </div>
      )}

      <div className="security-notice">
        <p>🔒 Privacy first: La tua email non è mai condivisa. Password hash + Salt.</p>
      </div>
    </div>
  );
};

export default RegisterComponent;
