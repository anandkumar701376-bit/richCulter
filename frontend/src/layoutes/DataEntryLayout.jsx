import { useState } from "react";
import Dashboard from "../pages/dashboard/Dashboard";
import "./DataEntryLayout.css";

export default function DataEntryLayout() {
  const [activePage, setActivePage] = useState("dashboard");

  const navigation = [
    { id: "dashboard", label: "Dashboard", icon: "¦" },
    { id: "cultural-items", label: "Cultural Items", icon: "?" },
    { id: "media", label: "Media", icon: "?" },
    { id: "sources", label: "Sources", icon: "?" },
  ];

  function renderPage() {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;

      case "cultural-items":
        return (
          <div className="coming-soon">
            <h2>Cultural Items</h2>
            <p>The cultural item data-entry screen is coming next.</p>
          </div>
        );

      case "media":
        return (
          <div className="coming-soon">
            <h2>Media</h2>
            <p>The media management screen is coming next.</p>
          </div>
        );

      case "sources":
        return (
          <div className="coming-soon">
            <h2>Sources</h2>
            <p>The source management screen is coming next.</p>
          </div>
        );

      default:
        return <Dashboard />;
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">C</div>
          <div>
            <h1>Culture</h1>
            <span>Data Entry</span>
          </div>
        </div>

        <nav className="navigation">
          <p className="navigation-title">WORKSPACE</p>

          {navigation.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${
                activePage === item.id ? "active" : ""
              }`}
              onClick={() => setActivePage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="status-dot" />
          <div>
            <strong>Backend Connected</strong>
            <span>FastAPI</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="topbar-label">CULTURAL HERITAGE</span>
            <h2>Data Entry Workspace</h2>
          </div>

          <div className="connection-status">
            <span className="status-dot" />
            API Online
          </div>
        </header>

        <section className="page-content">
          {renderPage()}
        </section>
      </main>
    </div>
  );
}
