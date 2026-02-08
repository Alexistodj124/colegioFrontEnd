import { useEffect, useState } from "react";
import { api } from "../api";
import { clearSession, getUser, hasRole } from "../auth";

export default function AdminDashboard({ go }) {
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState("");
  const user = getUser();

  useEffect(() => {
    (async () => {
      try {
        const data = await api("/admin/dashboard");
        setStats(data);
      } catch (ex) {
        setErr(ex.message || "Error");
      }
    })();
  }, []);

  if (!hasRole("ADMIN")) {
    return (
      <div style={styles.page}>
        <div style={styles.bgGlow1} />
        <div style={styles.bgGlow2} />
        <div style={styles.shell}>
          <div style={styles.card}>
            <h2 style={styles.h2}>No autorizado</h2>
            <p style={styles.p}>Tu usuario no tiene rol ADMIN.</p>
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
              <div style={styles.kicker}>Panel Administrativo</div>
              <div style={styles.titleRow}>
                <h1 style={styles.h1}>Dashboard{user?.full_name ? ` - ${user.full_name}` : ""}</h1>
              </div>
              <div style={styles.sub}>Gestión de alumnos, trámites y pagos</div>
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

        <div style={styles.menuGrid}>
          <button onClick={() => go("/admin/students")} style={styles.menuCard}>
            <div style={styles.menuIcon}>👥</div>
            <div style={styles.menuTitle}>Alumnos</div>
            <div style={styles.menuDesc}>Gestionar estudiantes y sus estados</div>
          </button>

          <button onClick={() => go("/admin/procedures")} style={styles.menuCard}>
            <div style={styles.menuIcon}>📋</div>
            <div style={styles.menuTitle}>Trámites</div>
            <div style={styles.menuDesc}>Administrar solicitudes y aprobaciones</div>
          </button>

          <button onClick={() => go("/admin/invoices")} style={styles.menuCard}>
            <div style={styles.menuIcon}>💰</div>
            <div style={styles.menuTitle}>Pagos</div>
            <div style={styles.menuDesc}>Control de mensualidades y estados</div>
          </button>

          <button onClick={() => go("/admin/programs")} style={styles.menuCard}>
            <div style={styles.menuIcon}>📚</div>
            <div style={styles.menuTitle}>Programas</div>
            <div style={styles.menuDesc}>Cursos y Google Classroom</div>
          </button>

          <button onClick={() => go("/admin/users")} style={styles.menuCard}>
            <div style={styles.menuIcon}>🔐</div>
            <div style={styles.menuTitle}>Usuarios</div>
            <div style={styles.menuDesc}>Gestión de usuarios y roles</div>
          </button>

          <button onClick={() => go("/admin/reports")} style={styles.menuCard}>
            <div style={styles.menuIcon}>📊</div>
            <div style={styles.menuTitle}>Reportes</div>
            <div style={styles.menuDesc}>Consultas y exportación CSV</div>
          </button>

          <button onClick={() => go("/admin/audit")} style={styles.menuCard}>
            <div style={styles.menuIcon}>📜</div>
            <div style={styles.menuTitle}>Auditoría</div>
            <div style={styles.menuDesc}>Historial de acciones</div>
          </button>
        </div>

        {stats && (
          <>
            <h2 style={styles.sectionTitle}>Estadísticas Generales</h2>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Total Alumnos</div>
                <div style={styles.statValue}>{stats.total_students}</div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statLabel}>Alumnos Vigentes</div>
                <div style={styles.statValue}>{stats.active_students}</div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statLabel}>Alumnos Atrasados</div>
                <div style={styles.statValue}>{stats.late_students}</div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statLabel}>Alumnos Retirados</div>
                <div style={styles.statValue}>{stats.withdrawn_students}</div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statLabel}>Pagos Pendientes</div>
                <div style={styles.statValue}>{stats.pending_invoices}</div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statLabel}>Pagos Realizados</div>
                <div style={styles.statValue}>{stats.paid_invoices}</div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statLabel}>Trámites Pendientes</div>
                <div style={styles.statValue}>{stats.pending_procedures}</div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statLabel}>Trámites Aprobados</div>
                <div style={styles.statValue}>{stats.approved_procedures}</div>
              </div>

              {stats.unassigned_procedures > 0 && (
                <div style={styles.statCardWarning}>
                  <div style={styles.statLabel}>Trámites Sin Asignar</div>
                  <div style={styles.statValue}>{stats.unassigned_procedures}</div>
                  <div style={styles.statHint}>Requieren atención</div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
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
    background: "radial-gradient(circle at 30% 30%, rgba(99,102,241,0.30), rgba(99,102,241,0) 60%)",
    top: -160,
    left: -160,
    pointerEvents: "none",
  },
  bgGlow2: {
    position: "absolute",
    width: 620,
    height: 620,
    borderRadius: "50%",
    background: "radial-gradient(circle at 70% 70%, rgba(16,185,129,0.22), rgba(16,185,129,0) 60%)",
    bottom: -180,
    right: -180,
    pointerEvents: "none",
  },
  shell: {
    maxWidth: 1200,
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
    marginBottom: 32,
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

  menuGrid: {
    display: "grid",
    gap: 16,
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    marginBottom: 40,
  },
  menuCard: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 18,
    padding: 24,
    cursor: "pointer",
    textAlign: "center",
    boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
    backdropFilter: "blur(10px)",
    transition: "all 0.2s ease",
    color: "inherit",
  },
  menuIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 8,
  },
  menuDesc: {
    fontSize: 13,
    color: "rgba(255,255,255,0.68)",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 16,
    marginTop: 0,
  },

  statsGrid: {
    display: "grid",
    gap: 14,
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  },
  statCard: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
    backdropFilter: "blur(10px)",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.68)",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 800,
    color: "rgba(255,255,255,0.95)",
  },
  statCardWarning: {
    background: "rgba(245,158,11,0.12)",
    border: "1px solid rgba(245,158,11,0.25)",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
    backdropFilter: "blur(10px)",
  },
  statHint: {
    fontSize: 11,
    color: "rgba(245,158,11,0.9)",
    marginTop: 4,
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
    marginBottom: 20,
  },
  errorIcon: { userSelect: "none" },

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
