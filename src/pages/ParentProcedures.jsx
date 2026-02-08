import { useEffect, useState } from "react";
import { api } from "../api";
import { hasRole } from "../auth";

export default function ParentProcedures({ studentId, go }) {
  const [procedures, setProcedures] = useState([]);
  const [procedureTypes, setProcedureTypes] = useState([]);
  const [student, setStudent] = useState(null);
  const [err, setErr] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    procedure_type: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [studentId]);

  const loadData = async () => {
    try {
      const [procData, typesData, students] = await Promise.all([
        api(`/parent/students/${studentId}/procedures`),
        api("/procedure-types"),
        api("/parent/students"),
      ]);
      setProcedures(procData);
      setProcedureTypes(typesData);
      const s = students.find((st) => st.student_id === studentId);
      setStudent(s);
    } catch (ex) {
      setErr(ex.message || "Error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.procedure_type) {
      setErr("Selecciona un tipo de trámite");
      return;
    }

    setSubmitting(true);
    setErr("");

    try {
      await api(`/parent/students/${studentId}/procedures`, {
        method: "POST",
        body: {
          student_id: studentId,
          procedure_type: formData.procedure_type,
          description: formData.description,
        },
      });
      setShowForm(false);
      setFormData({ procedure_type: "", description: "" });
      loadData();
    } catch (ex) {
      setErr(ex.message || "Error al crear trámite");
    } finally {
      setSubmitting(false);
    }
  };

  if (!hasRole("PADRE")) {
    return (
      <div style={styles.page}>
        <div style={styles.shell}>
          <div style={styles.card}>
            <h2>No autorizado</h2>
            <button onClick={() => go("/parent")} style={styles.btnPrimary}>
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getTypeName = (code) => {
    const t = procedureTypes.find((pt) => pt.code === code);
    return t ? t.name : code;
  };

  return (
    <div style={styles.page}>
      <div style={styles.bgGlow1} />
      <div style={styles.bgGlow2} />

      <div style={styles.shell}>
        <div style={styles.topbar}>
          <div>
            <button onClick={() => go("/parent")} style={styles.btnBack}>
              ← Volver al Dashboard
            </button>
            <h1 style={styles.h1}>
              Trámites de {student?.full_name || "..."}
            </h1>
            <p style={styles.sub}>Solicita constancias, certificados y otros documentos</p>
          </div>
          <button onClick={() => setShowForm(true)} style={styles.btnPrimary}>
            + Solicitar Trámite
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
              <h2 style={styles.modalTitle}>Solicitar Trámite</h2>
              <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Tipo de Trámite</label>
                  <select
                    value={formData.procedure_type}
                    onChange={(e) =>
                      setFormData({ ...formData, procedure_type: e.target.value })
                    }
                    style={styles.select}
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    {procedureTypes.map((t) => (
                      <option key={t.code} value={t.code}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.procedure_type && (
                  <div style={styles.typeInfo}>
                    {procedureTypes.find((t) => t.code === formData.procedure_type)?.description}
                  </div>
                )}

                <div style={styles.formGroup}>
                  <label style={styles.label}>Observaciones (opcional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    style={{ ...styles.input, minHeight: 80 }}
                    placeholder="Detalles adicionales de tu solicitud"
                  />
                </div>

                <div style={styles.formActions}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setFormData({ procedure_type: "", description: "" });
                      setErr("");
                    }}
                    style={styles.btnGhost}
                  >
                    Cancelar
                  </button>
                  <button type="submit" style={styles.btnPrimary} disabled={submitting}>
                    {submitting ? "Enviando..." : "Solicitar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div style={styles.grid}>
          {procedures.map((p) => (
            <div key={p.id} style={styles.procedureCard}>
              <div style={styles.cardHead}>
                <div>
                  <div style={styles.procedureType}>{getTypeName(p.procedure_type)}</div>
                  <div style={styles.procedureDate}>
                    Solicitado: {new Date(p.created_at).toLocaleDateString()}
                  </div>
                </div>
                <span style={{ ...styles.badge, ...badgeByStatus(p.status) }}>
                  {labelStatus(p.status)}
                </span>
              </div>

              {p.description && (
                <div style={styles.cardBody}>
                  <div style={styles.descLabel}>Observaciones:</div>
                  <div style={styles.descText}>{p.description}</div>
                </div>
              )}

              {p.notes && (
                <div style={styles.notesBox}>
                  <div style={styles.notesLabel}>Respuesta del colegio:</div>
                  <div style={styles.notesText}>{p.notes}</div>
                </div>
              )}

              {p.assigned_to_name && p.status !== "APROBADO" && p.status !== "RECHAZADO" && (
                <div style={styles.assignedInfo}>
                  Asignado a: {p.assigned_to_name}
                </div>
              )}

              {p.approved_at && (
                <div style={styles.approvedInfo}>
                  {p.status === "APROBADO" ? "Aprobado" : "Procesado"} el{" "}
                  {new Date(p.approved_at).toLocaleDateString()}
                  {p.approved_by_name && ` por ${p.approved_by_name}`}
                </div>
              )}
            </div>
          ))}

          {!procedures.length && (
            <div style={styles.emptyState}>
              <div style={styles.emptyTitle}>Sin trámites</div>
              <div style={styles.emptyText}>
                No hay trámites solicitados. Haz clic en "Solicitar Trámite" para crear uno.
              </div>
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
    maxWidth: 1040,
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
    gap: 16,
    flexWrap: "wrap",
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
  typeInfo: {
    padding: "10px 12px",
    borderRadius: 10,
    background: "rgba(99,102,241,0.1)",
    border: "1px solid rgba(99,102,241,0.2)",
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 16,
  },
  formActions: {
    display: "flex",
    gap: 12,
    justifyContent: "flex-end",
    marginTop: 24,
  },
  grid: {
    display: "grid",
    gap: 14,
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  },
  procedureCard: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
  },
  cardHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 14,
    padding: 16,
    borderBottom: "1px solid rgba(255,255,255,0.10)",
  },
  procedureType: {
    fontSize: 16,
    fontWeight: 700,
  },
  procedureDate: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
  },
  badge: {
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.3,
  },
  cardBody: {
    padding: 16,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  descLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 4,
  },
  descText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },
  notesBox: {
    padding: 16,
    background: "rgba(16,185,129,0.08)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  notesLabel: {
    fontSize: 11,
    color: "rgba(16,185,129,0.9)",
    marginBottom: 4,
    fontWeight: 700,
  },
  notesText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
  },
  assignedInfo: {
    padding: "10px 16px",
    fontSize: 12,
    color: "rgba(99,102,241,0.9)",
    background: "rgba(99,102,241,0.08)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  approvedInfo: {
    padding: "10px 16px",
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    background: "rgba(255,255,255,0.03)",
  },
  emptyState: {
    gridColumn: "1 / -1",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 18,
    padding: 40,
    textAlign: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
  },
  card: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 18,
    padding: 24,
    boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
  },
};
