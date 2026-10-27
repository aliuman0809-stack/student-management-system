import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import StudentManagement from "./components/StudentManagement";
import Register from "./pages/Register";
import Login from "./pages/Login";
import OAuthSuccess from "./pages/OAuthSuccess"; // Naya Import

function ProtectedRoute({ children }) {
  let user = null;
  try {
    user = JSON.parse(sessionStorage.getItem("studentUser") || "null");
  } catch {
    user = null;
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        
        {/* Google Login ke baad wapas aane ka rasta */}
        <Route path="/oauth-success" element={<OAuthSuccess />} />

        <Route
          path="/students"
          element={
            <ProtectedRoute>
              <StudentManagement />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}