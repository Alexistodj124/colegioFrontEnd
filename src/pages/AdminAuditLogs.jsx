import { useEffect, useState } from "react";
import { api } from "../api";
import { hasRole } from "../auth";

export default function AdminAuditLogs({ go }) {
  const [logs, setLogs] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    entity_type: "",
    action: "",
  });

  useEffect(() => {
    loadLogs();
  }, [filters]);

  const loadLogs = async () => {
    setLoading(true);
    setErr("");

    try {
      let url = "/admin/audit-logs?limit=200";
      if (filters.entity_type) url += `&entity_type=${filters.entity_type}`;
      if (filters.action) url += `&action=${filters.action}`;

      const data = await api(url);
      setLogs(data);
    } catch (ex) {
      setErr(ex.message || "Error al cargar logs");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({ entity_type: "", action: "" });
  };

  if (!hasRole("ADMIN")) {
    return (
      <div style={styles.page}>
        <div style={styles.shell}>
          <div style={styles.card}>
            <h2>No autorizado</h2>
            <button onClick={() => go("/admin")} style={styles.btnPrimary}>
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getActionBadgeStyle = (action) => {
    switch (action) {
      case "CREATE":
        return { background: "rgba(16,185,129,0.14)", border: "1px solid rgba(16,185,129,0.28)", color: "rgba(236,253,245,0.92)" };
      case "UPDATE":
        return { background: "rgba(59,130,246,0.14)", border: "1px solid rgba(59,130,246,0.28)", color: "rgba(219,234,254,0.92)" };
      case "DELETE":
        return { background: "rgba(239,68,68,0.14)", border: "1px solid rgba(239,68,68,0.28)", color: "rgba(254,242,242,0.92)" };
      default:
        return { background: "rgba(148,163,184,0.14)", border: "1px solid rgba(148,163,184,0.28)", color: "rgba(226,232,240,0.92)" };
    }
  };

  const getEntityIcon = (entityType) => {
    switch (entityType) {
      case "USER": return "👤";
      case "STUDENT": return "🎓";
      case "PROCEDURE": return "📋";
      case "INVOICE": return "💰";
      case "PROGRAM": return "📚";
      default: return "📄";
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.bgGlow1} />
      <div style={styles.bgGlow2} />

      <div style={styles.shell}>
        <div style={styles.topbar}>
          <div>
            <button onClick={() => go("/admin")} style={styles.btnBack}>
              ← Volver al Dashboard
            </button>
            <h1 style={styles.h1}>Registro de Auditoría</h1>
            <p style={styles.sub}>Historial de acciones realizadas en el sistema</p>
          </div>
        </div>

        {err && (
          <div style={styles.errorBox}>
            <span>⚠️</span>
            <span>{err}</span>
          </div>
        )}

        <div style={styles.filtersBar}>
          <select
            value={filters.entity_type}
            onChange={(e) => setFilters({ ...filters, entity_type: e.target.value })}
            style={styles.filterSelect}
          >
            <option value="">Todas las entidades</option>
            <option value="USER">Usuarios</option>
            <option value="STUDENT">Alumnos</option>
            <option value="PROCEDURE">Trámites</option>
            <option value="INVOICE">Mensualidades</option>
            <option value="PROGRAM">Programas</option>
          </select>

          <select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            style={styles.filterSelect}
          >
            <option value="">Todas las acciones</option>
            <option value="CREATE">Crear</option>
            <option value="UPDATE">Actualizar</option>
            <option value="DELETE">Eliminar</option>
          </select>

          <button onClick={clearFilters} style={styles.btnGhost}>
            Limpiar filtros
          </button>
        </div>

        <div style={styles.statsBar}>
          <div style={styles.stat}>
            <span style={styles.statValue}>{logs.length}</span>
            <span style={styles.statLabel}>Registros</span>
          </div>
        </div>

        <div style={styles.logsContainer}>
          {loading && <div style={styles.loading}>Cargando...</div>}

          {!loading && !logs.length && (
            <div style={styles.emptyState}>
              No hay registros de auditoría
            </div>
          )}

          {!loading && logs.map((log) => (
            <div key={log.id} style={styles.logCard}>
              <div style={styles.logHeader}>
                <div style={styles.logLeft}>
                  <span style={styles.entityIcon}>{getEntityIcon(log.entity_type)}</span>
                  <div>
                    <div style={styles.logTitle}>
                      {log.entity_type}
                      {log.entity_id && <span style={styles.entityId}>#{log.entity_id}</span>}
                    </div>
                    <div style={styles.logUser}>
                      {log.user_name || "Sistema"} • {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                <span style={{ ...styles.actionBadge, ...getActionBadgeStyle(log.action) }}>
                  {log.action}
                </span>
              </div>

              {log.details && (
                <div style={styles.logDetails}>
                  {log.details}
                </div>
              )}
            </div>
          ))}
        </div>
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
    maxWidth: 1000,
    margin: "0 auto",
    padding: "34px 16px 64px",
    position: "relative",
    zIndex: 1,
  },
  topbar: {
    marginBottom: 24,
  },
  h1: { margin: "8px 0 0", fontSize: 24, letterSpacing: 0.2 },
  sub: { marginTop: 4, fontSize: 13, color: "rgba(255,255,255,0.68)" },
  btnBack: {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.7)",
    cursor: "pointer",
    fontSize: 14,
    padding: 0,
  },
  btnPrimary: {
    border: "none",
    borderRadius: 14,
    padding: "12px 20px",
    cursor: "pointer",
    color: "rgba(255,255,255,0.95)",
    fontSize: 14,
    fontWeight: 700,
    background: "linear-gradient(135deg, rgba(99,102,241,1), rgba(16,185,129,1))",
    boxShadow: "0 14px 30px rgba(0,0,0,0.25)",
  },
  btnGhost: {
    borderRadius: 10,
    padding: "10px 14px",
    cursor: "pointer",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "rgba(255,255,255,0.92)",
    fontSize: 13,
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
  filtersBar: {
    display: "flex",
    gap: 12,
    marginBottom: 20,
    flexWrap: "wrap",
    alignItems: "center",
  },
  filterSelect: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "#1e293b",
    color: "rgba(255,255,255,0.92)",
    fontSize: 14,
    cursor: "pointer",
  },
  statsBar: {
    display: "flex",
    gap: 16,
    marginBottom: 20,
  },
  stat: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 14px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  statValue: {
    fontSize: 18,
    fontWeight: 700,
    color: "rgba(99,102,241,0.9)",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },
  logsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  logCard: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 14,
    overflow: "hidden",
  },
  logHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  logLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  entityIcon: {
    fontSize: 24,
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.06)",
    borderRadius: 10,
  },
  logTitle: {
    fontSize: 14,
    fontWeight: 700,
  },
  entityId: {
    marginLeft: 6,
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    fontFamily: "monospace",
  },
  logUser: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    marginTop: 2,
  },
  actionBadge: {
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.5,
  },
  logDetails: {
    padding: "12px 16px",
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    background: "rgba(255,255,255,0.03)",
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },
  loading: {
    padding: 40,
    textAlign: "center",
    color: "rgba(255,255,255,0.6)",
  },
  emptyState: {
    padding: 40,
    textAlign: "center",
    color: "rgba(255,255,255,0.5)",
    background: "rgba(255,255,255,0.06)",
    borderRadius: 14,
  },
  card: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 18,
    padding: 24,
    boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
  },
};
