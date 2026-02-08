import { useEffect, useState } from "react";
import { api } from "../api";
import { hasRole } from "../auth";

export default function AdminPrograms({ go }) {
  const [programs, setPrograms] = useState([]);
  const [err, setErr] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    google_classroom_id: "",
    google_classroom_link: "",
    is_active: true,
  });

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      const data = await api("/admin/programs");
      setPrograms(data);
    } catch (ex) {
      setErr(ex.message || "Error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      if (editingId) {
        await api(`/admin/programs/${editingId}`, {
          method: "PATCH",
          body: formData,
        });
      } else {
        await api("/admin/programs", {
          method: "POST",
          body: formData,
        });
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: "",
        description: "",
        google_classroom_id: "",
        google_classroom_link: "",
        is_active: true,
      });
      loadPrograms();
    } catch (ex) {
      setErr(ex.message || "Error al guardar");
    }
  };

  const handleEdit = (program) => {
    setEditingId(program.id);
    setFormData({
      name: program.name,
      description: program.description || "",
      google_classroom_id: program.google_classroom_id || "",
      google_classroom_link: program.google_classroom_link || "",
      is_active: program.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este programa?")) return;

    try {
      await api(`/admin/programs/${id}`, { method: "DELETE" });
      loadPrograms();
    } catch (ex) {
      setErr(ex.message || "Error al eliminar");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      google_classroom_id: "",
      google_classroom_link: "",
      is_active: true,
    });
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
            <h1 style={styles.h1}>Gestión de Programas/Cursos</h1>
            <p style={styles.sub}>Administra los programas educativos y su vinculación con Google Classroom</p>
          </div>
          <button onClick={() => setShowForm(true)} style={styles.btnPrimary}>
            + Nuevo Programa
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
                {editingId ? "Editar Programa" : "Nuevo Programa"}
              </h2>
              <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nombre del Programa *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    style={styles.input}
                    placeholder="Ej: Matemáticas 3er Grado"
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    style={{ ...styles.input, minHeight: 80 }}
                    placeholder="Descripción del programa"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>ID de Google Classroom</label>
                  <input
                    type="text"
                    value={formData.google_classroom_id}
                    onChange={(e) =>
                      setFormData({ ...formData, google_classroom_id: e.target.value })
                    }
                    style={styles.input}
                    placeholder="Ej: 123456789"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Link de Google Classroom</label>
                  <input
                    type="url"
                    value={formData.google_classroom_link}
                    onChange={(e) =>
                      setFormData({ ...formData, google_classroom_link: e.target.value })
                    }
                    style={styles.input}
                    placeholder="https://classroom.google.com/c/..."
                  />
                </div>

                {editingId && (
                  <div style={styles.formGroup}>
                    <label style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) =>
                          setFormData({ ...formData, is_active: e.target.checked })
                        }
                        style={styles.checkbox}
                      />
                      Programa activo
                    </label>
                  </div>
                )}

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

        <div style={styles.grid}>
          {programs.map((p) => (
            <div key={p.id} style={{ ...styles.programCard, opacity: p.is_active ? 1 : 0.6 }}>
              <div style={styles.cardHead}>
                <div>
                  <div style={styles.programName}>{p.name}</div>
                  <span style={{ ...styles.badge, ...(p.is_active ? styles.badgeActive : styles.badgeInactive) }}>
                    {p.is_active ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>

              {p.description && (
                <div style={styles.cardBody}>
                  <p style={styles.description}>{p.description}</p>
                </div>
              )}

              <div style={styles.classroomInfo}>
                {p.google_classroom_id && (
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Classroom ID:</span>
                    <span style={styles.infoValue}>{p.google_classroom_id}</span>
                  </div>
                )}
                {p.google_classroom_link && (
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Link:</span>
                    <a href={p.google_classroom_link} target="_blank" rel="noopener noreferrer" style={styles.link}>
                      Abrir en Classroom
                    </a>
                  </div>
                )}
                {!p.google_classroom_id && !p.google_classroom_link && (
                  <div style={styles.noClassroom}>Sin vinculación a Google Classroom</div>
                )}
              </div>

              <div style={styles.cardActions}>
                <button onClick={() => handleEdit(p)} style={styles.btnSmall}>
                  Editar
                </button>
                <button onClick={() => handleDelete(p.id)} style={styles.btnDanger}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}

          {!programs.length && (
            <div style={styles.emptyState}>
              <p>No hay programas registrados</p>
            </div>
          )}
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
    maxWidth: 1200,
    margin: "0 auto",
    padding: "34px 16px 64px",
    position: "relative",
    zIndex: 1,
  },
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    flexWrap: "wrap",
    gap: 16,
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
    borderRadius: 14,
    padding: "10px 16px",
    cursor: "pointer",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "rgba(255,255,255,0.92)",
  },
  btnSmall: {
    padding: "8px 14px",
    marginRight: 8,
    borderRadius: 8,
    border: "1px solid rgba(99,102,241,0.4)",
    background: "rgba(99,102,241,0.1)",
    color: "rgba(255,255,255,0.9)",
    cursor: "pointer",
    fontSize: 12,
  },
  btnDanger: {
    padding: "8px 14px",
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
    maxHeight: "90vh",
    overflowY: "auto",
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
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    cursor: "pointer",
  },
  checkbox: {
    width: 18,
    height: 18,
    cursor: "pointer",
  },
  formActions: {
    display: "flex",
    gap: 12,
    justifyContent: "flex-end",
    marginTop: 24,
  },
  grid: {
    display: "grid",
    gap: 16,
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  },
  programCard: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
  },
  cardHead: {
    padding: 16,
    borderBottom: "1px solid rgba(255,255,255,0.10)",
  },
  programName: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 8,
  },
  badge: {
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
  },
  badgeActive: {
    background: "rgba(16,185,129,0.14)",
    border: "1px solid rgba(16,185,129,0.28)",
    color: "rgba(236,253,245,0.92)",
  },
  badgeInactive: {
    background: "rgba(148,163,184,0.14)",
    border: "1px solid rgba(148,163,184,0.28)",
    color: "rgba(226,232,240,0.92)",
  },
  cardBody: {
    padding: 16,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  description: {
    margin: 0,
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 1.5,
  },
  classroomInfo: {
    padding: 16,
    background: "rgba(255,255,255,0.03)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
  infoValue: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    fontFamily: "monospace",
  },
  link: {
    fontSize: 12,
    color: "rgba(99,102,241,0.9)",
    textDecoration: "none",
  },
  noClassroom: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    fontStyle: "italic",
  },
  cardActions: {
    padding: 16,
    display: "flex",
    gap: 8,
  },
  emptyState: {
    gridColumn: "1 / -1",
    padding: 40,
    textAlign: "center",
    color: "rgba(255,255,255,0.5)",
    background: "rgba(255,255,255,0.06)",
    borderRadius: 18,
  },
  card: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 18,
    padding: 24,
    boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
  },
};
