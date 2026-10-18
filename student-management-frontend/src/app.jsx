import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import StudentManagement from "./components/StudentManagement";
import Register from "./pages/Register";
import Login from "./pages/Login";

// ==========================================
// PROTECTED ROUTE
// ==========================================

function ProtectedRoute({ children }) {
  let user = null;

  try {
    user = JSON.parse(sessionStorage.getItem("studentUser") || "null");
  } catch {
    user = null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// ==========================================
// APP
// ==========================================

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root → Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Protected (login ke baad) */}
        <Route
          path="/students"
          element={
            <ProtectedRoute>
              <StudentManagement />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}