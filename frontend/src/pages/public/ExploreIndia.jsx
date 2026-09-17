import { useEffect, useMemo, useState } from "react";

import { api } from "../../services/api";

import "./ExploreIndia.css";


export default function ExploreIndia({
  search,
  onNavigate,
}) {
  const [items, setItems] = useState([]);
  const [states, setStates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [media, setMedia] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("all");


  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    async function loadExploreData() {
      try {
        setLoading(true);
        setError("");

        const [
          itemsData,
          statesData,
          categoriesData,
          mediaData,
        ] = await Promise.all([
          api.getCulturalItems({
            page: 1,
            limit: 100,
          }),
          api.getStates(),
          api.getCategories(),
          api.getMedia(),
        ]);

        setItems(
          Array.isArray(itemsData?.items)
            ? itemsData.items
            : Array.isArray(itemsData)
            ? itemsData
            : []
        );

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

        setMedia(
          Array.isArray(mediaData)
            ? mediaData
            : []
        );

      } catch (err) {
        console.error(
          "Failed to load Explore India data:",
          err
        );

        setError(
          err.message ||
          "Unable to load cultural heritage."
        );

      } finally {
        setLoading(false);
      }
    }

    loadExploreData();
  }, []);


  // =====================================================
  // STATE / CATEGORY HELPERS
  // =====================================================

  function getStateName(stateId) {
    const state = states.find(
      (stateItem) =>
        stateItem.id === stateId
    );

    return state?.name || "India";
  }


  function getCategoryName(categoryId) {
    const category = categories.find(
      (categoryItem) =>
        categoryItem.id === categoryId
    );

    return category?.name || "Cultural Heritage";
  }


  function getItemImage(itemId) {
    return (
      media.find(
        (mediaItem) =>
          mediaItem.cultural_item_id === itemId &&
          mediaItem.media_type === "image" &&
          mediaItem.media_url
      )?.media_url || null
    );
  }


  // =====================================================
  // SEARCH + CATEGORY FILTER
  // =====================================================

  const filteredItems = useMemo(() => {

    const query =
      search?.toLowerCase().trim() || "";

    return items.filter((item) => {

      // -----------------------------
      // CATEGORY FILTER
      // -----------------------------

      if (
        selectedCategory !== "all" &&
        item.category_id !== selectedCategory
      ) {
        return false;
      }


      // -----------------------------
      // SEARCH
      // -----------------------------

      if (!query) {
        return true;
      }

      const stateName =
        getStateName(item.state_id);

      const categoryName =
        getCategoryName(item.category_id);

      return (
        item.title
          ?.toLowerCase()
          .includes(query) ||

        item.description
          ?.toLowerCase()
          .includes(query) ||

        stateName
          .toLowerCase()
          .includes(query) ||

        categoryName
          .toLowerCase()
          .includes(query)
      );

    });

  }, [
    items,
    states,
    categories,
    search,
    selectedCategory,
  ]);


  // =====================================================
  // OPEN CULTURAL ITEM
  // =====================================================

  function openCulturalItem(item) {

    if (!item) {
      return;
    }

    const state = states.find(
      (stateItem) =>
        stateItem.id === item.state_id
    );

    const returnState = state
      ? {
          ...state,
          databaseId: state.id,
        }
      : null;

    onNavigate?.(
      "cultural-item",
      {
        item,
        returnState,
      }
    );
  }


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="explore-india-page">

        <div className="explore-loading">

          <div className="explore-loading-spinner" />

          <h2>
            Discovering India's Heritage...
          </h2>

          <p>
            Loading cultural heritage from PostgreSQL.
          </p>

        </div>

      </div>
    );
  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="explore-india-page">

        <section className="explore-error">

          <span>
            EXPLORE INDIA
          </span>

          <h1>
            Unable to load cultural heritage
          </h1>

          <p>
            {error}
          </p>

        </section>

      </div>
    );
  }


  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="explore-india-page">


      {/* =================================================
          HERO
          ================================================= */}

      <section className="explore-page-hero">

        <div>

          <span className="explore-page-label">
            EXPLORE INDIA
          </span>

          <h1>
            Discover India's
            <br />
            Cultural Heritage
          </h1>

          <p>
            Explore festivals, traditions, food,
            arts, music and cultural heritage from
            across India.
          </p>

        </div>


        <div className="explore-hero-stats">

          <div>
            <strong>
              {states.length}
            </strong>

            <span>
              States & UTs
            </span>
          </div>

          <div>
            <strong>
              {items.length}
            </strong>

            <span>
              Heritage Entries
            </span>
          </div>

        </div>

      </section>


      {/* =================================================
          FILTER AREA
          ================================================= */}

      <section className="explore-filter-section">

        <div className="explore-filter-top">

          <div>

            <span>
              BROWSE HERITAGE
            </span>

            <h2>
              Explore Cultural Knowledge
            </h2>

          </div>

          <div className="explore-result-count">
            {filteredItems.length} entries
          </div>

        </div>


        {/* CATEGORY FILTER */}

        <div className="explore-category-filters">

          <button
            className={
              selectedCategory === "all"
                ? "active"
                : ""
            }
            onClick={() =>
              setSelectedCategory("all")
            }
          >
            All
          </button>


          {categories.map((category) => (

            <button
              key={category.id}
              className={
                selectedCategory === category.id
                  ? "active"
                  : ""
              }
              onClick={() =>
                setSelectedCategory(category.id)
              }
            >
              {category.name}
            </button>

          ))}

        </div>

      </section>


      {/* =================================================
          SEARCH RESULT MESSAGE
          ================================================= */}

      {search?.trim() && (

        <div className="explore-search-result">

          Searching for:

          <strong>
            {" "}
            "{search}"
          </strong>

        </div>

      )}


      {/* =================================================
          CULTURAL GRID
          ================================================= */}

      {filteredItems.length > 0 ? (

        <section className="explore-cultural-grid">

          {filteredItems.map((item) => {

            const image =
              getItemImage(item.id);

            const stateName =
              getStateName(item.state_id);

            const categoryName =
              getCategoryName(item.category_id);


            return (

              <article
                className="explore-cultural-card"
                key={item.id}
                tabIndex={0}
                role="button"
                aria-label={`Explore ${item.title}`}
                onClick={() =>
                  openCulturalItem(item)
                }
                onKeyDown={(event) => {

                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {

                    event.preventDefault();

                    openCulturalItem(item);
                  }

                }}
              >


                {/* IMAGE */}

                <div className="explore-card-image">

                  {image ? (

                    <img
                      src={image}
                      alt={item.title}
                    />

                  ) : (

                    <div className="explore-card-image-empty">
                      ◆
                    </div>

                  )}

                  <span className="explore-card-category">
                    {categoryName}
                  </span>

                </div>


                {/* CONTENT */}

                <div className="explore-card-content">

                  <span className="explore-card-location">
                    📍 {stateName}
                  </span>

                  <h3>
                    {item.title}
                  </h3>

                  <p>
                    {item.description ||
                      "Discover this cultural heritage of India."}
                  </p>

                  <div className="explore-card-link">
                    Explore Heritage
                    <span>
                      →
                    </span>
                  </div>

                </div>

              </article>

            );

          })}

        </section>

      ) : (

        <section className="explore-no-results">

          <div>
            ◆
          </div>

          <h2>
            No cultural heritage found
          </h2>

          <p>
            Try another search or select a
            different cultural category.
          </p>

          <button
            onClick={() => {
              setSelectedCategory("all");
            }}
          >
            View All Heritage
          </button>

        </section>

      )}

    </div>
  );
}