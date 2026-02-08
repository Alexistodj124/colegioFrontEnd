import { useEffect, useState } from "react";
import { api, downloadCSV } from "../api";
import { hasRole } from "../auth";

export default function AdminReports({ go }) {
  const [activeTab, setActiveTab] = useState("students");
  const [data, setData] = useState([]);
  const [students, setStudents] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    status: "",
    search: "",
    student_id: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    loadData();
  }, [activeTab, filters]);

  const loadStudents = async () => {
    try {
      const data = await api("/admin/students");
      setStudents(data);
    } catch (ex) {
      console.error("Error loading students:", ex);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setErr("");

    try {
      let url = `/admin/reports/${activeTab}`;
      const params = new URLSearchParams();

      if (filters.status) params.append("status", filters.status);
      if (filters.student_id) params.append("student_id", filters.student_id);
      if (filters.start_date) params.append("start_date", filters.start_date);
      if (filters.end_date) params.append("end_date", filters.end_date);
      if (filters.search) params.append("search", filters.search);

      if (params.toString()) url += `?${params.toString()}`;

      const result = await api(url);
      setData(result);
    } catch (ex) {
      setErr(ex.message || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      let url = `/admin/export/${activeTab}`;
      const params = new URLSearchParams();

      if (filters.status) params.append("status", filters.status);
      if (filters.student_id) params.append("student_id", filters.student_id);

      if (params.toString()) url += `?${params.toString()}`;

      const filename = `${activeTab}_${new Date().toISOString().split("T")[0]}.csv`;
      await downloadCSV(url, filename);
    } catch (ex) {
      setErr(ex.message || "Error al exportar");
    }
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      search: "",
      student_id: "",
      start_date: "",
      end_date: "",
    });
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

  const renderFilters = () => {
    switch (activeTab) {
      case "students":
        return (
          <>
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              style={styles.filterInput}
            />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              style={styles.filterSelect}
            >
              <option value="">Todos los estados</option>
              <option value="VIGENTE">Vigente</option>
              <option value="ATRASADO">Atrasado</option>
              <option value="RETIRADO">Retirado</option>
            </select>
          </>
        );
      case "invoices":
        return (
          <>
            <select
              value={filters.student_id}
              onChange={(e) => setFilters({ ...filters, student_id: e.target.value })}
              style={styles.filterSelect}
            >
              <option value="">Todos los alumnos</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              style={styles.filterSelect}
            >
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="PAGADO">Pagado</option>
            </select>
            <input
              type="date"
              placeholder="Desde"
              value={filters.start_date}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
              style={styles.filterInput}
            />
            <input
              type="date"
              placeholder="Hasta"
              value={filters.end_date}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
              style={styles.filterInput}
            />
          </>
        );
      case "procedures":
        return (
          <>
            <select
              value={filters.student_id}
              onChange={(e) => setFilters({ ...filters, student_id: e.target.value })}
              style={styles.filterSelect}
            >
              <option value="">Todos los alumnos</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              style={styles.filterSelect}
            >
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="EN_PROCESO">En Proceso</option>
              <option value="APROBADO">Aprobado</option>
              <option value="RECHAZADO">Rechazado</option>
            </select>
          </>
        );
      default:
        return null;
    }
  };

  const renderTable = () => {
    if (loading) {
      return <div style={styles.loading}>Cargando...</div>;
    }

    if (!data.length) {
      return <div style={styles.emptyState}>No hay datos para mostrar</div>;
    }

    switch (activeTab) {
      case "students":
        return (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Nombre</th>
                <th style={styles.th}>Email Google</th>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>Creado</th>
              </tr>
            </thead>
            <tbody>
              {data.map((s) => (
                <tr key={s.id} style={styles.tr}>
                  <td style={styles.td}>{s.id}</td>
                  <td style={styles.td}>{s.full_name}</td>
                  <td style={styles.td}>{s.google_email || "—"}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, ...badgeByStudentStatus(s.status) }}>
                      {s.status}
                    </span>
                  </td>
                  <td style={styles.td}>{new Date(s.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case "invoices":
        return (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Alumno</th>
                <th style={styles.th}>Periodo</th>
                <th style={styles.th}>Monto</th>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>Pagado</th>
              </tr>
            </thead>
            <tbody>
              {data.map((inv) => (
                <tr key={inv.id} style={styles.tr}>
                  <td style={styles.td}>{inv.id}</td>
                  <td style={styles.td}>{inv.student_name || `ID: ${inv.student_id}`}</td>
                  <td style={styles.td}>{inv.period}</td>
                  <td style={styles.td}>Q{inv.amount.toFixed(2)}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, ...badgeByPaymentStatus(inv.status) }}>
                      {inv.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {inv.paid_at ? new Date(inv.paid_at).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case "procedures":
        return (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Alumno</th>
                <th style={styles.th}>Tipo</th>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>Solicitado</th>
                <th style={styles.th}>Asignado a</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id} style={styles.tr}>
                  <td style={styles.td}>{p.id}</td>
                  <td style={styles.td}>{p.student_name || `ID: ${p.student_id}`}</td>
                  <td style={styles.td}>{p.procedure_type}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, ...badgeByProcedureStatus(p.status) }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={styles.td}>{new Date(p.created_at).toLocaleDateString()}</td>
                  <td style={styles.td}>{p.assigned_to_name || "Sin asignar"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      default:
        return null;
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
            <h1 style={styles.h1}>Reportes</h1>
            <p style={styles.sub}>Consulta y exporta información del sistema</p>
          </div>
        </div>

        {err && (
          <div style={styles.errorBox}>
            <span>⚠️</span>
            <span>{err}</span>
          </div>
        )}

        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(activeTab === "students" ? styles.tabActive : {}) }}
            onClick={() => setActiveTab("students")}
          >
            Alumnos
          </button>
          <button
            style={{ ...styles.tab, ...(activeTab === "invoices" ? styles.tabActive : {}) }}
            onClick={() => setActiveTab("invoices")}
          >
            Mensualidades
          </button>
          <button
            style={{ ...styles.tab, ...(activeTab === "procedures" ? styles.tabActive : {}) }}
            onClick={() => setActiveTab("procedures")}
          >
            Trámites
          </button>
        </div>

        <div style={styles.filtersBar}>
          {renderFilters()}
          <button onClick={clearFilters} style={styles.btnGhost}>
            Limpiar
          </button>
          <button onClick={handleExport} style={styles.btnExport}>
            Exportar CSV
          </button>
        </div>

        <div style={styles.statsBar}>
          <div style={styles.stat}>
            <span style={styles.statValue}>{data.length}</span>
            <span style={styles.statLabel}>Registros</span>
          </div>
        </div>

        <div style={styles.tableWrapper}>
          {renderTable()}
        </div>
      </div>
    </div>
  );
}

function badgeByStudentStatus(s) {
  if (s === "VIGENTE") return { background: "rgba(16,185,129,0.14)", border: "1px solid rgba(16,185,129,0.28)", color: "rgba(236,253,245,0.92)" };
  if (s === "ATRASADO") return { background: "rgba(245,158,11,0.14)", border: "1px solid rgba(245,158,11,0.28)", color: "rgba(255,251,235,0.92)" };
  if (s === "RETIRADO") return { background: "rgba(239,68,68,0.14)", border: "1px solid rgba(239,68,68,0.28)", color: "rgba(254,242,242,0.92)" };
  return {};
}

function badgeByPaymentStatus(s) {
  if (s === "PAGADO") return { background: "rgba(16,185,129,0.14)", border: "1px solid rgba(16,185,129,0.28)", color: "rgba(236,253,245,0.92)" };
  return { background: "rgba(245,158,11,0.14)", border: "1px solid rgba(245,158,11,0.28)", color: "rgba(255,251,235,0.92)" };
}

function badgeByProcedureStatus(s) {
  if (s === "APROBADO") return { background: "rgba(16,185,129,0.14)", border: "1px solid rgba(16,185,129,0.28)", color: "rgba(236,253,245,0.92)" };
  if (s === "EN_PROCESO") return { background: "rgba(59,130,246,0.14)", border: "1px solid rgba(59,130,246,0.28)", color: "rgba(219,234,254,0.92)" };
  if (s === "RECHAZADO") return { background: "rgba(239,68,68,0.14)", border: "1px solid rgba(239,68,68,0.28)", color: "rgba(254,242,242,0.92)" };
  return { background: "rgba(245,158,11,0.14)", border: "1px solid rgba(245,158,11,0.28)", color: "rgba(255,251,235,0.92)" };
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
    maxWidth: 1400,
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
  btnExport: {
    borderRadius: 10,
    padding: "10px 14px",
    cursor: "pointer",
    background: "rgba(16,185,129,0.15)",
    border: "1px solid rgba(16,185,129,0.3)",
    color: "rgba(236,253,245,0.92)",
    fontSize: 13,
    fontWeight: 600,
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
  tabs: {
    display: "flex",
    gap: 8,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  tab: {
    padding: "10px 20px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.7)",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    transition: "all 0.2s",
  },
  tabActive: {
    background: "rgba(99,102,241,0.2)",
    border: "1px solid rgba(99,102,241,0.4)",
    color: "rgba(255,255,255,0.95)",
  },
  filtersBar: {
    display: "flex",
    gap: 12,
    marginBottom: 20,
    flexWrap: "wrap",
    alignItems: "center",
  },
  filterInput: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.92)",
    fontSize: 14,
    minWidth: 180,
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
  tableWrapper: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "14px 16px",
    textAlign: "left",
    fontSize: 12,
    fontWeight: 700,
    color: "rgba(255,255,255,0.7)",
    borderBottom: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
  },
  tr: {
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  td: {
    padding: "14px 16px",
    fontSize: 13,
  },
  badge: {
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    display: "inline-block",
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
  },
  card: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 18,
    padding: 24,
    boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
  },
};
