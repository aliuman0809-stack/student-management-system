import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';

const API_URL = "https://student-management-system-q764.onrender.com/api/auth";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ||
          data.message ||
          data.error ||
          data.title ||
          (response.status === 401
            ? "Invalid email or password."
            : `Login failed (${response.status}).`)
        );
      }

      sessionStorage.setItem(
        "studentUser",
        JSON.stringify({
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
        })
      );

      navigate("/students");
    } catch (err) {
      if (err instanceof TypeError) {
        setError("Cannot connect to the server. The backend might be waking up. Please try again in 1 minute.");
      } else {
        setError(err.message || "Login failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Welcome Back</h1>
        <p className="auth-subtitle">
          Sign in to your Student Management account.
        </p>

        {error && (
          <div className="auth-message error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email Address</label>
          <input
            id="login-email"
            name="email"
            type="email"
            placeholder="Enter your registered email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging In..." : "Login"}
          </button>
        </form>

        {/* GOOGLE LOGIN BUTTON */}
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '10px' }}>Or continue with</p>
          <GoogleLogin
            onSuccess={() => {
              // Seedha backend ke Google login URL par bhej dein
              window.location.href = "https://student-management-system-q764.onrender.com/oauth2/authorization/google";
            }}
            onError={() => setError("Google Login Failed.")}
            shape="pill"
            theme="filled_blue"
          />
        </div>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </section>
    </main>
  );
}