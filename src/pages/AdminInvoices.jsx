import { useEffect, useState } from "react";
import { api } from "../api";
import { hasRole } from "../auth";

export default function AdminInvoices({ go }) {
  const [invoices, setInvoices] = useState([]);
  const [students, setStudents] = useState([]);
  const [err, setErr] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    student_id: "",
    period: "",
    amount: "",
    payment_url: "",
    status: "PENDIENTE",
  });

  useEffect(() => {
    loadInvoices();
    loadStudents();
  }, []);

  const loadInvoices = async () => {
    try {
      const data = await api("/admin/invoices");
      setInvoices(data);
    } catch (ex) {
      setErr(ex.message || "Error");
    }
  };

  const loadStudents = async () => {
    try {
      const data = await api("/admin/students");
      setStudents(data);
    } catch (ex) {
      console.error("Error loading students:", ex);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      if (editingId) {
        await api(`/admin/invoices/${editingId}`, {
          method: "PATCH",
          body: { status: formData.status, payment_url: formData.payment_url },
        });
      } else {
        await api("/admin/invoices", {
          method: "POST",
          body: {
            student_id: parseInt(formData.student_id),
            period: formData.period,
            amount: parseFloat(formData.amount),
            payment_url: formData.payment_url,
          },
        });
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        student_id: "",
        period: "",
        amount: "",
        payment_url: "",
        status: "PENDIENTE",
      });
      loadInvoices();
    } catch (ex) {
      setErr(ex.message || "Error al guardar");
    }
  };

  const handleEdit = (invoice) => {
    setEditingId(invoice.id);
    setFormData({
      student_id: "",
      period: invoice.period,
      amount: invoice.amount,
      payment_url: invoice.payment_url,
      status: invoice.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar esta mensualidad?")) return;

    try {
      await api(`/admin/invoices/${id}`, { method: "DELETE" });
      loadInvoices();
    } catch (ex) {
      setErr(ex.message || "Error al eliminar");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      student_id: "",
      period: "",
      amount: "",
      payment_url: "",
      status: "PENDIENTE",
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

  const getStudentName = (studentId) => {
    const student = students.find((s) => s.id === studentId);
    return student ? student.full_name : `ID: ${studentId}`;
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
            <h1 style={styles.h1}>Gestión de Mensualidades</h1>
          </div>
          <button onClick={() => setShowForm(true)} style={styles.btnPrimary}>
            + Nueva Mensualidad
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
                {editingId ? "Actualizar Mensualidad" : "Nueva Mensualidad"}
              </h2>
              <form onSubmit={handleSubmit}>
                {!editingId && (
                  <>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Alumno</label>
                      <select
                        value={formData.student_id}
                        onChange={(e) =>
                          setFormData({ ...formData, student_id: e.target.value })
                        }
                        style={styles.select}
                        required
                      >
                        <option value="">Seleccionar alumno</option>
                        {students.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.full_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Periodo (YYYY-MM-DD)</label>
                      <input
                        type="date"
                        value={formData.period}
                        onChange={(e) =>
                          setFormData({ ...formData, period: e.target.value })
                        }
                        style={styles.input}
                        required
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Monto</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData({ ...formData, amount: e.target.value })
                        }
                        style={styles.input}
                        placeholder="Ej: 250.00"
                        required
                      />
                    </div>
                  </>
                )}

                <div style={styles.formGroup}>
                  <label style={styles.label}>URL de Pago (opcional)</label>
                  <input
                    type="url"
                    value={formData.payment_url}
                    onChange={(e) =>
                      setFormData({ ...formData, payment_url: e.target.value })
                    }
                    style={styles.input}
                    placeholder="Dejar vacío para usar link genérico"
                  />
                  <small style={styles.helpText}>
                    Si no se proporciona, se usará el link de pago genérico del colegio
                  </small>
                </div>

                {editingId && (
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
                      <option value="PAGADO">Pagado</option>
                    </select>
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

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Alumno</th>
                <th style={styles.th}>Periodo</th>
                <th style={styles.th}>Monto</th>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>Pagado</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} style={styles.tr}>
                  <td style={styles.td}>{inv.id}</td>
                  <td style={styles.td}>{getStudentName(inv.student_id)}</td>
                  <td style={styles.td}>{inv.period}</td>
                  <td style={styles.td}>${inv.amount.toFixed(2)}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, ...badgeByStatus(inv.status) }}>
                      {labelStatus(inv.status)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {inv.paid_at
                      ? new Date(inv.paid_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td style={styles.td}>
                    <button onClick={() => handleEdit(inv)} style={styles.btnSmall}>
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(inv.id)}
                      style={styles.btnDanger}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!invoices.length && (
            <div style={styles.emptyState}>
              <p>No hay mensualidades registradas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function labelStatus(s) {
  const v = String(s || "").toUpperCase();
  if (v === "PAGADO") return "Pagado";
  if (v === "PENDIENTE") return "Pendiente";
  return v || "—";
}

function badgeByStatus(s) {
  const v = String(s || "").toUpperCase();
  if (v === "PAGADO") {
    return {
      background: "rgba(16,185,129,0.14)",
      border: "1px solid rgba(16,185,129,0.28)",
      color: "rgba(236,253,245,0.92)",
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
  helpText: {
    display: "block",
    marginTop: 4,
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    fontStyle: "italic",
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
