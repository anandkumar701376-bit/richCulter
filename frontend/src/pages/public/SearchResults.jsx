import { useEffect, useState } from "react";

import { api } from "../../services/api";

import "./SearchResults.css";


export default function SearchResults({
  search,
  onNavigate,
}) {
  const [results, setResults] = useState([]);

  const [states, setStates] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchedQuery, setSearchedQuery] = useState("");


  // =====================================================
  // LOAD STATES + CATEGORIES
  // =====================================================

  useEffect(() => {
    async function loadReferenceData() {
      try {
        const [
          statesData,
          categoriesData,
        ] = await Promise.all([
          api.getStates(),
          api.getCategories(),
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

      } catch (err) {
        console.error(
          "Failed to load search reference data:",
          err
        );
      }
    }

    loadReferenceData();
  }, []);


  // =====================================================
  // SEARCH
  // =====================================================

  useEffect(() => {

    const query =
      search?.trim() || "";

    if (!query) {
      setResults([]);
      setSearchedQuery("");
      setError("");
      return;
    }


    async function performSearch() {

      try {

        setLoading(true);
        setError("");

        const data =
          await api.search(query);

        setResults(
          Array.isArray(data?.items)
            ? data.items
            : []
        );

        setSearchedQuery(query);

      } catch (err) {

        console.error(
          "Search failed:",
          err
        );

        setResults([]);

        setError(
          err.message ||
          "Unable to perform search."
        );

      } finally {

        setLoading(false);

      }
    }

    performSearch();

  }, [search]);


  // =====================================================
  // GET STATE NAME
  // =====================================================

  function getStateName(stateId) {

    const state =
      states.find(
        (item) =>
          item.id === stateId
      );

    return state?.name || "India";
  }


  // =====================================================
  // GET CATEGORY NAME
  // =====================================================

  function getCategoryName(categoryId) {

    const category =
      categories.find(
        (item) =>
          item.id === categoryId
      );

    return category?.name || "Cultural Heritage";
  }


  // =====================================================
  // OPEN CULTURAL ITEM
  // =====================================================

  function openCulturalItem(item) {

    if (!item) {
      return;
    }

    const state =
      states.find(
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
  // EMPTY SEARCH
  // =====================================================

  if (!search?.trim()) {

    return (
      <div className="search-results-page">

        <section className="search-empty-state">

          <div className="search-empty-icon">
            🔎
          </div>

          <span>
            SEARCH RICH CULTURE
          </span>

          <h1>
            Discover India's Heritage
          </h1>

          <p>
            Search for festivals, traditions,
            arts, food, music and other cultural
            heritage.
          </p>

        </section>

      </div>
    );
  }


  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="search-results-page">


      {/* =================================================
          HEADER
          ================================================= */}

      <section className="search-results-header">

        <div>

          <span>
            SEARCH RESULTS
          </span>

          <h1>
            {loading
              ? "Searching..."
              : `Results for "${searchedQuery}"`}
          </h1>

          {!loading && !error && (
            <p>
              {results.length === 0
                ? "No cultural heritage entries found."
                : `${results.length} cultural heritage ${
                    results.length === 1
                      ? "entry"
                      : "entries"
                  } found.`}
            </p>
          )}

        </div>


        {!loading && !error && results.length > 0 && (

          <div className="search-result-count">

            <strong>
              {results.length}
            </strong>

            <span>
              Matches
            </span>

          </div>

        )}

      </section>


      {/* =================================================
          LOADING
          ================================================= */}

      {loading && (

        <div className="search-loading">

          <div className="search-spinner" />

          <h2>
            Searching cultural heritage...
          </h2>

          <p>
            Looking through the Rich Culture database.
          </p>

        </div>

      )}


      {/* =================================================
          ERROR
          ================================================= */}

      {!loading && error && (

        <div className="search-error">

          <span>
            SEARCH ERROR
          </span>

          <h2>
            Something went wrong
          </h2>

          <p>
            {error}
          </p>

        </div>

      )}


      {/* =================================================
          RESULTS
          ================================================= */}

      {!loading &&
        !error &&
        results.length > 0 && (

          <section className="search-results-list">

            {results.map((item) => (

              <article
                className="search-result-card"
                key={item.id}
                tabIndex={0}
                role="button"
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

                <div className="search-result-icon">
                  ◆
                </div>


                <div className="search-result-content">

                  <div className="search-result-meta">

                    <span>
                      {getStateName(
                        item.state_id
                      )}
                    </span>

                    <span>
                      {getCategoryName(
                        item.category_id
                      )}
                    </span>

                  </div>


                  <h2>
                    {item.title}
                  </h2>


                  <p>
                    {item.description ||
                      "Discover this cultural heritage entry."}
                  </p>

                </div>


                <div className="search-result-arrow">
                  →
                </div>

              </article>

            ))}

          </section>

        )}


      {/* =================================================
          NO RESULTS
          ================================================= */}

      {!loading &&
        !error &&
        results.length === 0 && (

          <section className="search-no-results">

            <div className="search-no-results-icon">
              🔎
            </div>

            <span>
              NO MATCHES
            </span>

            <h2>
              Nothing found for "{searchedQuery}"
            </h2>

            <p>
              Try another cultural name, festival,
              tradition, state or category.
            </p>

          </section>

        )}

    </div>
  );
}