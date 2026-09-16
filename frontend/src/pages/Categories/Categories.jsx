import { useEffect, useState } from "react";

import { api } from "../../services/api";

import "./Categories.css";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  // =====================================================
  // LOAD CATEGORIES
  // =====================================================

  async function loadCategories() {
    try {
      setLoading(true);
      setError("");

      const data = await api.getCategories();

      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load categories:", err);

      setError(
        err.message || "Failed to load categories."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  // =====================================================
  // ADD CATEGORY
  // =====================================================

  function openAddForm() {
    setEditingCategory(null);

    setForm({
      name: "",
      description: "",
    });

    setError("");
    setShowForm(true);
  }

  // =====================================================
  // EDIT CATEGORY
  // =====================================================

  function openEditForm(category) {
    setEditingCategory(category);

    setForm({
      name: category.name || "",
      description: category.description || "",
    });

    setError("");
    setShowForm(true);
  }

  // =====================================================
  // CLOSE FORM
  // =====================================================

  function closeForm() {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingCategory(null);
    setError("");
  }

  // =====================================================
  // FORM CHANGE
  // =====================================================

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // =====================================================
  // CREATE / UPDATE
  // =====================================================

  async function handleSubmit(event) {
    event.preventDefault();

    const name = form.name.trim();
    const description = form.description.trim();

    // Validation
    if (!name) {
      setError("Category name is required.");
      return;
    }

    if (name.length > 100) {
      setError(
        "Category name must be 100 characters or fewer."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name,
        description: description || null,
      };

      if (editingCategory) {
        await api.updateCategory(
          editingCategory.id,
          payload
        );
      } else {
        await api.createCategory(payload);
      }

      setShowForm(false);
      setEditingCategory(null);

      await loadCategories();
    } catch (err) {
      console.error("Failed to save category:", err);

      setError(
        err.message || "Failed to save category."
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // DELETE CATEGORY
  // =====================================================

  async function handleDelete(category) {
    const confirmed = window.confirm(
      `Delete "${category.name}"?\n\n` +
        `If cultural items are connected to this category, ` +
        `the database relationship may affect those items.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.deleteCategory(category.id);

      await loadCategories();
    } catch (err) {
      console.error("Failed to delete category:", err);

      setError(
        err.message || "Failed to delete category."
      );
    }
  }

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredCategories = categories.filter(
    (category) => {
      const query = search.toLowerCase().trim();

      if (!query) {
        return true;
      }

      return (
        category.name
          ?.toLowerCase()
          .includes(query) ||
        category.description
          ?.toLowerCase()
          .includes(query)
      );
    }
  );

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="categories-page">

      {/* HEADER */}

      <div className="categories-header">
        <div>
          <span className="section-label">
            CLASSIFICATION
          </span>

          <h1>Categories</h1>

          <p>
            Manage cultural heritage categories used
            by the database.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openAddForm}
        >
          + Add Category
        </button>
      </div>

      {/* TOOLBAR */}

      <div className="categories-toolbar">

        <div className="search-box">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <div className="count-badge">
          {filteredCategories.length} of{" "}
          {categories.length}
        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* LOADING */}

      {loading ? (
        <div className="empty-state">

          <div className="loading-spinner" />

          <p>
            Loading categories...
          </p>

        </div>

      ) : filteredCategories.length === 0 ? (

        /* EMPTY */

        <div className="empty-state">

          <div className="empty-icon">
            ◆
          </div>

          <h3>
            No categories found
          </h3>

          <p>
            {search
              ? "Try a different search."
              : "No categories are available yet."}
          </p>

        </div>

      ) : (

        /* TABLE */

        <div className="categories-card">

          <div className="table-wrapper">

            <table className="categories-table">

              <thead>
                <tr>
                  <th>#</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredCategories.map(
                  (category, index) => (

                    <tr key={category.id}>

                      <td className="index-cell">
                        {index + 1}
                      </td>

                      <td>
                        <strong>
                          {category.name}
                        </strong>
                      </td>

                      <td className="description-cell">

                        {category.description ? (
                          category.description
                        ) : (
                          <span className="muted">
                            No description
                          </span>
                        )}

                      </td>

                      <td>

                        <div className="action-buttons">

                          <button
                            className="edit-button"
                            onClick={() =>
                              openEditForm(category)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() =>
                              handleDelete(category)
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>
      )}

      {/* ADD / EDIT MODAL */}

      {showForm && (

        <div
          className="modal-overlay"
          onClick={closeForm}
        >

          <div
            className="modal-card"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="modal-header">

              <div>

                <span className="section-label">
                  {editingCategory
                    ? "EDIT"
                    : "CREATE"}
                </span>

                <h2>
                  {editingCategory
                    ? "Edit Category"
                    : "Add Category"}
                </h2>

              </div>

              <button
                className="close-button"
                onClick={closeForm}
                disabled={saving}
              >
                ×
              </button>

            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit}>

              {/* NAME */}

              <div className="form-group">

                <label>
                  Category Name{" "}
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Festivals"
                  maxLength={100}
                  disabled={saving}
                />

                <small>
                  Maximum 100 characters.
                </small>

              </div>

              {/* DESCRIPTION */}

              <div className="form-group">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Short description..."
                  rows={4}
                  disabled={saving}
                />

              </div>

              {/* ACTIONS */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeForm}
                  disabled={saving}
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
                    : editingCategory
                    ? "Update Category"
                    : "Create Category"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}