import { useEffect, useMemo, useState } from "react";

import { api } from "../../services/api";

import "./CulturalCategories.css";


export default function CulturalCategories({
  search,
  onNavigate,
}) {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [states, setStates] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState(null);

  const [selectedCategoryItems, setSelectedCategoryItems] =
    useState([]);

  const [categoryItemsLoading, setCategoryItemsLoading] =
    useState(false);


  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    async function loadCategoryData() {
      try {
        setLoading(true);
        setError("");

        const [
          categoriesData,
          itemsData,
          statesData,
        ] = await Promise.all([
          api.getCategories(),
          api.getCulturalItems({
            page: 1,
            limit: 100,
          }),
          api.getStates(),
        ]);

        setCategories(
          Array.isArray(categoriesData)
            ? categoriesData
            : []
        );

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

      } catch (err) {
        console.error(
          "Failed to load cultural categories:",
          err
        );

        setError(
          err.message ||
          "Unable to load cultural categories."
        );

      } finally {
        setLoading(false);
      }
    }

    loadCategoryData();
  }, []);


  // =====================================================
  // CATEGORY ITEM COUNT
  // =====================================================

  function getCategoryItemCount(categoryId) {
    return items.filter(
      (item) =>
        item.category_id === categoryId
    ).length;
  }


  // =====================================================
  // STATE NAME
  // =====================================================

  function getStateName(stateId) {
    const state = states.find(
      (stateItem) =>
        stateItem.id === stateId
    );

    return state?.name || "India";
  }


  // =====================================================
  // SEARCH
  // =====================================================

  const filteredCategories = useMemo(() => {

    const query =
      search?.toLowerCase().trim() || "";

    if (!query) {
      return categories;
    }

    return categories.filter((category) => {

      return (
        category.name
          ?.toLowerCase()
          .includes(query) ||

        category.description
          ?.toLowerCase()
          .includes(query)
      );

    });

  }, [categories, search]);


  // =====================================================
  // SELECT CATEGORY
  // =====================================================

  function handleCategoryClick(category) {

    if (!category) {
      return;
    }

    setSelectedCategory(category);

    setCategoryItemsLoading(true);

    const categoryItems = items.filter(
      (item) =>
        item.category_id === category.id
    );

    setSelectedCategoryItems(categoryItems);

    setCategoryItemsLoading(false);
  }


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
  // BACK TO CATEGORIES
  // =====================================================

  function handleBackToCategories() {

    setSelectedCategory(null);

    setSelectedCategoryItems([]);

    setCategoryItemsLoading(false);
  }


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="categories-page">

        <div className="categories-loading">

          <div className="categories-loading-spinner" />

          <h2>
            Loading Cultural Categories...
          </h2>

          <p>
            Fetching categories from PostgreSQL.
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
      <div className="categories-page">

        <div className="categories-error">

          <span>
            CULTURAL CATEGORIES
          </span>

          <h1>
            Unable to load categories
          </h1>

          <p>
            {error}
          </p>

        </div>

      </div>
    );
  }


  // =====================================================
  // SELECTED CATEGORY
  // =====================================================

  if (selectedCategory) {
    return (
      <div className="categories-page">

        <button
          className="categories-back-button"
          onClick={handleBackToCategories}
        >
          <span>
            ←
          </span>

          Back to Cultural Categories
        </button>


        {/* CATEGORY HERO */}

        <section className="category-profile-hero">

          <div className="category-profile-icon">
            ▦
          </div>

          <div className="category-profile-content">

            <span>
              CULTURAL CATEGORY
            </span>

            <h1>
              {selectedCategory.name}
            </h1>

            <p>
              {selectedCategory.description ||
                `Explore Indian cultural heritage related to ${selectedCategory.name}.`}
            </p>

          </div>

          <div className="category-profile-stat">

            <strong>
              {selectedCategoryItems.length}
            </strong>

            <span>
              Heritage Entries
            </span>

          </div>

        </section>


        {/* CATEGORY ITEMS */}

        <section className="category-profile-section">

          <div className="categories-section-heading">

            <div>

              <span>
                HERITAGE
              </span>

              <h2>
                {selectedCategory.name}
                {" "}
                Heritage
              </h2>

            </div>

          </div>


          {categoryItemsLoading ? (

            <div className="categories-items-loading">

              <div className="categories-loading-spinner" />

              <p>
                Loading cultural heritage...
              </p>

            </div>

          ) : selectedCategoryItems.length > 0 ? (

            <div className="category-items-grid">

              {selectedCategoryItems.map((item) => (

                <article
                  className="category-item-card"
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

                  <div className="category-item-icon">
                    ◆
                  </div>

                  <div className="category-item-content">

                    <span>
                      {getStateName(item.state_id)}
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

            <div className="categories-no-items">

              <div>
                ◆
              </div>

              <h3>
                No heritage entries yet
              </h3>

              <p>
                Cultural heritage entries for this
                category will appear here as the
                database grows.
              </p>

            </div>

          )}

        </section>

      </div>
    );
  }


  // =====================================================
  // MAIN CATEGORY PAGE
  // =====================================================

  return (
    <div className="categories-page">


      {/* =================================================
          HERO
          ================================================= */}

      <section className="categories-page-hero">

        <div>

          <span>
            CULTURAL CATEGORIES
          </span>

          <h1>
            Explore India's
            <br />
            Cultural Diversity
          </h1>

          <p>
            Discover India's heritage through
            festivals, traditions, arts, food,
            music and more.
          </p>

        </div>


        <div className="categories-total">

          <strong>
            {categories.length}
          </strong>

          <span>
            Categories
          </span>

        </div>

      </section>


      {/* =================================================
          DIRECTORY
          ================================================= */}

      <section className="categories-directory">

        <div className="categories-directory-heading">

          <div>

            <span>
              HERITAGE COLLECTION
            </span>

            <h2>
              Cultural Categories
            </h2>

            <p>
              Select a category to discover related
              cultural heritage.
            </p>

          </div>

          <div className="categories-result-count">

            {filteredCategories.length}

            {" "}

            {filteredCategories.length === 1
              ? "result"
              : "results"}

          </div>

        </div>


        {/* =================================================
            CATEGORY GRID
            ================================================= */}

        {filteredCategories.length > 0 ? (

          <div className="categories-grid">

            {filteredCategories.map((category) => {

              const itemCount =
                getCategoryItemCount(category.id);

              return (

                <article
                  className="category-directory-card"
                  key={category.id}
                  tabIndex={0}
                  role="button"
                  onClick={() =>
                    handleCategoryClick(category)
                  }
                  onKeyDown={(event) => {

                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {

                      event.preventDefault();

                      handleCategoryClick(category);
                    }

                  }}
                >

                  <div className="category-card-icon">
                    ▦
                  </div>


                  <div className="category-card-top">

                    <span>
                      {itemCount}
                      {" "}
                      {itemCount === 1
                        ? "entry"
                        : "entries"}
                    </span>

                  </div>


                  <h3>
                    {category.name}
                  </h3>


                  <p>
                    {category.description ||
                      `Explore Indian heritage related to ${category.name}.`}
                  </p>


                  <div className="category-card-bottom">

                    <span>
                      Explore Category
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

          <div className="categories-no-results">

            <div>
              ▦
            </div>

            <h2>
              No categories found
            </h2>

            <p>
              Try searching for another cultural category.
            </p>

          </div>

        )}

      </section>

    </div>
  );
}