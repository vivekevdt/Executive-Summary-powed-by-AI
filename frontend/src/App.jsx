import { BrowserRouter, Routes, Route } from "react-router-dom";
import GenerateSummary from "./pages/GenerateSummary";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Header from "./components/Header";
import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-background font-sans antialiased">
          <Header />
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/spe" element={<GenerateSummary />} />
              <Route path="/spe/reports" element={<Reports />} />
            </Route>
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
