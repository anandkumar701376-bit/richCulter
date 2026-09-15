import { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";
import "./Sources.css";

const PAGE_SIZE = 10;

const emptyForm = {
  cultural_item_id: "",
  name: "",
  url: "",
  description: "",
};

export default function Sources() {
  const [sources, setSources] = useState([]);
  const [culturalItems, setCulturalItems] = useState([]);

  const [search, setSearch] = useState("");
  const [itemFilter, setItemFilter] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modal, setModal] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [sourcesData, itemsData] = await Promise.all([
        api.getSources(),
        api.getCulturalItems({ page: 1, limit: 100 }),
      ]);

      setSources(Array.isArray(sourcesData) ? sourcesData : []);
      setCulturalItems(
        Array.isArray(itemsData)
          ? itemsData
          : itemsData?.items || []
      );
    } catch (err) {
      setError(err.message || "Failed to load sources.");
    } finally {
      setLoading(false);
    }
  }

  const itemMap = useMemo(() => {
    const map = {};

    culturalItems.forEach((item) => {
      map[item.id] = item.title;
    });

    return map;
  }, [culturalItems]);

  const filteredSources = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sources.filter((source) => {
      const itemTitle =
        itemMap[source.cultural_item_id] || "";

      const matchesSearch =
        !query ||
        source.name?.toLowerCase().includes(query) ||
        source.description?.toLowerCase().includes(query) ||
        source.url?.toLowerCase().includes(query) ||
        itemTitle.toLowerCase().includes(query);

      const matchesItem =
        !itemFilter ||
        source.cultural_item_id === itemFilter;

      return matchesSearch && matchesItem;
    });
  }, [sources, search, itemFilter, itemMap]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSources.length / PAGE_SIZE)
  );

  const paginatedSources = filteredSources.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  function openAddModal() {
    setForm(emptyForm);
    setSelectedSource(null);
    setModal("add");
  }

  function openEditModal(source) {
    setSelectedSource(source);

    setForm({
      cultural_item_id: source.cultural_item_id || "",
      name: source.name || "",
      url: source.url || "",
      description: source.description || "",
    });

    setModal("edit");
  }

  function openViewModal(source) {
    setSelectedSource(source);
    setModal("view");
  }

  function closeModal() {
    if (saving || deleting) return;

    setModal(null);
    setSelectedSource(null);
    setForm(emptyForm);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.cultural_item_id) {
      setError("Please select a cultural item.");
      return;
    }

    if (!form.name.trim()) {
      setError("Source name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        cultural_item_id: form.cultural_item_id,
        name: form.name.trim(),
        url: form.url.trim() || null,
        description: form.description.trim() || null,
      };

      if (modal === "add") {
        await api.createSource(payload);
      } else {
        await api.updateSource(selectedSource.id, payload);
      }

      await loadData();
      closeModal();
    } catch (err) {
      setError(err.message || "Failed to save source.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(source) {
    const confirmed = window.confirm(
      `Delete source "${source.name}"?`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      await api.deleteSource(source.id);

      await loadData();

      if (selectedSource?.id === source.id) {
        closeModal();
      }
    } catch (err) {
      setError(err.message || "Failed to delete source.");
    } finally {
      setDeleting(false);
    }
  }

  function handleSearchChange(event) {
    setSearch(event.target.value);
    setPage(1);
  }

  function handleFilterChange(event) {
    setItemFilter(event.target.value);
    setPage(1);
  }

  function clearFilters() {
    setSearch("");
    setItemFilter("");
    setPage(1);
  }

  return (
    <div className="sources-page">
      <div className="sources-header">
        <div>
          <span className="section-label">REFERENCE MANAGEMENT</span>
          <h1>Sources</h1>
          <p>
            Manage references and information sources for cultural
            heritage content.
          </p>
        </div>

        <button className="primary-button" onClick={openAddModal}>
          <span>＋</span>
          Add Source
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠</span>
          <span>{error}</span>
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      <div className="sources-toolbar">
        <div className="search-box">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            placeholder="Search sources..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        <select
          value={itemFilter}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">All Cultural Items</option>

          {culturalItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>

        {(search || itemFilter) && (
          <button
            className="clear-button"
            onClick={clearFilters}
          >
            Clear
          </button>
        )}

        <button
          className="refresh-button"
          onClick={loadData}
          disabled={loading}
          title="Refresh"
        >
          ↻
        </button>
      </div>

      <div className="sources-summary">
        <span>
          {filteredSources.length}{" "}
          {filteredSources.length === 1 ? "source" : "sources"}
        </span>

        {(search || itemFilter) && (
          <span className="filter-info">
            Filtered from {sources.length}
          </span>
        )}
      </div>

      <div className="sources-table-card">
        {loading ? (
          <div className="empty-state">
            <div className="loading-spinner" />
            <p>Loading sources...</p>
          </div>
        ) : paginatedSources.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◈</div>
            <h3>No sources found</h3>

            <p>
              {search || itemFilter
                ? "Try changing your search or filters."
                : "Add your first source to get started."}
            </p>

            {!search && !itemFilter && (
              <button
                className="primary-button"
                onClick={openAddModal}
              >
                ＋ Add Source
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="sources-table">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Cultural Item</th>
                  <th>URL</th>
                  <th>Created</th>
                  <th className="actions-column">Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedSources.map((source) => (
                  <tr key={source.id}>
                    <td>
                      <div className="source-name">
                        <div className="source-icon">◈</div>

                        <div>
                          <strong>{source.name}</strong>

                          {source.description && (
                            <span>
                              {source.description.length > 80
                                ? `${source.description.slice(
                                    0,
                                    80
                                  )}...`
                                : source.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="item-badge">
                        {itemMap[source.cultural_item_id] ||
                          "Unknown Item"}
                      </span>
                    </td>

                    <td>
                      {source.url ? (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="source-link"
                        >
                          Open source ↗
                        </a>
                      ) : (
                        <span className="muted-text">
                          No URL
                        </span>
                      )}
                    </td>

                    <td>
                      <span className="date-text">
                        {formatDate(source.created_at)}
                      </span>
                    </td>

                    <td>
                      <div className="row-actions">
                        <button
                          className="icon-button view"
                          onClick={() => openViewModal(source)}
                          title="View"
                        >
                          👁
                        </button>

                        <button
                          className="icon-button edit"
                          onClick={() => openEditModal(source)}
                          title="Edit"
                        >
                          ✎
                        </button>

                        <button
                          className="icon-button delete"
                          onClick={() => handleDelete(source)}
                          title="Delete"
                          disabled={deleting}
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && filteredSources.length > 0 && (
        <div className="pagination">
          <span className="pagination-info">
            Showing{" "}
            {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(
              page * PAGE_SIZE,
              filteredSources.length
            )}{" "}
            of {filteredSources.length}
          </span>

          <div className="pagination-buttons">
            <button
              disabled={page === 1}
              onClick={() => setPage((current) => current - 1)}
            >
              ←
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            )
              .slice(
                Math.max(0, page - 3),
                Math.min(totalPages, page + 2)
              )
              .map((pageNumber) => (
                <button
                  key={pageNumber}
                  className={
                    page === pageNumber ? "active" : ""
                  }
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}

            <button
              disabled={page === totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              →
            </button>
          </div>
        </div>
      )}

      {modal === "add" && (
        <SourceFormModal
          title="Add Source"
          form={form}
          culturalItems={culturalItems}
          saving={saving}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}

      {modal === "edit" && (
        <SourceFormModal
          title="Edit Source"
          form={form}
          culturalItems={culturalItems}
          saving={saving}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}

      {modal === "view" && selectedSource && (
        <SourceViewModal
          source={selectedSource}
          culturalItemTitle={
            itemMap[selectedSource.cultural_item_id] ||
            "Unknown Item"
          }
          onClose={closeModal}
          onEdit={() => openEditModal(selectedSource)}
        />
      )}
    </div>
  );
}

function SourceFormModal({
  title,
  form,
  culturalItems,
  saving,
  onChange,
  onSubmit,
  onClose,
}) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="source-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="section-label">
              SOURCE MANAGEMENT
            </span>
            <h2>{title}</h2>
          </div>

          <button
            className="modal-close"
            onClick={onClose}
            disabled={saving}
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="form-body">
            <div className="form-group">
              <label>
                Cultural Item <span>*</span>
              </label>

              <select
                name="cultural_item_id"
                value={form.cultural_item_id}
                onChange={onChange}
                required
              >
                <option value="">
                  Select cultural item
                </option>

                {culturalItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                Source Name <span>*</span>
              </label>

              <input
                name="name"
                type="text"
                value={form.name}
                onChange={onChange}
                placeholder="e.g. Telangana Tourism"
                required
              />
            </div>

            <div className="form-group">
              <label>URL</label>

              <input
                name="url"
                type="url"
                value={form.url}
                onChange={onChange}
                placeholder="https://example.com"
              />
            </div>

            <div className="form-group">
              <label>Description</label>

              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                placeholder="Describe what information this source provides..."
                rows="5"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
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
                : title === "Edit Source"
                ? "Save Changes"
                : "Add Source"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SourceViewModal({
  source,
  culturalItemTitle,
  onClose,
  onEdit,
}) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="source-modal view-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="section-label">
              SOURCE DETAILS
            </span>
            <h2>{source.name}</h2>
          </div>

          <button
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="details-body">
          <div className="detail-row">
            <span>Cultural Item</span>
            <strong>{culturalItemTitle}</strong>
          </div>

          <div className="detail-row">
            <span>Source Name</span>
            <strong>{source.name}</strong>
          </div>

          <div className="detail-row">
            <span>URL</span>

            {source.url ? (
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="source-link"
              >
                {source.url}
              </a>
            ) : (
              <strong className="muted-text">
                No URL provided
              </strong>
            )}
          </div>

          <div className="detail-block">
            <span>Description</span>
            <p>
              {source.description ||
                "No description provided."}
            </p>
          </div>

          <div className="detail-row">
            <span>Created</span>
            <strong>
              {formatDate(source.created_at)}
            </strong>
          </div>

          <div className="detail-row source-id-row">
            <span>ID</span>
            <code>{source.id}</code>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="secondary-button"
            onClick={onClose}
          >
            Close
          </button>

          <button
            className="primary-button"
            onClick={onEdit}
          >
            ✎ Edit Source
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}