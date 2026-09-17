import { useEffect, useMemo, useState } from "react";

import { api } from "../../services/api";

import "./States.css";


export default function States({
  search,
  onNavigate,
}) {
  const [states, setStates] = useState([]);
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedState, setSelectedState] = useState(null);
  const [selectedStateItems, setSelectedStateItems] =
    useState([]);

  const [stateItemsLoading, setStateItemsLoading] =
    useState(false);


  // =====================================================
  // LOAD STATES + CULTURAL ITEMS
  // =====================================================

  useEffect(() => {
    async function loadStatesData() {
      try {
        setLoading(true);
        setError("");

        const [
          statesData,
          itemsData,
        ] = await Promise.all([
          api.getStates(),
          api.getCulturalItems({
            page: 1,
            limit: 100,
          }),
        ]);

        setStates(
          Array.isArray(statesData)
            ? statesData
            : []
        );

        setItems(
          Array.isArray(itemsData?.items)
            ? itemsData.items
            : Array.isArray(itemsData)
            ? itemsData
            : []
        );

      } catch (err) {
        console.error(
          "Failed to load states:",
          err
        );

        setError(
          err.message ||
          "Unable to load States & Union Territories."
        );

      } finally {
        setLoading(false);
      }
    }

    loadStatesData();
  }, []);


  // =====================================================
  // CULTURAL ITEM COUNT
  // =====================================================

  function getStateItemCount(stateId) {
    return items.filter(
      (item) =>
        item.state_id === stateId
    ).length;
  }


  // =====================================================
  // SEARCH
  // =====================================================

  const filteredStates = useMemo(() => {

    const query =
      search?.toLowerCase().trim() || "";

    if (!query) {
      return states;
    }

    return states.filter((state) => {

      return (
        state.name
          ?.toLowerCase()
          .includes(query) ||

        state.code
          ?.toLowerCase()
          .includes(query) ||

        state.description
          ?.toLowerCase()
          .includes(query)
      );

    });

  }, [states, search]);


  // =====================================================
  // SELECT STATE
  // =====================================================

  async function handleStateClick(state) {

    if (!state) {
      return;
    }

    setSelectedState(state);
    setSelectedStateItems([]);

    try {

      setStateItemsLoading(true);

      const response =
        await api.getCulturalItems({
          state_id: state.id,
          page: 1,
          limit: 20,
        });

      setSelectedStateItems(
        Array.isArray(response?.items)
          ? response.items
          : Array.isArray(response)
          ? response
          : []
      );

    } catch (err) {

      console.error(
        "Failed to load state cultural items:",
        err
      );

      setSelectedStateItems([]);

    } finally {

      setStateItemsLoading(false);

    }
  }


  // =====================================================
  // OPEN CULTURAL ITEM
  // =====================================================

  function openCulturalItem(item) {

    if (!item) {
      return;
    }

    const returnState = selectedState
      ? {
          ...selectedState,
          databaseId: selectedState.id,
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
  // BACK TO STATES
  // =====================================================

  function handleBackToStates() {

    setSelectedState(null);
    setSelectedStateItems([]);
    setStateItemsLoading(false);

  }


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="states-page">

        <div className="states-loading">

          <div className="states-loading-spinner" />

          <h2>
            Loading India's States & UTs...
          </h2>

          <p>
            Fetching state information from PostgreSQL.
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
      <div className="states-page">

        <div className="states-error">

          <span>
            STATES & UTs
          </span>

          <h1>
            Unable to load states
          </h1>

          <p>
            {error}
          </p>

        </div>

      </div>
    );
  }


  // =====================================================
  // SELECTED STATE VIEW
  // =====================================================

  if (selectedState) {
    return (
      <div className="states-page">

        <button
          className="states-back-button"
          onClick={handleBackToStates}
        >
          <span>
            ←
          </span>

          Back to States & UTs
        </button>


        {/* STATE HERO */}

        <section className="state-profile-hero">

          <div className="state-profile-symbol">
            {selectedState.code || "IN"}
          </div>

          <div className="state-profile-content">

            <span>
              STATE / UNION TERRITORY
            </span>

            <h1>
              {selectedState.name}
            </h1>

            <p>
              {selectedState.description ||
                `Explore the cultural heritage and traditions of ${selectedState.name}.`}
            </p>

          </div>

          <div className="state-profile-stat">

            <strong>
              {stateItemsLoading
                ? "..."
                : selectedStateItems.length}
            </strong>

            <span>
              Heritage Entries
            </span>

          </div>

        </section>


        {/* CULTURAL HERITAGE */}

        <section className="state-profile-section">

          <div className="states-section-heading">

            <div>

              <span>
                CULTURAL HERITAGE
              </span>

              <h2>
                Explore {selectedState.name}
              </h2>

            </div>

          </div>


          {stateItemsLoading ? (

            <div className="state-items-loading-page">

              <div className="states-loading-spinner" />

              <p>
                Loading cultural heritage...
              </p>

            </div>

          ) : selectedStateItems.length > 0 ? (

            <div className="state-items-grid">

              {selectedStateItems.map((item) => (

                <article
                  className="state-item-simple-card"
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

                  <div className="state-item-card-icon">
                    ◆
                  </div>

                  <div>

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

                  <strong>
                    →
                  </strong>

                </article>

              ))}

            </div>

          ) : (

            <div className="state-no-items">

              <div>
                ◆
              </div>

              <h3>
                No heritage entries yet
              </h3>

              <p>
                Cultural heritage entries for
                {" "}
                {selectedState.name}
                {" "}
                will appear here as the database grows.
              </p>

            </div>

          )}

        </section>

      </div>
    );
  }


  // =====================================================
  // MAIN STATES PAGE
  // =====================================================

  return (
    <div className="states-page">


      {/* =================================================
          HERO
          ================================================= */}

      <section className="states-page-hero">

        <div>

          <span>
            STATES & UNION TERRITORIES
          </span>

          <h1>
            Explore India's
            <br />
            States & UTs
          </h1>

          <p>
            Discover the unique cultural heritage,
            traditions and identity of every part
            of India.
          </p>

        </div>


        <div className="states-total">

          <strong>
            {states.length}
          </strong>

          <span>
            States & UTs
          </span>

        </div>

      </section>


      {/* =================================================
          DIRECTORY HEADER
          ================================================= */}

      <section className="states-directory">

        <div className="states-directory-heading">

          <div>

            <span>
              INDIA
            </span>

            <h2>
              States & Union Territories
            </h2>

            <p>
              Select a state to explore its cultural heritage.
            </p>

          </div>

          <div className="states-result-count">
            {filteredStates.length}
            {" "}
            {filteredStates.length === 1
              ? "result"
              : "results"}
          </div>

        </div>


        {/* =================================================
            STATES GRID
            ================================================= */}

        {filteredStates.length > 0 ? (

          <div className="states-grid">

            {filteredStates.map((state) => {

              const itemCount =
                getStateItemCount(state.id);

              return (

                <article
                  className="state-directory-card"
                  key={state.id}
                  tabIndex={0}
                  role="button"
                  onClick={() =>
                    handleStateClick(state)
                  }
                  onKeyDown={(event) => {

                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {

                      event.preventDefault();

                      handleStateClick(state);

                    }

                  }}
                >

                  <div className="state-card-top">

                    <div className="state-code">
                      {state.code || "IN"}
                    </div>

                    <span>
                      {itemCount}
                      {" "}
                      {itemCount === 1
                        ? "entry"
                        : "entries"}
                    </span>

                  </div>


                  <h3>
                    {state.name}
                  </h3>


                  <p>
                    {state.description ||
                      `Discover the cultural heritage of ${state.name}.`}
                  </p>


                  <div className="state-card-bottom">

                    <span>
                      Explore Heritage
                    </span>

                    <strong>
                      →
                    </strong>

                  </div>

                </article>

              );

            })}

          </div>

        ) : (

          <div className="states-no-results">

            <div>
              ◆
            </div>

            <h2>
              No states found
            </h2>

            <p>
              Try searching for another state
              or union territory.
            </p>

          </div>

        )}

      </section>

    </div>
  );
}