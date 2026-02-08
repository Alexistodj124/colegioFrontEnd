import { useEffect, useState } from "react";
import { api } from "../api";
import { hasRole } from "../auth";

export default function TeacherProcedures({ go }) {
  const [procedures, setProcedures] = useState([]);
  const [students, setStudents] = useState([]);
  const [err, setErr] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    status: "PENDIENTE",
    notes: "",
  });

  useEffect(() => {
    loadProcedures();
    loadStudents();
  }, []);

  const loadProcedures = async () => {
    try {
      const data = await api("/teacher/procedures");
      setProcedures(data);
    } catch (ex) {
      setErr(ex.message || "Error");
    }
  };

  const loadStudents = async () => {
    // Los datos del estudiante ya vienen en student_name desde el backend
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      await api(`/teacher/procedures/${editingId}`, {
        method: "PATCH",
        body: { status: formData.status, notes: formData.notes },
      });
      setShowForm(false);
      setEditingId(null);
      setFormData({
        status: "PENDIENTE",
        notes: "",
      });
      loadProcedures();
    } catch (ex) {
      setErr(ex.message || "Error al guardar");
    }
  };

  const handleEdit = (procedure) => {
    setEditingId(procedure.id);
    setFormData({
      status: procedure.status,
      notes: procedure.notes || "",
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      status: "PENDIENTE",
      notes: "",
    });
    setErr("");
  };

  if (!hasRole("MAESTRO")) {
    return (
      <div style={styles.page}>
        <div style={styles.shell}>
          <div style={styles.card}>
            <h2>No autorizado</h2>
            <button onClick={() => go("/teacher")} style={styles.btnPrimary}>
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getStudentName = (procedure) => {
    return procedure.student_name || `ID: ${procedure.student_id}`;
  };

  return (
    <div style={styles.page}>
      <div style={styles.bgGlow1} />
      <div style={styles.bgGlow2} />

      <div style={styles.shell}>
        <div style={styles.topbar}>
          <div>
            <button onClick={() => go("/teacher")} style={styles.btnBack}>
              ← Volver al Dashboard
            </button>
            <h1 style={styles.h1}>Trámites Asignados</h1>
          </div>
        </div>

        {err && (
          <div style={styles.errorBox}>
            <span>⚠️</span>
            <span>{err}</span>
          </div>
        )}

        {showForm && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <h2 style={styles.modalTitle}>Actualizar Trámite</h2>
              <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Estado</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    style={styles.select}
                  >
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="EN_PROCESO">En Proceso</option>
                    <option value="APROBADO">Aprobado</option>
                    <option value="RECHAZADO">Rechazado</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Notas</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    style={{ ...styles.input, minHeight: 80 }}
                    placeholder="Notas sobre el trámite"
                  />
                </div>

                <div style={styles.formActions}>
                  <button type="button" onClick={handleCancel} style={styles.btnGhost}>
                    Cancelar
                  </button>
                  <button type="submit" style={styles.btnPrimary}>
                    Actualizar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Alumno</th>
                <th style={styles.th}>Tipo</th>
                <th style={styles.th}>Solicitado por</th>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>Fecha</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {procedures.map((p) => (
                <tr key={p.id} style={styles.tr}>
                  <td style={styles.td}>{p.id}</td>
                  <td style={styles.td}>{getStudentName(p)}</td>
                  <td style={styles.td}>{p.procedure_type}</td>
                  <td style={styles.td}>{p.requested_by_name || "—"}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, ...badgeByStatus(p.status) }}>
                      {labelStatus(p.status)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td style={styles.td}>
                    <button onClick={() => handleEdit(p)} style={styles.btnSmall}>
                      Procesar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!procedures.length && (
            <div style={styles.emptyState}>
              <p>No hay trámites asignados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function labelStatus(s) {
  const v = String(s || "").toUpperCase();
  if (v === "PENDIENTE") return "Pendiente";
  if (v === "EN_PROCESO") return "En Proceso";
  if (v === "APROBADO") return "Aprobado";
  if (v === "RECHAZADO") return "Rechazado";
  return v || "—";
}

function badgeByStatus(s) {
  const v = String(s || "").toUpperCase();
  if (v === "APROBADO") {
    return {
      background: "rgba(16,185,129,0.14)",
      border: "1px solid rgba(16,185,129,0.28)",
      color: "rgba(236,253,245,0.92)",
    };
  }
  if (v === "EN_PROCESO") {
    return {
      background: "rgba(59,130,246,0.14)",
      border: "1px solid rgba(59,130,246,0.28)",
      color: "rgba(219,234,254,0.92)",
    };
  }
  if (v === "RECHAZADO") {
    return {
      background: "rgba(239,68,68,0.14)",
      border: "1px solid rgba(239,68,68,0.28)",
      color: "rgba(254,242,242,0.92)",
    };
  }
  return {
    background: "rgba(245,158,11,0.14)",
    border: "1px solid rgba(245,158,11,0.28)",
    color: "rgba(255,251,235,0.92)",
  };
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  h1: { margin: "8px 0 0", fontSize: 24, letterSpacing: 0.2 },
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
    borderRadius: 14,
    padding: "10px 16px",
    cursor: "pointer",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "rgba(255,255,255,0.92)",
  },
  btnSmall: {
    padding: "6px 12px",
    marginRight: 8,
    borderRadius: 8,
    border: "1px solid rgba(99,102,241,0.4)",
    background: "rgba(99,102,241,0.1)",
    color: "rgba(255,255,255,0.9)",
    cursor: "pointer",
    fontSize: 12,
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
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    background: "rgba(15,23,42,0.98)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 18,
    padding: 24,
    maxWidth: 500,
    width: "90%",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
  },
  modalTitle: {
    margin: "0 0 20px",
    fontSize: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    display: "block",
    marginBottom: 6,
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.92)",
    fontSize: 14,
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "#1e293b",
    color: "rgba(255,255,255,0.92)",
    fontSize: 14,
    boxSizing: "border-box",
    cursor: "pointer",
  },
  formActions: {
    display: "flex",
    gap: 12,
    justifyContent: "flex-end",
    marginTop: 24,
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
    letterSpacing: 0.3,
    display: "inline-block",
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
