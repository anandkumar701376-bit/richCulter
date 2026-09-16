import { useEffect, useState } from "react";

import { api } from "../../services/api";

import "./States.css";

export default function States() {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingState, setEditingState] = useState(null);

  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
  });

  // -----------------------------
  // LOAD STATES
  // -----------------------------

  async function loadStates() {
    try {
      setLoading(true);
      setError("");

      const data = await api.getStates();

      setStates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load states:", err);

      setError(
        err.message || "Failed to load States and UTs."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStates();
  }, []);

  // -----------------------------
  // OPEN ADD FORM
  // -----------------------------

  function openAddForm() {
    setEditingState(null);

    setForm({
      name: "",
      code: "",
      description: "",
    });

    setError("");
    setShowForm(true);
  }

  // -----------------------------
  // OPEN EDIT FORM
  // -----------------------------

  function openEditForm(state) {
    setEditingState(state);

    setForm({
      name: state.name || "",
      code: state.code || "",
      description: state.description || "",
    });

    setError("");
    setShowForm(true);
  }

  // -----------------------------
  // CLOSE FORM
  // -----------------------------

  function closeForm() {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingState(null);
    setError("");
  }

  // -----------------------------
  // HANDLE INPUT
  // -----------------------------

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // -----------------------------
  // CREATE / UPDATE STATE
  // -----------------------------

  async function handleSubmit(event) {
    event.preventDefault();

    const name = form.name.trim();
    const code = form.code.trim().toUpperCase();
    const description = form.description.trim();

    // Validation

    if (!name) {
      setError("State / UT name is required.");
      return;
    }

    if (!code) {
      setError("State / UT code is required.");
      return;
    }

    if (code.length > 10) {
      setError(
        "State / UT code must be 10 characters or fewer."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name,
        code,
        description: description || null,
      };

      if (editingState) {
        // UPDATE
        await api.updateState(
          editingState.id,
          payload
        );
      } else {
        // CREATE
        await api.createState(payload);
      }

      setShowForm(false);
      setEditingState(null);

      await loadStates();
    } catch (err) {
      console.error("Failed to save state:", err);

      setError(
        err.message || "Failed to save State / UT."
      );
    } finally {
      setSaving(false);
    }
  }

  // -----------------------------
  // DELETE STATE
  // -----------------------------

  async function handleDelete(state) {
    const confirmed = window.confirm(
      `Delete "${state.name}"?\n\n` +
        `If cultural items are connected to this State / UT, ` +
        `the backend relationship may also affect those items.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.deleteState(state.id);

      await loadStates();
    } catch (err) {
      console.error("Failed to delete state:", err);

      setError(
        err.message || "Failed to delete State / UT."
      );
    }
  }

  // -----------------------------
  // SEARCH
  // -----------------------------

  const filteredStates = states.filter((state) => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return true;
    }

    return (
      state.name?.toLowerCase().includes(query) ||
      state.code?.toLowerCase().includes(query) ||
      state.description
        ?.toLowerCase()
        .includes(query)
    );
  });

  // -----------------------------
  // UI
  // -----------------------------

  return (
    <div className="states-page">

      {/* HEADER */}

      <div className="states-header">

        <div>
          <span className="section-label">
            GEOGRAPHY
          </span>

          <h1>States & UTs</h1>

          <p>
            Manage Indian States and Union Territories
            used by the cultural heritage database.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openAddForm}
        >
          + Add State / UT
        </button>

      </div>

      {/* TOOLBAR */}

      <div className="states-toolbar">

        <div className="search-box">

          <span>⌕</span>

          <input
            type="text"
            placeholder="Search states or codes..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>

        <div className="count-badge">
          {filteredStates.length} of {states.length}
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
            Loading States & UTs...
          </p>

        </div>

      ) : filteredStates.length === 0 ? (

        <div className="empty-state">

          <div className="empty-icon">
            ◎
          </div>

          <h3>
            No states found
          </h3>

          <p>
            {search
              ? "Try a different search."
              : "No States or UTs are available yet."}
          </p>

        </div>

      ) : (

        <div className="states-card">

          <div className="table-wrapper">

            <table className="states-table">

              <thead>

                <tr>
                  <th>#</th>
                  <th>State / UT</th>
                  <th>Code</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {filteredStates.map(
                  (state, index) => (

                    <tr key={state.id}>

                      <td className="index-cell">
                        {index + 1}
                      </td>

                      <td>
                        <strong>
                          {state.name}
                        </strong>
                      </td>

                      <td>
                        <span className="code-badge">
                          {state.code}
                        </span>
                      </td>

                      <td className="description-cell">

                        {state.description ? (
                          state.description
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
                              openEditForm(state)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() =>
                              handleDelete(state)
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

            <div className="modal-header">

              <div>

                <span className="section-label">
                  {editingState
                    ? "EDIT"
                    : "CREATE"}
                </span>

                <h2>
                  {editingState
                    ? "Edit State / UT"
                    : "Add State / UT"}
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

            <form onSubmit={handleSubmit}>

              {/* NAME */}

              <div className="form-group">

                <label>
                  State / UT Name{" "}
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Telangana"
                  disabled={saving}
                />

              </div>

              {/* CODE */}

              <div className="form-group">

                <label>
                  Code <span>*</span>
                </label>

                <input
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="e.g. TS"
                  maxLength={10}
                  disabled={saving}
                />

                <small>
                  Use a unique short code for
                  the State / UT.
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

              {/* BUTTONS */}

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
                    : editingState
                    ? "Update State"
                    : "Create State"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}