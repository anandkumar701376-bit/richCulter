import { useState } from "react";

import Dashboard from "../pages/Dashboard/Dashboard";
import CulturalItems from "../pages/CulturalItems/CulturalItems";
import Media from "../pages/Media/Media";
import Sources from "../pages/Sources/Sources";
import States from "../pages/States/States";
import Categories from "../pages/Categories/Categories";

import "./DataEntryLayout.css";

export default function DataEntryLayout() {
  const [activePage, setActivePage] = useState("dashboard");

  const navigation = [
    { id: "dashboard", label: "Dashboard", icon: "⌂" },
    { id: "states", label: "States & UTs", icon: "◎" },
    { id: "categories", label: "Categories", icon: "◆" },
    { id: "cultural-items", label: "Cultural Items", icon: "◇" },
    { id: "media", label: "Media", icon: "▣" },
    { id: "sources", label: "Sources", icon: "◈" },
  ];

  function renderPage() {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;

      case "states":
        return <States />;

      case "categories":
        return <Categories />;

      case "cultural-items":
        return <CulturalItems />;

      case "media":
        return <Media />;

      case "sources":
        return <Sources />;

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

          <p className="navigation-title">
            WORKSPACE
          </p>

          {navigation.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${
                activePage === item.id ? "active" : ""
              }`}
              onClick={() =>
                setActivePage(item.id)
              }
            >
              <span className="nav-icon">
                {item.icon}
              </span>

              <span>
                {item.label}
              </span>
            </button>
          ))}

        </nav>

        <div className="sidebar-footer">

          <div className="status-dot" />

          <div>
            <strong>
              Backend Connected
            </strong>

            <span>
              FastAPI
            </span>
          </div>

        </div>

      </aside>

      <main className="main-content">

        <header className="topbar">

          <div>
            <span className="topbar-label">
              CULTURAL HERITAGE
            </span>

            <h2>
              Data Entry Workspace
            </h2>
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