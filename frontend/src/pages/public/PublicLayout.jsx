import { useState } from "react";

import PublicHome from "./PublicHome";

import "./PublicLayout.css";



export default function PublicLayout() {
  const [activePage, setActivePage] = useState("home");
  const [search, setSearch] = useState("");

  function handleNavigation(page) {
    setActivePage(page);
  }

  function openDataEntry() {
    window.location.hash = "data-entry";
    window.location.reload();
  }

  function renderPage() {
    switch (activePage) {
      case "home":
        return (
          <PublicHome
            search={search}
            onSearchChange={setSearch}
            onNavigate={handleNavigation}
          />
        );

      case "explore":
        return (
          <div className="public-placeholder">
            <span>EXPLORE INDIA</span>
            <h1>Interactive India Explorer</h1>
            <p>
              The interactive India map will be connected here next.
            </p>
          </div>
        );

      case "states":
        return (
          <div className="public-placeholder">
            <span>STATES & UTs</span>
            <h1>Explore States & Union Territories</h1>
            <p>
              State exploration will be connected to the database next.
            </p>
          </div>
        );

      case "categories":
        return (
          <div className="public-placeholder">
            <span>CULTURAL CATEGORIES</span>
            <h1>Explore India's Cultural Categories</h1>
            <p>
              Category exploration will be connected to the database next.
            </p>
          </div>
        );

      case "community":
        return (
          <div className="public-placeholder">
            <span>COMMUNITY</span>
            <h1>Community</h1>
            <p>
              Community features will be added later.
            </p>
          </div>
        );

      case "about":
        return (
          <div className="public-placeholder">
            <span>ABOUT RICH CULTURE</span>
            <h1>India's Cultural Heritage</h1>
            <p>
              Rich Culture is a digital platform for discovering,
              preserving and celebrating India's cultural heritage.
            </p>
          </div>
        );

      default:
        return (
          <PublicHome
            search={search}
            onSearchChange={setSearch}
            onNavigate={handleNavigation}
          />
        );
    }
  }

  return (
    <div className="public-app">

      {/* =================================================
          TOP HEADER
          ================================================= */}

      <header className="public-header">

        <div
          className="public-brand"
          onClick={() => handleNavigation("home")}
        >
          <div className="brand-flower">
            🌸
          </div>

          <div className="brand-text">
            <h1>Rich Culture</h1>

            <span>
              Explore · Preserve · Celebrate India's Heritage
            </span>
          </div>
        </div>

        {/* SEARCH */}

        <div className="public-search">

          <span className="search-icon">
            ⌕
          </span>

          <input
            type="text"
            placeholder="Search state, culture, festival, tradition..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>

        {/* GUEST */}

        <div className="guest-profile">

          <div className="guest-avatar">
            ◉
          </div>

          <span>
            Guest
          </span>

          <span className="guest-arrow">
           ⌄
          </span>

        </div>

      </header>

      {/* =================================================
          MAIN AREA
          ================================================= */}

      <div className="public-body">

        {/* SIDEBAR */}

        <aside className="public-sidebar">

          <nav className="public-navigation">

            <button
              className={`public-nav-item ${
                activePage === "home"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleNavigation("home")
              }
            >
              <span>⌂</span>
              <strong>Home</strong>
            </button>

            <button
              className={`public-nav-item ${
                activePage === "explore"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleNavigation("explore")
              }
            >
              <span>♡</span>
              <strong>Explore India</strong>
            </button>

            <button
              className={`public-nav-item ${
                activePage === "states"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleNavigation("states")
              }
            >
              <span>◎</span>
              <strong>States & UTs</strong>
            </button>

            <button
              className={`public-nav-item ${
                activePage === "categories"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleNavigation("categories")
              }
            >
              <span>▦</span>
              <strong>Cultural Categories</strong>
            </button>

            <button
              className={`public-nav-item ${
                activePage === "community"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleNavigation("community")
              }
            >
              <span>♧</span>
              <strong>Community</strong>
            </button>

            <button
              className={`public-nav-item ${
                activePage === "about"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleNavigation("about")
              }
            >
              <span>ⓘ</span>
              <strong>About Us</strong>
            </button>

          </nav>

          {/* SIDEBAR FOOTER */}

          <div className="sidebar-culture-message">

            <div className="heritage-symbol">
              🕌
            </div>

            <div className="heritage-line">
              India's Culture
            </div>

            <div className="heritage-line">
              Our Pride
            </div>

            <div className="heritage-stripe">
              ━━━━━
            </div>

          </div>

        </aside>

        {/* CONTENT */}

        <main className="public-content">
          {renderPage()}
        </main>

      </div>

      {/* =================================================
          FOOTER
          ================================================= */}

      <footer className="public-footer">

        <span>
          Rich Culture
        </span>

        <span>│</span>

        <span>
          Digital Indian Cultural Heritage Platform
        </span>

        <span>│</span>

        <span>
          SIH Project
        </span>

        <div className="footer-tagline">
          Many Cultures&nbsp;&nbsp;•&nbsp;&nbsp;One India
        </div>

      </footer>

      {/* DATA ENTRY ACCESS */}

      <button
        className="data-entry-access"
        onClick={openDataEntry}
        title="Open Data Entry"
      >
        ⚙
      </button>

    </div>
  );
}