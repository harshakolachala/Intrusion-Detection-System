import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Alerts from "./pages/Alerts";
import Chatbot from "./pages/Chatbot";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <nav className="sidebar">
          <h2 className="sidebar-title">IDS Dashboard</h2>
          <NavLink to="/" end className="nav-link">Detection Feed</NavLink>
          <NavLink to="/alerts" className="nav-link">Alerts</NavLink>
          <NavLink to="/chatbot" className="nav-link">Explanations</NavLink>
          <NavLink to="/analytics" className="nav-link">Analytics</NavLink>
          <NavLink to="/settings" className="nav-link">Settings</NavLink>
        </nav>

        <main className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;