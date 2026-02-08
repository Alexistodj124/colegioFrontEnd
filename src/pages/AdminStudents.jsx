import { useEffect, useState } from "react";
import { api } from "../api";
import { hasRole } from "../auth";

export default function AdminStudents({ go }) {
  const [students, setStudents] = useState([]);
  const [err, setErr] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ full_name: "", google_email: "", status: "VIGENTE" });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const data = await api("/admin/students");
      setStudents(data);
    } catch (ex) {
      setErr(ex.message || "Error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      if (editingId) {
        await api(`/admin/students/${editingId}`, { method: "PATCH", body: formData });
      } else {
        await api("/admin/students", { method: "POST", body: formData });
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ full_name: "", google_email: "", status: "VIGENTE" });
      loadStudents();
    } catch (ex) {
      setErr(ex.message || "Error al guardar");
    }
  };

  const handleEdit = (student) => {
    setEditingId(student.id);
    setFormData({
      full_name: student.full_name,
      google_email: student.google_email || "",
      status: student.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este alumno?")) return;

    try {
      await api(`/admin/students/${id}`, { method: "DELETE" });
      loadStudents();
    } catch (ex) {
      setErr(ex.message || "Error al eliminar");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ full_name: "", google_email: "", status: "VIGENTE" });
    setErr("");
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
            <h1 style={styles.h1}>Gestión de Alumnos</h1>
          </div>
          <button onClick={() => setShowForm(true)} style={styles.btnPrimary}>
            + Nuevo Alumno
          </button>
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
              <h2 style={styles.modalTitle}>
                {editingId ? "Editar Alumno" : "Nuevo Alumno"}
              </h2>
              <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nombre Completo</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Email Google</label>
                  <input
                    type="email"
                    value={formData.google_email}
                    onChange={(e) => setFormData({ ...formData, google_email: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Estado</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={styles.select}
                  >
                    <option value="VIGENTE">Vigente</option>
                    <option value="ATRASADO">Atrasado</option>
                    <option value="RETIRADO">Retirado</option>
                  </select>
                </div>

                <div style={styles.formActions}>
                  <button type="button" onClick={handleCancel} style={styles.btnGhost}>
                    Cancelar
                  </button>
                  <button type="submit" style={styles.btnPrimary}>
                    {editingId ? "Actualizar" : "Crear"}
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
                <th style={styles.th}>Nombre</th>
                <th style={styles.th}>Email Google</th>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>Fecha Creación</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} style={styles.tr}>
                  <td style={styles.td}>{s.id}</td>
                  <td style={styles.td}>{s.full_name}</td>
                  <td style={styles.td}>{s.google_email || "—"}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, ...badgeByStatus(s.status) }}>
                      {labelStatus(s.status)}
                    </span>
                  </td>
                  <td style={styles.td}>{new Date(s.created_at).toLocaleDateString()}</td>
                  <td style={styles.td}>
                    <button onClick={() => handleEdit(s)} style={styles.btnSmall}>
                      Editar
                    </button>
                    <button onClick={() => handleDelete(s.id)} style={styles.btnDanger}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!students.length && (
            <div style={styles.emptyState}>
              <p>No hay alumnos registrados</p>
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
  btnDanger: {
    padding: "6px 12px",
    borderRadius: 8,
    border: "1px solid rgba(239,68,68,0.4)",
    background: "rgba(239,68,68,0.1)",
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
