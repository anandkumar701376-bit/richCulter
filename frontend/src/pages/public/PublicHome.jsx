import { useEffect, useState } from "react";

import { api } from "../../services/api";

import "./PublicHome.css";

import IndiaMap from "./IndiaMap";


export default function PublicHome({
  search,
  onSearchChange,
  onNavigate,
}) {
  const [states, setStates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [culturalItems, setCulturalItems] = useState([]);
  const [media, setMedia] = useState([]);

  const [loading, setLoading] = useState(true);

  // No state is selected when the page first opens.
  const [selectedState, setSelectedState] = useState(null);


  // =================================================
  // LOAD PUBLIC DATA
  // =================================================

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);

        const [
          statesData,
          categoriesData,
          itemsData,
          mediaData,
        ] = await Promise.all([
          api.getStates(),
          api.getCategories(),
          api.getCulturalItems(),
          api.getMedia(),
        ]);

        setStates(
          Array.isArray(statesData)
            ? statesData
            : []
        );

        setCategories(
          Array.isArray(categoriesData)
            ? categoriesData
            : []
        );

        setCulturalItems(
          Array.isArray(itemsData)
            ? itemsData
            : []
        );

        setMedia(
          Array.isArray(mediaData)
            ? mediaData
            : []
        );

      } catch (error) {
        console.error(
          "Failed to load public home data:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);


  // =================================================
  // HERO MEDIA
  // =================================================

  const heroMedia =
    media.find(
      (item) =>
        item.media_type === "image" &&
        item.media_url
    ) || media[0];


  // =================================================
  // SEARCH
  // =================================================

  const filteredItems = culturalItems
    .filter((item) => {
      const query = search
        .toLowerCase()
        .trim();

      if (!query) {
        return true;
      }

      return (
        item.title
          ?.toLowerCase()
          .includes(query) ||
        item.description
          ?.toLowerCase()
          .includes(query)
      );
    })
    .slice(0, 6);


  // =================================================
  // SELECTED STATE CULTURAL ITEMS
  // =================================================

  const selectedStateItems = selectedState
    ? culturalItems.filter(
        (item) =>
          item.state_id === selectedState.id
      )
    : [];


  // =================================================
  // MEDIA FOR CULTURAL ITEM
  // =================================================

  function getItemMedia(itemId) {
    return (
      media.find(
        (item) =>
          item.cultural_item_id === itemId &&
          item.media_type === "image" &&
          item.media_url
      )?.media_url || null
    );
  }


  // =================================================
  // SELECT STATE
  // =================================================

  function handleStateSelect(state) {
    if (!state) {
      return;
    }

    setSelectedState(state);
  }


  // =================================================
  // CLEAR STATE
  // =================================================

  function handleBackToMap() {
    setSelectedState(null);
  }


  return (
    <div className="home-page">


      {/* =================================================
          HERO
          ================================================= */}

      <section
        className="culture-hero"
        style={
          heroMedia?.media_url
            ? {
                backgroundImage: `
                  linear-gradient(
                    90deg,
                    rgba(5, 35, 63, 0.88),
                    rgba(5, 55, 88, 0.55),
                    rgba(5, 55, 88, 0.18)
                  ),
                  url("${heroMedia.media_url}")
                `,
              }
            : undefined
        }
      >

        <div className="hero-content">

          <span className="hero-label">
            INDIA • CULTURE • HERITAGE
          </span>

          <h1>
            Discover the Rich
            <br />
            Cultural Heritage
            <br />
            of India
          </h1>

          <p>
            Explore every state and union territory
            through its unique traditions, festivals,
            art, food, people and more.
          </p>

          <button
            className="hero-button"
            onClick={() =>
              onNavigate("explore")
            }
          >
            Explore India
            <span>→</span>
          </button>

        </div>

      </section>


      {/* =================================================
          EXPLORATION AREA
          ================================================= */}

      <section className="explore-section">

        <div className="section-heading">

          <div>

            <span>
              EXPLORE
            </span>

            <h2>
              Explore India
            </h2>

            <p>
              Discover cultural heritage from every
              state and union territory.
            </p>

          </div>

          <button
            className="view-all-button"
            onClick={() =>
              onNavigate("states")
            }
          >
            View All States →
          </button>

        </div>


        {/* =================================================
            INDIA CULTURE EXPLORER

            BEFORE SELECTION:
            map centered

            AFTER SELECTION:
            content left + map right
            ================================================= */}

        <div
          className={`culture-explorer ${
            selectedState
              ? "has-selected-state"
              : "no-selected-state"
          }`}
        >


          {/* =================================================
              STATE CULTURE PANEL
              ================================================= */}

          <div className="state-culture-panel">

            {!selectedState ? (

              <div className="state-empty-panel">

                <div className="empty-map-icon">
                  🗺️
                </div>

                <span className="empty-panel-label">
                  EXPLORE INDIA
                </span>

                <h3>
                  Discover India's
                  <br />
                  Cultural Heritage
                </h3>

                <p>
                  Select any state or union territory
                  on the map to discover its unique
                  traditions, festivals, food, arts,
                  music and heritage.
                </p>

              </div>

            ) : (

              <div className="selected-state-panel">

                <button
                  className="back-to-map-button"
                  onClick={handleBackToMap}
                >
                  ← Back to India Map
                </button>


                <span className="selected-state-label">
                  SELECTED STATE
                </span>


                <div className="selected-state-title-row">

                  <div className="selected-state-symbol">
                    {selectedState.code || "IN"}
                  </div>

                  <div>

                    <h3>
                      {selectedState.name}
                    </h3>

                    <span>
                      Indian State / Union Territory
                    </span>

                  </div>

                </div>


                <p className="selected-state-description">
                  {selectedState.description ||
                    `Explore the cultural heritage and traditions of ${selectedState.name}.`}
                </p>


                {/* =================================================
                    CULTURAL ITEMS
                    ================================================= */}

                <div className="state-items-section">

                  <div className="state-items-heading">

                    <h4>
                      Cultural Heritage
                    </h4>

                    <span>
                      {selectedStateItems.length} entries
                    </span>

                  </div>


                  {selectedStateItems.length > 0 ? (

                    <div className="state-cultural-items">

                      {selectedStateItems
                        .slice(0, 4)
                        .map((item) => {

                          const itemImage =
                            getItemMedia(item.id);

                          return (
                            <article
                              className="state-cultural-card"
                              key={item.id}
                            >

                              <div className="state-cultural-image">

                                {itemImage ? (

                                  <img
                                    src={itemImage}
                                    alt={item.title}
                                  />

                                ) : (

                                  <div className="no-item-image">
                                    ◆
                                  </div>

                                )}

                              </div>


                              <div className="state-cultural-info">

                                <span>
                                  CULTURAL HERITAGE
                                </span>

                                <h5>
                                  {item.title}
                                </h5>

                                <p>
                                  {item.description ||
                                    "Discover this cultural heritage."}
                                </p>

                              </div>

                            </article>
                          );
                        })}

                    </div>

                  ) : (

                    <div className="no-state-items">

                      <div>
                        ◆
                      </div>

                      <p>
                        Cultural heritage entries
                        for {selectedState.name}
                        will appear here.
                      </p>

                    </div>

                  )}

                </div>

              </div>

            )}

          </div>


          {/* =================================================
              INDIA MAP
              ================================================= */}

          <div className="india-map-card">

            <div className="map-header">

              <div>

                <h3>
                  🇮🇳 India
                </h3>

                <p>
                  {selectedState
                    ? `Exploring ${selectedState.name}`
                    : "Select a state or UT to discover its cultural heritage."}
                </p>

              </div>


              <div className="compass">

                N
                <br />
                ◈

              </div>

            </div>


            <div className="map-display">

              <IndiaMap
                states={states}
                selectedState={selectedState}
                onStateSelect={handleStateSelect}
              />


              <div className="map-caption">

                {states.length > 0
                  ? `${states.length} States & Union Territories`
                  : "Loading States & Union Territories..."}

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          CULTURAL ITEMS
          ================================================= */}

      <section className="heritage-section">

        <div className="section-heading">

          <div>

            <span>
              HERITAGE
            </span>

            <h2>
              Discover Cultural Heritage
            </h2>

            <p>
              Explore traditions and cultural knowledge
              preserved through Rich Culture.
            </p>

          </div>

        </div>


        {filteredItems.length > 0 ? (

          <div className="heritage-grid">

            {filteredItems.map((item) => {

              const itemImage =
                getItemMedia(item.id);

              return (
                <article
                  className="heritage-card"
                  key={item.id}
                >

                  <div className="heritage-card-image">

                    {itemImage ? (

                      <img
                        src={itemImage}
                        alt={item.title}
                      />

                    ) : (

                      <div>
                        ◆
                      </div>

                    )}

                  </div>


                  <div className="heritage-card-content">

                    <span>
                      CULTURAL HERITAGE
                    </span>

                    <h3>
                      {item.title}
                    </h3>

                    <p>
                      {item.description ||
                        "Discover this cultural heritage entry."}
                    </p>

                  </div>

                </article>
              );

            })}

          </div>

        ) : (

          <div className="no-results">

            {search
              ? `No cultural items found for "${search}".`
              : loading
              ? "Loading cultural heritage..."
              : "Cultural heritage entries will appear here."}

          </div>

        )}

      </section>


      {/* =================================================
          STATISTICS
          ================================================= */}

      <section className="statistics-section">

        <div className="stat-card">

          <div className="stat-icon blue">
            ◎
          </div>

          <div>

            <strong>
              {states.length}
            </strong>

            <span>
              States & UTs
            </span>

          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon purple">
            ▦
          </div>

          <div>

            <strong>
              {categories.length}
            </strong>

            <span>
              Cultural Categories
            </span>

          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon green">
            ◈
          </div>

          <div>

            <strong>
              {culturalItems.length}
            </strong>

            <span>
              Heritage Entries
            </span>

          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon orange">
            ▣
          </div>

          <div>

            <strong>
              {media.length}
            </strong>

            <span>
              Media Assets
            </span>

          </div>

        </div>

      </section>

    </div>
  );
}

