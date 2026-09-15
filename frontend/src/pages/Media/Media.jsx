import { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";
import "./Media.css";

const API_BASE_URL = "http://192.168.29.234:8000";

const PAGE_SIZE = 10;

const MEDIA_TYPES = ["image", "video", "audio"];
const STORAGE_TYPES = ["local", "external"];

function getMediaUrl(media) {
  if (!media) return "";

  const url = media.media_url || media.url || "";

  if (!url) return "";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${API_BASE_URL}${url}`;
}

function getMediaTypeLabel(type) {
  if (!type) return "Unknown";

  return type.charAt(0).toUpperCase() + type.slice(1);
}

function getStorageLabel(type) {
  if (!type) return "Unknown";

  return type.charAt(0).toUpperCase() + type.slice(1);
}

function MediaPreview({ media, large = false }) {
  const mediaUrl = getMediaUrl(media);

  if (!mediaUrl) {
    return (
      <div className={`media-preview empty ${large ? "large" : ""}`}>
        No preview
      </div>
    );
  }

  if (media.media_type === "image") {
    return (
      <img
        className={`media-image ${large ? "large" : ""}`}
        src={mediaUrl}
        alt={media.title || "Cultural media"}
      />
    );
  }

  if (media.media_type === "video") {
    return (
      <video
        className={`media-video ${large ? "large" : ""}`}
        src={mediaUrl}
        controls
      />
    );
  }

  if (media.media_type === "audio") {
    return (
      <div className={`audio-preview ${large ? "large" : ""}`}>
        <div className="audio-icon">♪</div>
        <audio src={mediaUrl} controls />
      </div>
    );
  }

  return (
    <div className={`media-preview empty ${large ? "large" : ""}`}>
      Unsupported
    </div>
  );
}

export default function Media() {
  const [media, setMedia] = useState([]);
  const [culturalItems, setCulturalItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [mediaType, setMediaType] = useState("");
  const [storageType, setStorageType] = useState("");
  const [culturalItemFilter, setCulturalItemFilter] = useState("");

  const [page, setPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [editingMedia, setEditingMedia] = useState(null);

  const [viewingMedia, setViewingMedia] = useState(null);

  const [formMode, setFormMode] = useState("external");

  const [formData, setFormData] = useState({
    cultural_item_id: "",
    media_type: "image",
    title: "",
    url: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);

  const [saving, setSaving] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [mediaData, itemData] = await Promise.all([
        api.getMedia(),
        api.getCulturalItems({
          page: 1,
          limit: 100,
        }),
      ]);

      setMedia(Array.isArray(mediaData) ? mediaData : []);

      const items = Array.isArray(itemData)
        ? itemData
        : itemData?.items || [];

      setCulturalItems(items);
    } catch (err) {
      setError(err.message || "Failed to load media.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const culturalItemMap = useMemo(() => {
    const map = {};

    culturalItems.forEach((item) => {
      map[item.id] = item;
    });

    return map;
  }, [culturalItems]);

  const filteredMedia = useMemo(() => {
    const query = search.trim().toLowerCase();

    return media.filter((item) => {
      const culturalItem =
        culturalItemMap[item.cultural_item_id];

      const culturalTitle =
        culturalItem?.title?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        item.title?.toLowerCase().includes(query) ||
        item.media_type?.toLowerCase().includes(query) ||
        item.storage_type?.toLowerCase().includes(query) ||
        culturalTitle.includes(query);

      const matchesType =
        !mediaType || item.media_type === mediaType;

      const matchesStorage =
        !storageType || item.storage_type === storageType;

      const matchesCulturalItem =
        !culturalItemFilter ||
        item.cultural_item_id === culturalItemFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesStorage &&
        matchesCulturalItem
      );
    });
  }, [
    media,
    search,
    mediaType,
    storageType,
    culturalItemFilter,
    culturalItemMap,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMedia.length / PAGE_SIZE)
  );

  const visibleMedia = filteredMedia.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  function getCulturalItemTitle(id) {
    return culturalItemMap[id]?.title || "Unknown item";
  }

  function openAddForm() {
    setEditingMedia(null);

    setFormData({
      cultural_item_id:
        culturalItems.length > 0 ? culturalItems[0].id : "",
      media_type: "image",
      title: "",
      url: "",
    });

    setSelectedFile(null);
    setFormMode("external");
    setShowForm(true);
  }

  function openEditForm(item) {
    setEditingMedia(item);

    setFormData({
      cultural_item_id: item.cultural_item_id || "",
      media_type: item.media_type || "image",
      title: item.title || "",
      url: item.url || "",
    });

    setSelectedFile(null);
    setFormMode(
      item.storage_type === "local"
        ? "local"
        : "external"
    );

    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingMedia(null);
    setSelectedFile(null);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.cultural_item_id) {
      setError("Please select a cultural item.");
      return;
    }

    if (!formData.media_type) {
      setError("Please select a media type.");
      return;
    }

    if (!editingMedia && formMode === "local" && !selectedFile) {
      setError("Please choose a file.");
      return;
    }

    if (!editingMedia && formMode === "external" && !formData.url.trim()) {
      setError("Please enter an external media URL.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingMedia) {
        await api.updateMedia(editingMedia.id, {
          cultural_item_id: formData.cultural_item_id,
          media_type: formData.media_type,
          title: formData.title.trim() || null,
          url:
            editingMedia.storage_type === "external"
              ? formData.url.trim() || null
              : editingMedia.url,
          storage_type: editingMedia.storage_type,
          storage_key: editingMedia.storage_key,
        });
      } else if (formMode === "local") {
        await api.uploadMedia({
          cultural_item_id: formData.cultural_item_id,
          media_type: formData.media_type,
          title: formData.title.trim() || undefined,
          file: selectedFile,
        });
      } else {
        await api.createMedia({
          cultural_item_id: formData.cultural_item_id,
          media_type: formData.media_type,
          title: formData.title.trim() || null,
          url: formData.url.trim(),
          storage_type: "external",
          storage_key: null,
        });
      }

      closeForm();
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to save media.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Delete "${item.title || "this media"}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.deleteMedia(item.id);

      if (viewingMedia?.id === item.id) {
        setViewingMedia(null);
      }

      await loadData();
    } catch (err) {
      setError(err.message || "Failed to delete media.");
    }
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  }

  function handleFilterChange(setter, value) {
    setter(value);
    setPage(1);
  }

  return (
    <div className="media-page">
      <div className="page-header">
        <div>
          <span className="page-eyebrow">CONTENT MANAGEMENT</span>
          <h1>Media</h1>
          <p>
            Manage images, videos and audio connected to
            cultural items.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openAddForm}
        >
          + Add Media
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      <div className="filters-card">
        <div className="search-field">
          <label>Search</label>
          <input
            type="text"
            placeholder="Search media..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="filter-field">
          <label>Media Type</label>
          <select
            value={mediaType}
            onChange={(event) =>
              handleFilterChange(
                setMediaType,
                event.target.value
              )
            }
          >
            <option value="">All Types</option>

            {MEDIA_TYPES.map((type) => (
              <option key={type} value={type}>
                {getMediaTypeLabel(type)}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label>Storage</label>
          <select
            value={storageType}
            onChange={(event) =>
              handleFilterChange(
                setStorageType,
                event.target.value
              )
            }
          >
            <option value="">All Storage</option>

            {STORAGE_TYPES.map((type) => (
              <option key={type} value={type}>
                {getStorageLabel(type)}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field cultural-filter">
          <label>Cultural Item</label>
          <select
            value={culturalItemFilter}
            onChange={(event) =>
              handleFilterChange(
                setCulturalItemFilter,
                event.target.value
              )
            }
          >
            <option value="">All Cultural Items</option>

            {culturalItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="media-summary">
        <span>
          {filteredMedia.length} media item
          {filteredMedia.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="state-message">
            Loading media...
          </div>
        ) : visibleMedia.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">▣</div>
            <h3>No media found</h3>
            <p>
              Add an image, video or audio file to get
              started.
            </p>
            <button
              className="primary-button"
              onClick={openAddForm}
            >
              + Add Media
            </button>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Preview</th>
                    <th>Title</th>
                    <th>Cultural Item</th>
                    <th>Type</th>
                    <th>Storage</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleMedia.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="table-preview">
                          <MediaPreview media={item} />
                        </div>
                      </td>

                      <td>
                        <div className="media-title">
                          {item.title || "Untitled media"}
                        </div>
                      </td>

                      <td>
                        <span className="item-name">
                          {getCulturalItemTitle(
                            item.cultural_item_id
                          )}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`type-badge ${item.media_type}`}
                        >
                          {getMediaTypeLabel(
                            item.media_type
                          )}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`storage-badge ${item.storage_type}`}
                        >
                          {getStorageLabel(
                            item.storage_type
                          )}
                        </span>
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-button view"
                            onClick={() =>
                              setViewingMedia(item)
                            }
                          >
                            View
                          </button>

                          <button
                            className="action-button edit"
                            onClick={() =>
                              openEditForm(item)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="action-button delete"
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

            <div className="pagination">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Previous
              </button>

              <span>
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <div>
                <span className="page-eyebrow">
                  MEDIA
                </span>

                <h2>
                  {editingMedia
                    ? "Edit Media"
                    : "Add Media"}
                </h2>
              </div>

              <button
                className="close-button"
                onClick={closeForm}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-field full">
                  <label>Cultural Item *</label>

                  <select
                    name="cultural_item_id"
                    value={formData.cultural_item_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select cultural item
                    </option>

                    {culturalItems.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Media Type *</label>

                  <select
                    name="media_type"
                    value={formData.media_type}
                    onChange={handleChange}
                    required
                  >
                    {MEDIA_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {getMediaTypeLabel(type)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Title</label>

                  <input
                    name="title"
                    type="text"
                    placeholder="e.g. Bathukamma Festival"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>

                {!editingMedia && (
                  <div className="form-field full">
                    <label>Source</label>

                    <div className="source-toggle">
                      <button
                        type="button"
                        className={
                          formMode === "external"
                            ? "selected"
                            : ""
                        }
                        onClick={() => {
                          setFormMode("external");
                          setSelectedFile(null);
                        }}
                      >
                        External URL
                      </button>

                      <button
                        type="button"
                        className={
                          formMode === "local"
                            ? "selected"
                            : ""
                        }
                        onClick={() =>
                          setFormMode("local")
                        }
                      >
                        Upload Local File
                      </button>
                    </div>
                  </div>
                )}

                {!editingMedia &&
                  formMode === "external" && (
                    <div className="form-field full">
                      <label>External URL *</label>

                      <input
                        name="url"
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={formData.url}
                        onChange={handleChange}
                      />
                    </div>
                  )}

                {!editingMedia &&
                  formMode === "local" && (
                    <div className="form-field full">
                      <label>Choose File *</label>

                      <input
                        type="file"
                        accept={
                          formData.media_type === "image"
                            ? "image/*"
                            : formData.media_type ===
                              "video"
                            ? "video/*"
                            : "audio/*"
                        }
                        onChange={handleFileChange}
                      />

                      {selectedFile && (
                        <div className="selected-file">
                          <strong>
                            {selectedFile.name}
                          </strong>

                          <span>
                            {(
                              selectedFile.size /
                              1024 /
                              1024
                            ).toFixed(2)}{" "}
                            MB
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                {editingMedia && (
                  <div className="current-storage full">
                    <strong>Current Storage</strong>

                    <span>
                      {getStorageLabel(
                        editingMedia.storage_type
                      )}
                    </span>

                    {editingMedia.storage_key && (
                      <small>
                        {editingMedia.storage_key}
                      </small>
                    )}
                  </div>
                )}
              </div>

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
                    : editingMedia
                    ? "Save Changes"
                    : "Add Media"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingMedia && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setViewingMedia(null);
            }
          }}
        >
          <div className="modal view-modal">
            <div className="modal-header">
              <div>
                <span className="page-eyebrow">
                  MEDIA PREVIEW
                </span>

                <h2>
                  {viewingMedia.title ||
                    "Untitled media"}
                </h2>
              </div>

              <button
                className="close-button"
                onClick={() =>
                  setViewingMedia(null)
                }
              >
                ×
              </button>
            </div>

            <div className="large-preview">
              <MediaPreview
                media={viewingMedia}
                large
              />
            </div>

            <div className="media-details">
              <div>
                <span>Type</span>
                <strong>
                  {getMediaTypeLabel(
                    viewingMedia.media_type
                  )}
                </strong>
              </div>

              <div>
                <span>Storage</span>
                <strong>
                  {getStorageLabel(
                    viewingMedia.storage_type
                  )}
                </strong>
              </div>

              <div>
                <span>Cultural Item</span>
                <strong>
                  {getCulturalItemTitle(
                    viewingMedia.cultural_item_id
                  )}
                </strong>
              </div>

              {viewingMedia.storage_key && (
                <div className="detail-full">
                  <span>Storage Key</span>
                  <strong>
                    {viewingMedia.storage_key}
                  </strong>
                </div>
              )}

              {getMediaUrl(viewingMedia) && (
                <div className="detail-full">
                  <a
                    href={getMediaUrl(viewingMedia)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open media in new tab →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

