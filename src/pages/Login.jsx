import { useState } from "react";
import { api } from "../api";
import { setSession, hasRole } from "../auth";

export default function Login({ onDone }) {
  const [email, setEmail] = useState("padre@colegio.com");
  const [password, setPassword] = useState("Admin123!");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const resp = await api("/auth/login", { method: "POST", body: { email, password } });
      setSession(resp);

      if (hasRole("PADRE")) onDone("/parent");
      else if (hasRole("ADMIN")) onDone("/admin");
      else if (hasRole("MAESTRO")) onDone("/teacher");
      else onDone("/parent");
    } catch (ex) {
      setErr(ex.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.bgGlow1} />
      <div style={styles.bgGlow2} />

      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>
            <span style={styles.logoDot} />
          </div>
          <div>
            <h1 style={styles.title}>Portal Educativo</h1>
            <p style={styles.subtitle}>Inicia sesión para continuar</p>
          </div>
        </div>

        <form onSubmit={submit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Correo</label>
            <div style={styles.inputWrap}>
              <span style={styles.icon}>@</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu.correo@colegio.com"
                autoComplete="email"
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Contraseña</label>
            <div style={styles.inputWrap}>
              <span style={styles.icon}>🔒</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                style={styles.input}
              />
            </div>
          </div>

          {err && (
            <div style={styles.errorBox}>
              <span style={styles.errorIcon}>⚠️</span>
              <span>{err}</span>
            </div>
          )}

          <button type="submit" disabled={loading} style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }}>
            {loading ? (
              <span style={styles.btnRow}>
                <span style={styles.spinner} />
                Entrando...
              </span>
            ) : (
              <span style={styles.btnRow}>Entrar</span>
            )}
          </button>

          <div style={styles.footer}>
            <span style={styles.footerText}>¿Problemas para entrar?</span>
            <span style={styles.footerHint}>Contacta al administrador.</span>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: "32px 16px",
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
    background: "linear-gradient(135deg, #0b1220 0%, #0e1b2f 40%, #0b1220 100%)",
    position: "relative",
    overflow: "hidden",
  },
  bgGlow1: {
    position: "absolute",
    width: 520,
    height: 520,
    borderRadius: "50%",
    background: "radial-gradient(circle at 30% 30%, rgba(99,102,241,0.35), rgba(99,102,241,0) 60%)",
    top: -120,
    left: -120,
    filter: "blur(2px)",
    pointerEvents: "none",
  },
  bgGlow2: {
    position: "absolute",
    width: 520,
    height: 520,
    borderRadius: "50%",
    background: "radial-gradient(circle at 70% 70%, rgba(16,185,129,0.25), rgba(16,185,129,0) 60%)",
    bottom: -140,
    right: -140,
    filter: "blur(2px)",
    pointerEvents: "none",
  },
  card: {
    width: "100%",
    maxWidth: 460,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 18,
    padding: 22,
    boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
    backdropFilter: "blur(10px)",
  },
  header: {
    display: "flex",
    gap: 14,
    alignItems: "center",
    marginBottom: 18,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 14,
    background: "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(16,185,129,0.9))",
    display: "grid",
    placeItems: "center",
    boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
  },
  logoDot: {
    width: 12,
    height: 12,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.95)",
    boxShadow: "0 0 0 6px rgba(255,255,255,0.15)",
  },
  title: {
    margin: 0,
    color: "rgba(255,255,255,0.95)",
    fontSize: 22,
    letterSpacing: 0.2,
  },
  subtitle: {
    margin: "4px 0 0",
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
  },
  form: {
    display: "grid",
    gap: 14,
  },
  field: {
    display: "grid",
    gap: 8,
  },
  label: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
  },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: "10px 12px",
  },
  icon: {
    width: 26,
    textAlign: "center",
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    userSelect: "none",
  },
  input: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "rgba(255,255,255,0.92)",
    fontSize: 14,
    padding: "2px 0",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 14,
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.25)",
    color: "rgba(255,255,255,0.92)",
    fontSize: 13,
  },
  errorIcon: { userSelect: "none" },
  button: {
    marginTop: 2,
    width: "100%",
    border: "none",
    borderRadius: 14,
    padding: "12px 14px",
    cursor: "pointer",
    color: "rgba(255,255,255,0.95)",
    fontSize: 14,
    fontWeight: 600,
    background: "linear-gradient(135deg, rgba(99,102,241,1), rgba(16,185,129,1))",
    boxShadow: "0 14px 30px rgba(0,0,0,0.25)",
    transition: "transform .08s ease, opacity .2s ease",
  },
  buttonDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
  btnRow: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  spinner: {
    width: 14,
    height: 14,
    borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.35)",
    borderTopColor: "rgba(255,255,255,0.95)",
    animation: "spin 0.9s linear infinite",
  },
  footer: {
    marginTop: 6,
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
  },
  footerText: { opacity: 0.9 },
  footerHint: { opacity: 0.75 },
};

// Inyecta keyframes del spinner sin archivos CSS
if (!document.getElementById("login-spin-style")) {
  const s = document.createElement("style");
  s.id = "login-spin-style";
  s.innerHTML = `@keyframes spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(s);
}
