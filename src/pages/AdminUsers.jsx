import { useEffect, useState } from "react";
import { api } from "../api";
import { hasRole, getUser } from "../auth";

export default function AdminUsers({ go }) {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [err, setErr] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    is_active: true,
    roles: [],
  });

  const currentUser = getUser();

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api("/admin/users");
      setUsers(data);
    } catch (ex) {
      setErr(ex.message || "Error");
    }
  };

  const loadRoles = async () => {
    try {
      const data = await api("/admin/roles");
      setRoles(data);
    } catch (ex) {
      console.error("Error loading roles:", ex);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      const body = {
        email: formData.email,
        full_name: formData.full_name,
        roles: formData.roles,
      };

      if (formData.password) {
        body.password = formData.password;
      }

      if (editingId) {
        body.is_active = formData.is_active;
        await api(`/admin/users/${editingId}`, {
          method: "PATCH",
          body,
        });
      } else {
        if (!formData.password) {
          setErr("La contraseña es requerida");
          return;
        }
        body.password = formData.password;
        await api("/admin/users", {
          method: "POST",
          body,
        });
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        email: "",
        password: "",
        full_name: "",
        is_active: true,
        roles: [],
      });
      loadUsers();
    } catch (ex) {
      setErr(ex.message || "Error al guardar");
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setFormData({
      email: user.email,
      password: "",
      full_name: user.full_name,
      is_active: user.is_active,
      roles: user.roles || [],
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (id === currentUser?.id) {
      setErr("No puedes eliminar tu propia cuenta");
      return;
    }
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;

    try {
      await api(`/admin/users/${id}`, { method: "DELETE" });
      loadUsers();
    } catch (ex) {
      setErr(ex.message || "Error al eliminar");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      email: "",
      password: "",
      full_name: "",
      is_active: true,
      roles: [],
    });
    setErr("");
  };

  const toggleRole = (roleName) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(roleName)
        ? prev.roles.filter((r) => r !== roleName)
        : [...prev.roles, roleName],
    }));
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
            <h1 style={styles.h1}>Gestión de Usuarios</h1>
            <p style={styles.sub}>Administra los usuarios del sistema y sus roles</p>
          </div>
          <button onClick={() => setShowForm(true)} style={styles.btnPrimary}>
            + Nuevo Usuario
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
                {editingId ? "Editar Usuario" : "Nuevo Usuario"}
              </h2>
              <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nombre Completo *</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    style={styles.input}
                    placeholder="Juan Pérez"
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    style={styles.input}
                    placeholder="usuario@colegio.com"
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Contraseña {editingId ? "(dejar vacío para no cambiar)" : "*"}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    style={styles.input}
                    placeholder="••••••••"
                    required={!editingId}
                    minLength={6}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Roles</label>
                  <div style={styles.rolesGrid}>
                    {roles.map((role) => (
                      <label key={role.id} style={styles.roleLabel}>
                        <input
                          type="checkbox"
                          checked={formData.roles.includes(role.name)}
                          onChange={() => toggleRole(role.name)}
                          style={styles.checkbox}
                        />
                        <span style={styles.roleName}>{role.name}</span>
                      </label>
                    ))}
                  </div>
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
                      Usuario activo
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

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Nombre</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Roles</th>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>Creado</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={styles.tr}>
                  <td style={styles.td}>{u.id}</td>
                  <td style={styles.td}>
                    {u.full_name}
                    {u.id === currentUser?.id && (
                      <span style={styles.youBadge}>(Tú)</span>
                    )}
                  </td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>
                    <div style={styles.rolesCell}>
                      {u.roles?.map((r) => (
                        <span key={r} style={styles.roleBadge}>
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, ...(u.is_active ? styles.badgeActive : styles.badgeInactive) }}>
                      {u.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td style={styles.td}>
                    <button onClick={() => handleEdit(u)} style={styles.btnSmall}>
                      Editar
                    </button>
                    {u.id !== currentUser?.id && (
                      <button onClick={() => handleDelete(u.id)} style={styles.btnDanger}>
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!users.length && (
            <div style={styles.emptyState}>
              <p>No hay usuarios registrados</p>
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
    maxWidth: 1400,
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
  rolesGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
  },
  roleLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.14)",
    cursor: "pointer",
  },
  roleName: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
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
  rolesCell: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
  },
  roleBadge: {
    padding: "3px 8px",
    borderRadius: 999,
    fontSize: 10,
    fontWeight: 700,
    background: "rgba(99,102,241,0.15)",
    border: "1px solid rgba(99,102,241,0.3)",
    color: "rgba(199,210,254,0.9)",
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
  youBadge: {
    marginLeft: 8,
    fontSize: 11,
    color: "rgba(99,102,241,0.9)",
    fontWeight: 600,
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
