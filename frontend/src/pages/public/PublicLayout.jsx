import { useState } from "react";

import PublicHome from "./PublicHome";
import CulturalItemDetail from "./CulturalItemDetail";
import ExploreIndia from "./ExploreIndia";
import States from "./States";
import CulturalCategories from "./CulturalCategories";
import SearchResults from "./SearchResults";
import Community from "./Community";
import About from "./About";

import "./PublicLayout.css";


export default function PublicLayout() {
  const [activePage, setActivePage] = useState("home");
  const [search, setSearch] = useState("");

  // Stores the selected cultural item.
  const [selectedData, setSelectedData] = useState(null);

  // Stores the state that the user was exploring
  // before opening the cultural item.
  const [returnState, setReturnState] = useState(null);


  // =================================================
  // NAVIGATION
  // =================================================

  function handleNavigation(page, data = null) {

    // -----------------------------------------------
    // OPEN CULTURAL ITEM
    // -----------------------------------------------

    if (page === "cultural-item") {

      /*
        data now contains:

        {
          item: cultural item,
          returnState: selected state
        }
      */

      setSelectedData(data?.item || null);

      setReturnState(data?.returnState || null);

      setActivePage("cultural-item");

      return;
    }


    // -----------------------------------------------
    // RETURN TO HOME / MAP
    // -----------------------------------------------

    if (page === "home") {

      setActivePage("home");

      /*
        IMPORTANT:
        Do not clear returnState here.

        PublicHome will receive it and restore
        the previously selected state.
      */

      return;
    }


    // -----------------------------------------------
    // NORMAL NAVIGATION
    // -----------------------------------------------

    setActivePage(page);
    setSelectedData(data);
  }


  // =================================================
  // OPEN DATA ENTRY
  // =================================================

  function openDataEntry() {
    window.location.hash = "data-entry";
    window.location.reload();
  }


  // =================================================
  // RENDER PAGE
  // =================================================

  function renderPage() {

    switch (activePage) {

      // =================================================
      // HOME
      // =================================================

      case "home":
        return (
          <PublicHome
            search={search}
            onSearchChange={setSearch}
            onNavigate={handleNavigation}

            // Restore previously selected state
            initialSelectedState={returnState}
          />
        );


      // =================================================
      // CULTURAL ITEM DETAIL
      // =================================================

      case "cultural-item":
        return (
          <CulturalItemDetail
            item={selectedData}

            onNavigate={handleNavigation}

            // Tell detail page where to return
            returnState={returnState}
          />
        );


      // =================================================
      // EXPLORE INDIA
      // =================================================

      case "explore":
  return (
    <ExploreIndia
      search={search}
      onNavigate={handleNavigation}
    />
  );

      // =================================================
      // STATES
      // =================================================

      case "states":
  return (
    <States
      search={search}
      onNavigate={handleNavigation}
    />
  );


      // =================================================
      // CATEGORIES
      // =================================================

      case "categories":
  return (
    <CulturalCategories
      search={search}
      onNavigate={handleNavigation}
    />
  );

    //====================================================
    // SEARCH
    //====================================================
    case "search":
  return (
    <SearchResults
      search={search}
      onNavigate={handleNavigation}
    />
  );


      // =================================================
      // COMMUNITY
      // =================================================

      case "community":
  return (
    <Community
      onNavigate={handleNavigation}
    />
  );

      // =================================================
      // ABOUT
      // =================================================

      case "about":
  return (
    <About
      onNavigate={handleNavigation}
    />
  );

      // =================================================
      // DEFAULT
      // =================================================

      default:
        return (
          <PublicHome
            search={search}
            onSearchChange={setSearch}
            onNavigate={handleNavigation}
            initialSelectedState={returnState}
          />
        );
    }
  }


  // =================================================
  // MAIN UI
  // =================================================

  return (
    <div className="public-app">


      {/* =================================================
          TOP HEADER
          ================================================= */}

      <header className="public-header">

        <div
          className="public-brand"
          onClick={() =>
            handleNavigation("home")
          }
        >

          <div className="brand-flower">
            🌸
          </div>

          <div className="brand-text">

            <h1>
              Rich Culture
            </h1>

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
  onKeyDown={(event) => {
    if (
      event.key === "Enter" &&
      search.trim()
    ) {
      handleNavigation("search");
    }
  }}
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


        {/* =================================================
            SIDEBAR
            ================================================= */}

        <aside className="public-sidebar">

          <nav className="public-navigation">


            {/* HOME */}

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

              <span>
                ⌂
              </span>

              <strong>
                Home
              </strong>

            </button>


            {/* EXPLORE INDIA */}

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

              <span>
                ♡
              </span>

              <strong>
                Explore India
              </strong>

            </button>


            {/* STATES */}

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

              <span>
                ◎
              </span>

              <strong>
                States & UTs
              </strong>

            </button>


            {/* CATEGORIES */}

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

              <span>
                ▦
              </span>

              <strong>
                Cultural Categories
              </strong>

            </button>


            {/* COMMUNITY */}

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

              <span>
                ♧
              </span>

              <strong>
                Community
              </strong>

            </button>


            {/* ABOUT */}

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

              <span>
                ⓘ
              </span>

              <strong>
                About Us
              </strong>

            </button>

          </nav>


          {/* =================================================
              SIDEBAR FOOTER
              ================================================= */}

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


        {/* =================================================
            CONTENT
            ================================================= */}

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

        <span>
          │
        </span>

        <span>
          Digital Indian Cultural Heritage Platform
        </span>

        <span>
          │
        </span>

        <span>
          SIH Project
        </span>

        <div className="footer-tagline">
          Many Cultures&nbsp;&nbsp;•&nbsp;&nbsp;One India
        </div>

      </footer>


      {/* =================================================
          DATA ENTRY ACCESS
          ================================================= */}

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