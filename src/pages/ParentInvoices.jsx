import { useEffect, useState } from "react";
import { api } from "../api";
import { hasRole } from "../auth";

function fmtMonth(d) {
  const dt = new Date(d);
  return dt.toLocaleDateString("es-GT", { year: "numeric", month: "long" });
}

export default function ParentInvoices({ studentId, go }) {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await api(`/parent/students/${studentId}/invoices`);
        setRows(data);
      } catch (ex) {
        setErr(ex.message || "Error");
      }
    })();
  }, [studentId]);

  if (!hasRole("PADRE")) {
    return (
      <div style={styles.page}>
        <div style={styles.bgGlow1} />
        <div style={styles.bgGlow2} />
        <div style={styles.shell}>
          <div style={styles.card}>
            <h2 style={styles.h2}>No autorizado</h2>
            <p style={styles.p}>No tenés permisos para ver esta sección.</p>
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
        <div style={styles.topRow}>
          <button onClick={() => go("/parent")} style={styles.btnGhost}>
            ← Volver
          </button>
        </div>

        <div style={styles.header}>
          <h1 style={styles.h1}>Mensualidades</h1>
          <p style={styles.sub}>Detalle de pagos y estado de cuenta</p>
        </div>

        {err && (
          <div style={styles.errorBox}>
            <span>⚠️</span>
            <span>{err}</span>
          </div>
        )}

        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Mes</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Monto</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Estado</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={styles.tr}>
                  <td style={styles.td}>{fmtMonth(r.period)}</td>
                  <td style={{ ...styles.td, textAlign: "right", fontWeight: 700 }}>
                    Q {Number(r.amount).toFixed(2)}
                  </td>
                  <td style={{ ...styles.td, textAlign: "center" }}>
                    <span style={{ ...styles.badge, ...badgeByStatus(r.status) }}>
                      {r.status}
                    </span>
                    {r.paid_at && (
                      <div style={styles.paidAt}>
                        {new Date(r.paid_at).toLocaleDateString("es-GT")}
                      </div>
                    )}
                  </td>
                  <td style={{ ...styles.td, textAlign: "center" }}>
                    {r.status === "PENDIENTE" ? (
                      <button
                        onClick={() => window.open(r.payment_url, "_blank")}
                        style={styles.btnPrimary}
                      >
                        Ir a pagar →
                      </button>
                    ) : (
                      <span style={styles.ok}>✓</span>
                    )}
                  </td>
                </tr>
              ))}

              {!rows.length && (
                <tr>
                  <td colSpan="4" style={styles.empty}>
                    No hay mensualidades registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =======================
   Helpers de estado
======================= */
function badgeByStatus(s) {
  const v = String(s || "").toUpperCase();
  if (v === "PAGADO") {
    return {
      background: "rgba(16,185,129,0.15)",
      border: "1px solid rgba(16,185,129,0.35)",
      color: "rgba(236,253,245,0.95)",
    };
  }
  return {
    background: "rgba(245,158,11,0.15)",
    border: "1px solid rgba(245,158,11,0.35)",
    color: "rgba(255,251,235,0.95)",
  };
}

/* =======================
   Estilos
======================= */
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0b1220 0%, #0e1b2f 40%, #0b1220 100%)",
    color: "rgba(255,255,255,0.92)",
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
    position: "relative",
    overflow: "hidden",
  },
  bgGlow1: {
    position: "absolute",
    width: 600,
    height: 600,
    borderRadius: "50%",
    background:
      "radial-gradient(circle at 30% 30%, rgba(99,102,241,0.30), rgba(99,102,241,0) 60%)",
    top: -160,
    left: -160,
  },
  bgGlow2: {
    position: "absolute",
    width: 600,
    height: 600,
    borderRadius: "50%",
    background:
      "radial-gradient(circle at 70% 70%, rgba(16,185,129,0.22), rgba(16,185,129,0) 60%)",
    bottom: -180,
    right: -180,
  },
  shell: {
    maxWidth: 980,
    margin: "0 auto",
    padding: "36px 16px 64px",
    position: "relative",
    zIndex: 1,
  },
  topRow: { marginBottom: 16 },
  header: { marginBottom: 16 },
  h1: { margin: 0, fontSize: 22 },
  sub: { marginTop: 6, fontSize: 13, color: "rgba(255,255,255,0.68)" },

  tableCard: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
    backdropFilter: "blur(10px)",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: 14,
    fontSize: 13,
    textAlign: "left",
    color: "rgba(255,255,255,0.75)",
    borderBottom: "1px solid rgba(255,255,255,0.12)",
  },
  tr: {
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  td: {
    padding: 14,
    fontSize: 14,
  },
  badge: {
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.3,
    display: "inline-block",
  },
  paidAt: {
    fontSize: 11,
    marginTop: 4,
    color: "rgba(255,255,255,0.6)",
  },
  btnPrimary: {
    border: "none",
    borderRadius: 12,
    padding: "8px 14px",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
    color: "rgba(255,255,255,0.95)",
    background: "linear-gradient(135deg, rgba(99,102,241,1), rgba(16,185,129,1))",
    boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
  },
  btnGhost: {
    borderRadius: 12,
    padding: "8px 12px",
    cursor: "pointer",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "rgba(255,255,255,0.92)",
  },
  ok: {
    fontSize: 18,
    color: "rgba(16,185,129,0.95)",
  },
  errorBox: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    padding: "10px 12px",
    borderRadius: 14,
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.25)",
    marginBottom: 12,
  },
  empty: {
    padding: 20,
    textAlign: "center",
    color: "rgba(255,255,255,0.65)",
  },
  card: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 18,
    padding: 18,
  },
  h2: { margin: 0, marginBottom: 6 },
  p: { margin: 0, fontSize: 13, color: "rgba(255,255,255,0.7)" },
};
