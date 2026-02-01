import { BrowserRouter, Routes, Route } from "react-router-dom";
import GenerateSummary from "./pages/GenerateSummary";
import Reports from "./pages/Reports";
import Header from "./components/Header";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background font-sans antialiased">
        <Header />
        <Routes>
          <Route path="/" element={<GenerateSummary />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
