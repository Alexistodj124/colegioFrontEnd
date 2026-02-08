import { useState } from "react";
import Login from "./pages/Login";
import ParentDashboard from "./pages/ParentDashboard";
import ParentInvoices from "./pages/ParentInvoices";
import ParentProcedures from "./pages/ParentProcedures";
import AdminDashboard from "./pages/AdminDashboard";
import AdminStudents from "./pages/AdminStudents";
import AdminProcedures from "./pages/AdminProcedures";
import AdminInvoices from "./pages/AdminInvoices";
import AdminPrograms from "./pages/AdminPrograms";
import AdminUsers from "./pages/AdminUsers";
import AdminReports from "./pages/AdminReports";
import AdminAuditLogs from "./pages/AdminAuditLogs";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherProcedures from "./pages/TeacherProcedures";
import { isLoggedIn, hasRole } from "./auth";

function parseRoute(path) {
  const p = path || "/";

  if (p === "/" || p === "/login") return { page: "login" };
  if (p === "/parent") return { page: "parent" };

  const invoicesMatch = p.match(/^\/parent\/students\/(\d+)\/invoices$/);
  if (invoicesMatch) return { page: "parent_invoices", studentId: Number(invoicesMatch[1]) };

  const proceduresMatch = p.match(/^\/parent\/students\/(\d+)\/procedures$/);
  if (proceduresMatch) return { page: "parent_procedures", studentId: Number(proceduresMatch[1]) };

  if (p === "/admin") return { page: "admin" };
  if (p === "/admin/students") return { page: "admin_students" };
  if (p === "/admin/procedures") return { page: "admin_procedures" };
  if (p === "/admin/invoices") return { page: "admin_invoices" };
  if (p === "/admin/programs") return { page: "admin_programs" };
  if (p === "/admin/users") return { page: "admin_users" };
  if (p === "/admin/reports") return { page: "admin_reports" };
  if (p === "/admin/audit") return { page: "admin_audit" };

  if (p === "/teacher") return { page: "teacher" };
  if (p === "/teacher/procedures") return { page: "teacher_procedures" };

  return { page: "notfound" };
}

export default function App() {
  const [path, setPath] = useState(window.location.pathname);

  const go = (to) => {
    window.history.pushState({}, "", to);
    setPath(to);
  };

  window.onpopstate = () => setPath(window.location.pathname);

  const r = parseRoute(path);

  if (!isLoggedIn() && r.page !== "login") {
    return <Login onDone={go} />;
  }

  if (r.page === "login") return <Login onDone={go} />;
  if (r.page === "parent") return <ParentDashboard go={go} />;
  if (r.page === "parent_invoices") return <ParentInvoices studentId={r.studentId} go={go} />;
  if (r.page === "parent_procedures") return <ParentProcedures studentId={r.studentId} go={go} />;
  if (r.page === "admin") return <AdminDashboard go={go} />;
  if (r.page === "admin_students") return <AdminStudents go={go} />;
  if (r.page === "admin_procedures") return <AdminProcedures go={go} />;
  if (r.page === "admin_invoices") return <AdminInvoices go={go} />;
  if (r.page === "admin_programs") return <AdminPrograms go={go} />;
  if (r.page === "admin_users") return <AdminUsers go={go} />;
  if (r.page === "admin_reports") return <AdminReports go={go} />;
  if (r.page === "admin_audit") return <AdminAuditLogs go={go} />;
  if (r.page === "teacher") return <TeacherDashboard go={go} />;
  if (r.page === "teacher_procedures") return <TeacherProcedures go={go} />;

  const getDefaultRoute = () => {
    if (!isLoggedIn()) return "/login";
    if (hasRole("ADMIN")) return "/admin";
    if (hasRole("MAESTRO")) return "/teacher";
    if (hasRole("PADRE")) return "/parent";
    return "/login";
  };

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>404</h2>
      <button onClick={() => go(getDefaultRoute())} style={{ padding: 10, cursor: "pointer" }}>
        Ir al inicio
      </button>
    </div>
  );
}
