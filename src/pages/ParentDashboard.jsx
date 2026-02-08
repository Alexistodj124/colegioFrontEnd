import { useEffect, useState } from "react";
import { api } from "../api";
import { clearSession, getUser, hasRole } from "../auth";

export default function ParentDashboard({ go }) {
  const [students, setStudents] = useState([]);
  const [err, setErr] = useState("");
  const user = getUser();

  useEffect(() => {
    (async () => {
      try {
        const data = await api("/parent/students");
        setStudents(data);
      } catch (ex) {
        setErr(ex.message || "Error");
      }
    })();
  }, []);

  if (!hasRole("PADRE")) {
    return (
      <div style={styles.page}>
        <div style={styles.bgGlow1} />
        <div style={styles.bgGlow2} />
        <div style={styles.shell}>
          <div style={styles.card}>
            <h2 style={styles.h2}>No autorizado</h2>
            <p style={styles.p}>Tu usuario no tiene rol PADRE.</p>
            <button style={styles.btnGhost} onClick={() => { clearSession(); go("/login"); }}>
              Volver al login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const onLogout = () => {
    clearSession();
    go("/login");
  };

  return (
    <div style={styles.page}>
      <div style={styles.bgGlow1} />
      <div style={styles.bgGlow2} />

      <div style={styles.shell}>
        <div style={styles.topbar}>
          <div style={styles.brandRow}>
            <div style={styles.logo}>
              <span style={styles.logoDot} />
            </div>
            <div>
              <div style={styles.kicker}>Portal Educativo</div>
              <div style={styles.titleRow}>
                <h1 style={styles.h1}>Bienvenido{user?.full_name ? `, ${user.full_name}` : ""}</h1>
              </div>
              <div style={styles.sub}>Estado y mensualidades de tus hijos</div>
            </div>
          </div>

          <button onClick={onLogout} style={styles.btnGhost}>
            <span style={{ opacity: 0.9 }}>Salir</span>
            <span style={{ opacity: 0.7 }}>↗</span>
          </button>
        </div>

        {err && (
          <div style={styles.errorBox}>
            <span style={styles.errorIcon}>⚠️</span>
            <span>{err}</span>
          </div>
        )}

        <div style={styles.grid}>
          {students.map((s) => (
            <div key={s.student_id} style={styles.studentCard}>
              <div style={styles.cardHead}>
                <div>
                  <div style={styles.studentName}>{s.full_name}</div>
                  <div style={styles.metaRow}>
                    <span style={{ ...styles.badge, ...badgeByStatus(s.status) }}>
                      {labelStatus(s.status)}
                    </span>
                    {s.relationship ? (
                      <span style={styles.miniTag}>{s.relationship}</span>
                    ) : null}
                  </div>
                </div>

                <div style={styles.statusIconWrap}>
                  <span style={{ ...styles.statusDot, ...dotByStatus(s.status) }} />
                </div>
              </div>

              <div style={styles.cardBody}>
                <div style={styles.infoLine}>
                  <span style={styles.infoLabel}>Estado</span>
                  <span style={styles.infoValue}>{labelStatus(s.status)}</span>
                </div>

                <div style={styles.btnGroup}>
                  <button
                    onClick={() => go(`/parent/students/${s.student_id}/invoices`)}
                    style={styles.btnPrimary}
                  >
                    <span style={styles.btnRow}>
                      Ver mensualidades / Pagar
                      <span style={{ opacity: 0.85 }}>→</span>
                    </span>
                  </button>

                  <button
                    onClick={() => go(`/parent/students/${s.student_id}/procedures`)}
                    style={styles.btnSecondary}
                  >
                    <span style={styles.btnRow}>
                      Solicitar trámites
                      <span style={{ opacity: 0.85 }}>→</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!students.length && !err && (
            <div style={styles.emptyCard}>
              <div style={styles.emptyTitle}>Sin alumnos asignados</div>
              <div style={styles.emptyText}>No hay hijos vinculados a tu cuenta por el momento.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function labelStatus(s) {
  const v = String(s || "").toUpperCase();
  if (v === "VIGENTE") return "Vigente";
  if (v === "ATRASADO") return "Atrasado";
  if (v === "RETIRADO") return "Retirado";
  return v || "—";
}

function badgeByStatus(s) {
  const v = String(s || "").toUpperCase();
  if (v === "VIGENTE") {
    return {
      background: "rgba(16,185,129,0.14)",
      border: "1px solid rgba(16,185,129,0.28)",
      color: "rgba(236,253,245,0.92)",
    };
  }
  if (v === "ATRASADO") {
    return {
      background: "rgba(245,158,11,0.14)",
      border: "1px solid rgba(245,158,11,0.28)",
      color: "rgba(255,251,235,0.92)",
    };
  }
  if (v === "RETIRADO") {
    return {
      background: "rgba(239,68,68,0.14)",
      border: "1px solid rgba(239,68,68,0.28)",
      color: "rgba(254,242,242,0.92)",
    };
  }
  return {
    background: "rgba(148,163,184,0.12)",
    border: "1px solid rgba(148,163,184,0.22)",
    color: "rgba(226,232,240,0.9)",
  };
}

function dotByStatus(s) {
  const v = String(s || "").toUpperCase();
  if (v === "VIGENTE") return { background: "rgba(16,185,129,0.95)" };
  if (v === "ATRASADO") return { background: "rgba(245,158,11,0.95)" };
  if (v === "RETIRADO") return { background: "rgba(239,68,68,0.95)" };
  return { background: "rgba(148,163,184,0.95)" };
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0b1220 0%, #0e1b2f 40%, #0b1220 100%)",
    position: "relative",
    overflow: "hidden",
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
    color: "rgba(255,255,255,0.92)",
  },
  bgGlow1: {
    position: "absolute",
    width: 620,
    height: 620,
    borderRadius: "50%",
    background:
      "radial-gradient(circle at 30% 30%, rgba(99,102,241,0.30), rgba(99,102,241,0) 60%)",
    top: -160,
    left: -160,
    pointerEvents: "none",
  },
  bgGlow2: {
    position: "absolute",
    width: 620,
    height: 620,
    borderRadius: "50%",
    background:
      "radial-gradient(circle at 70% 70%, rgba(16,185,129,0.22), rgba(16,185,129,0) 60%)",
    bottom: -180,
    right: -180,
    pointerEvents: "none",
  },
  shell: {
    maxWidth: 1040,
    margin: "0 auto",
    padding: "34px 16px 64px",
    position: "relative",
    zIndex: 1,
  },
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    alignItems: "center",
    marginBottom: 18,
  },
  brandRow: {
    display: "flex",
    gap: 14,
    alignItems: "center",
  },
  logo: {
    width: 46,
    height: 46,
    borderRadius: 16,
    background: "linear-gradient(135deg, rgba(99,102,241,0.95), rgba(16,185,129,0.95))",
    display: "grid",
    placeItems: "center",
    boxShadow: "0 14px 30px rgba(0,0,0,0.25)",
    flex: "0 0 auto",
  },
  logoDot: {
    width: 12,
    height: 12,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.95)",
    boxShadow: "0 0 0 6px rgba(255,255,255,0.14)",
  },
  kicker: {
    fontSize: 12,
    color: "rgba(255,255,255,0.62)",
    marginBottom: 3,
  },
  titleRow: { display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" },
  h1: { margin: 0, fontSize: 22, letterSpacing: 0.2 },
  sub: { marginTop: 4, fontSize: 13, color: "rgba(255,255,255,0.68)" },

  grid: {
    display: "grid",
    gap: 14,
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    marginTop: 14,
  },

  studentCard: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 18,
    boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
    backdropFilter: "blur(10px)",
    overflow: "hidden",
  },
  cardHead: {
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    padding: 16,
    borderBottom: "1px solid rgba(255,255,255,0.10)",
  },
  studentName: {
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: 0.2,
  },
  metaRow: {
    display: "flex",
    gap: 8,
    marginTop: 10,
    flexWrap: "wrap",
  },
  badge: {
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.3,
  },
  miniTag: {
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "rgba(255,255,255,0.75)",
  },
  statusIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    display: "grid",
    placeItems: "center",
    flex: "0 0 auto",
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: "50%",
    boxShadow: "0 0 0 7px rgba(255,255,255,0.10)",
  },
  cardBody: { padding: 16 },
  infoLine: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.10)",
    marginBottom: 12,
  },
  infoLabel: { fontSize: 12, color: "rgba(255,255,255,0.68)" },
  infoValue: { fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.92)" },

  btnGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  btnPrimary: {
    width: "100%",
    border: "none",
    borderRadius: 14,
    padding: "12px 14px",
    cursor: "pointer",
    color: "rgba(255,255,255,0.95)",
    fontSize: 14,
    fontWeight: 700,
    background: "linear-gradient(135deg, rgba(99,102,241,1), rgba(16,185,129,1))",
    boxShadow: "0 14px 30px rgba(0,0,0,0.25)",
  },
  btnSecondary: {
    width: "100%",
    border: "1px solid rgba(99,102,241,0.4)",
    borderRadius: 14,
    padding: "12px 14px",
    cursor: "pointer",
    color: "rgba(255,255,255,0.92)",
    fontSize: 14,
    fontWeight: 700,
    background: "rgba(99,102,241,0.12)",
  },
  btnRow: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  btnGhost: {
    borderRadius: 14,
    padding: "10px 12px",
    cursor: "pointer",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "rgba(255,255,255,0.92)",
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
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
    marginTop: 10,
  },
  errorIcon: { userSelect: "none" },

  emptyCard: {
    gridColumn: "1 / -1",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
    backdropFilter: "blur(10px)",
  },
  emptyTitle: { fontSize: 16, fontWeight: 800, marginBottom: 6 },
  emptyText: { fontSize: 13, color: "rgba(255,255,255,0.68)" },

  card: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
    backdropFilter: "blur(10px)",
  },
  h2: { margin: 0, marginBottom: 8, fontSize: 18 },
  p: { margin: 0, color: "rgba(255,255,255,0.7)", fontSize: 13 },
};
