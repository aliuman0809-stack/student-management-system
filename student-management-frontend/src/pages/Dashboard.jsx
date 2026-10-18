import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  let user = null;

  try {
    user = JSON.parse(sessionStorage.getItem("studentUser") || "null");
  } catch {
    user = null;
  }

  function logout() {
    sessionStorage.removeItem("studentUser");
    navigate("/login", { replace: true });
  }

  // Agar user login nahi hai
  if (!user) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <h1>Login Required</h1>
          <p>Please sign in to continue.</p>
          <Link to="/login">Go to Login</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-page">

      {/* ============ HEADER ============ */}
      <header className="dashboard-header">
        <div>
          <h1>Student Management System</h1>
          <p>Welcome, {user.name}!</p>
        </div>

        <button className="logout-button" onClick={logout}>
          Logout
        </button>
      </header>

      {/* ============ CONTENT ============ */}
      <section className="dashboard-content">
        <h2>Dashboard</h2>
        <p>You are signed in to the application.</p>

        <div className="dashboard-grid">

          {/* ---------- Profile Card ---------- */}
          <article className="dashboard-tile">
            <span className="tile-icon">👤</span>
            <h3>My Profile</h3>
            <p>{user.name}</p>
            <p>{user.email}</p>
          </article>

          {/* ---------- Role Card ---------- */}
          <article className="dashboard-tile">
            <span className="tile-icon">🎓</span>
            <h3>My Role</h3>
            <p>{user.role}</p>
          </article>

          {/* ---------- Students Card (Clickable) ---------- */}
          <Link
            to="/students"
            className="dashboard-tile"
            style={{
              textDecoration: "none",
              color: "inherit",
              display: "block",
              cursor: "pointer",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow =
                "0 14px 35px rgba(31, 55, 100, 0.10)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 8px 25px rgba(31, 55, 100, 0.04)";
            }}
          >
            <span className="tile-icon">📚</span>
            <h3>Students</h3>
            <p>Click here to manage all students →</p>
          </Link>

        </div>
      </section>

    </main>
  );
}