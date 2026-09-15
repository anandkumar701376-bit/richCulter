import { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";
import "./CulturalItems.css";

const PAGE_SIZE = 10;

export default function CulturalItems() {
  const [items, setItems] = useState([]);
  const [states, setStates] = useState([]);
  const [categories, setCategories] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);

  const [form, setForm] = useState({
    state_id: "",
    category_id: "",
    title: "",
    description: "",
  });

  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadItems();
  }, [page, stateFilter, categoryFilter]);

  async function loadInitialData() {
    setError("");

    try {
      const [statesResult, categoriesResult] = await Promise.all([
        api.getStates(),
        api.getCategories(),
      ]);

      setStates(
        Array.isArray(statesResult)
          ? statesResult
          : statesResult?.items ?? []
      );

      setCategories(
        Array.isArray(categoriesResult)
          ? categoriesResult
          : categoriesResult?.items ?? []
      );
    } catch (err) {
      console.error("Initial data loading error:", err);
      setError(err.message || "Unable to load states and categories.");
    }
  }

  async function loadItems() {
    setLoading(true);

    try {
      const result = await api.getCulturalItems({
        page,
        limit: PAGE_SIZE,
        state_id: stateFilter || undefined,
        category_id: categoryFilter || undefined,
      });

      if (Array.isArray(result)) {
        setItems(result);
        setTotal(result.length);
        setPages(1);
      } else {
        setItems(result?.items ?? []);
        setTotal(result?.total ?? 0);
        setPages(Math.max(result?.pages ?? 1, 1));
      }
    } catch (err) {
      console.error("Cultural items loading error:", err);
      setItems([]);
      setTotal(0);
      setPages(1);
      setError(err.message || "Unable to load cultural items.");
    } finally {
      setLoading(false);
    }
  }

  function getStateName(stateId) {
    const state = states.find((item) => item.id === stateId);
    return state?.name || "Unknown state";
  }

  function getCategoryName(categoryId) {
    const category = categories.find(
      (item) => item.id === categoryId
    );

    return category?.name || "Unknown category";
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm({
      state_id: "",
      category_id: "",
      title: "",
      description: "",
    });

    setEditingItem(null);
  }

  function openAddForm() {
    resetForm();
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  function closeForm() {
    setShowForm(false);
    resetForm();
    setError("");
  }

  function openEditForm(item) {
    setEditingItem(item);

    setForm({
      state_id: item.state_id || "",
      category_id: item.category_id || "",
      title: item.title || "",
      description: item.description || "",
    });

    setShowForm(true);
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.state_id) {
      setError("Please select a State / UT.");
      return;
    }

    if (!form.category_id) {
      setError("Please select a Category.");
      return;
    }

    if (!form.title.trim()) {
      setError("Please enter a title.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        state_id: form.state_id,
        category_id: form.category_id,
        title: form.title.trim(),
        description: form.description.trim() || null,
      };

      if (editingItem) {
        await api.updateCulturalItem(
          editingItem.id,
          payload
        );

        setSuccess("Cultural item updated successfully.");
      } else {
        await api.createCulturalItem(payload);

        setSuccess("Cultural item created successfully.");
      }

      closeForm();

      await loadItems();
    } catch (err) {
      console.error("Save cultural item error:", err);
      setError(
        err.message ||
          `Unable to ${
            editingItem ? "update" : "create"
          } cultural item.`
      );
    } finally {
      setSaving(false);
    }
  }

  async function openView(item) {
    setViewingItem(null);
    setLoadingDetails(true);
    setError("");

    try {
      const details = await api.getCulturalItemDetails(
        item.id
      );

      setViewingItem(details);
    } catch (err) {
      console.error("Cultural item details error:", err);
      setError(
        err.message || "Unable to load cultural item details."
      );
    } finally {
      setLoadingDetails(false);
    }
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Delete "${item.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      await api.deleteCulturalItem(item.id);

      setSuccess("Cultural item deleted successfully.");

      if (items.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadItems();
      }
    } catch (err) {
      console.error("Delete cultural item error:", err);
      setError(
        err.message || "Unable to delete cultural item."
      );
    } finally {
      setDeleting(false);
    }
  }

  function handleSearchChange(event) {
    setSearch(event.target.value);
  }

  function clearFilters() {
    setSearch("");
    setStateFilter("");
    setCategoryFilter("");
    setPage(1);
  }

  function handleStateFilter(event) {
    setStateFilter(event.target.value);
    setPage(1);
  }

  function handleCategoryFilter(event) {
    setCategoryFilter(event.target.value);
    setPage(1);
  }

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return items;
    }

    return items.filter((item) => {
      const title = item.title?.toLowerCase() || "";
      const description =
        item.description?.toLowerCase() || "";
      const state = getStateName(item.state_id).toLowerCase();
      const category = getCategoryName(
        item.category_id
      ).toLowerCase();

      return (
        title.includes(normalizedSearch) ||
        description.includes(normalizedSearch) ||
        state.includes(normalizedSearch) ||
        category.includes(normalizedSearch)
      );
    });
  }, [items, search, states, categories]);

  return (
    <div className="cultural-items-page">
      <div className="page-heading">
        <div>
          <span className="section-label">
            CONTENT MANAGEMENT
          </span>

          <h1>Cultural Items</h1>

          <p>
            Create, review, and manage cultural heritage
            records.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openAddForm}
        >
          + Add Cultural Item
        </button>
      </div>

      {success && (
        <div className="success-box">
          <span>✓</span>
          {success}
        </div>
      )}

      {error && (
        <div className="error-box">
          <span>!</span>
          {error}
        </div>
      )}

      {showForm && (
        <section className="form-panel">
          <div className="form-header">
            <div>
              <span className="section-label">
                {editingItem ? "EDIT RECORD" : "NEW RECORD"}
              </span>

              <h2>
                {editingItem
                  ? "Edit Cultural Item"
                  : "Add Cultural Item"}
              </h2>
            </div>

            <button
              className="close-button"
              onClick={closeForm}
              type="button"
              aria-label="Close form"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="state_id">
                  State / UT <span>*</span>
                </label>

                <select
                  id="state_id"
                  name="state_id"
                  value={form.state_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    {loading
                      ? "Loading states..."
                      : "Select state / UT"}
                  </option>

                  {states.map((state) => (
                    <option
                      key={state.id}
                      value={state.id}
                    >
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="category_id">
                  Category <span>*</span>
                </label>

                <select
                  id="category_id"
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    {loading
                      ? "Loading categories..."
                      : "Select category"}
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field full-width">
                <label htmlFor="title">
                  Title <span>*</span>
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Bathukamma"
                  required
                />
              </div>

              <div className="form-field full-width">
                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the cultural item..."
                  rows="6"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={closeForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingItem
                    ? "Update Cultural Item"
                    : "Save Cultural Item"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="items-panel">
        <div className="panel-heading">
          <div>
            <span className="section-label">
              DATABASE
            </span>

            <h2>Existing Cultural Items</h2>
          </div>

          <span className="item-count">
            {total} {total === 1 ? "record" : "records"}
          </span>
        </div>

        <div className="filters">
          <div className="search-field">
            <label htmlFor="item-search">
              Search
            </label>

            <input
              id="item-search"
              type="search"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search title, description..."
            />
          </div>

          <div className="filter-field">
            <label htmlFor="state-filter">
              State / UT
            </label>

            <select
              id="state-filter"
              value={stateFilter}
              onChange={handleStateFilter}
            >
              <option value="">All states / UTs</option>

              {states.map((state) => (
                <option
                  key={state.id}
                  value={state.id}
                >
                  {state.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label htmlFor="category-filter">
              Category
            </label>

            <select
              id="category-filter"
              value={categoryFilter}
              onChange={handleCategoryFilter}
            >
              <option value="">All categories</option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <button
            className="clear-filter-button"
            onClick={clearFilters}
            type="button"
          >
            Clear
          </button>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="loading-spinner" />
            <strong>Loading cultural items...</strong>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state">
            <strong>
              {search ||
              stateFilter ||
              categoryFilter
                ? "No matching cultural items"
                : "No cultural items yet"}
            </strong>

            <p>
              {search ||
              stateFilter ||
              categoryFilter
                ? "Try changing your search or filters."
                : "Add the first cultural heritage record using the button above."}
            </p>
          </div>
        ) : (
          <>
            <div className="items-table-wrapper">
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>State / UT</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th className="actions-column">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="title-cell">
                          <strong>{item.title}</strong>

                          <span className="record-id">
                            {item.id.slice(0, 8)}...
                          </span>
                        </div>
                      </td>

                      <td>
                        {getStateName(item.state_id)}
                      </td>

                      <td>
                        <span className="category-badge">
                          {getCategoryName(
                            item.category_id
                          )}
                        </span>
                      </td>

                      <td>
                        <span className="description-cell">
                          {item.description || "—"}
                        </span>
                      </td>

                      <td>
                        <div className="row-actions">
                          <button
                            className="action-button view"
                            type="button"
                            onClick={() =>
                              openView(item)
                            }
                          >
                            View
                          </button>

                          <button
                            className="action-button edit"
                            type="button"
                            onClick={() =>
                              openEditForm(item)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="action-button delete"
                            type="button"
                            disabled={deleting}
                            onClick={() =>
                              handleDelete(item)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pages > 1 && (
              <div className="pagination">
                <span className="pagination-info">
                  Page {page} of {pages}
                </span>

                <div className="pagination-buttons">
                  <button
                    type="button"
                    className="pagination-button"
                    disabled={page <= 1}
                    onClick={() =>
                      setPage((current) =>
                        Math.max(current - 1, 1)
                      )
                    }
                  >
                    ← Previous
                  </button>

                  <button
                    type="button"
                    className="pagination-button"
                    disabled={page >= pages}
                    onClick={() =>
                      setPage((current) =>
                        Math.min(current + 1, pages)
                      )
                    }
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {viewingItem && (
        <div
          className="modal-overlay"
          onClick={() => setViewingItem(null)}
        >
          <div
            className="details-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <span className="section-label">
                  CULTURAL ITEM
                </span>

                <h2>{viewingItem.title}</h2>
              </div>

              <button
                className="close-button"
                type="button"
                onClick={() =>
                  setViewingItem(null)
                }
              >
                ×
              </button>
            </div>

            <div className="details-grid">
              <div className="detail-block">
                <span>State / UT</span>
                <strong>
                  {getStateName(
                    viewingItem.state_id
                  )}
                </strong>
              </div>

              <div className="detail-block">
                <span>Category</span>
                <strong>
                  {getCategoryName(
                    viewingItem.category_id
                  )}
                </strong>
              </div>
            </div>

            <div className="detail-section">
              <span>Description</span>

              <p>
                {viewingItem.description ||
                  "No description provided."}
              </p>
            </div>

            <div className="detail-section">
              <span>
                Media ({viewingItem.media?.length ?? 0})
              </span>

              {viewingItem.media?.length ? (
                <div className="detail-list">
                  {viewingItem.media.map((media) => (
                    <div
                      className="detail-list-item"
                      key={media.id}
                    >
                      <strong>
                        {media.title ||
                          "Untitled media"}
                      </strong>

                      <small>
                        {media.media_type}
                      </small>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No media attached.</p>
              )}
            </div>

            <div className="detail-section">
              <span>
                Sources (
                {viewingItem.sources?.length ?? 0})
              </span>

              {viewingItem.sources?.length ? (
                <div className="detail-list">
                  {viewingItem.sources.map(
                    (source) => (
                      <div
                        className="detail-list-item"
                        key={source.id}
                      >
                        <strong>
                          {source.name}
                        </strong>

                        {source.url && (
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open source
                          </a>
                        )}
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p>No sources attached.</p>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="secondary-button"
                type="button"
                onClick={() =>
                  setViewingItem(null)
                }
              >
                Close
              </button>

              <button
                className="primary-button"
                type="button"
                onClick={() => {
                  const item = viewingItem;
                  setViewingItem(null);
                  openEditForm(item);
                }}
              >
                Edit Item
              </button>
            </div>
          </div>
        </div>
      )}

      {loadingDetails && (
        <div className="modal-overlay">
          <div className="loading-modal">
            <div className="loading-spinner" />
            <strong>Loading details...</strong>
          </div>
        </div>
      )}
    </div>
  );
}