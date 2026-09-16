const API_BASE_URL = "http://192.168.29.234:8000/api";

// FastAPI server URL without /api
const API_SERVER_URL = "http://192.168.29.234:8000";

// =====================================================
// MEDIA URL HELPER
// =====================================================

function getMediaUrl(media) {
  if (!media) {
    return "";
  }

  if (media.storage_type === "external" && media.url) {
    return media.url;
  }

  if (media.storage_type === "local" && media.storage_key) {
    return `${API_SERVER_URL}/media/${media.storage_key}`;
  }

  if (media.url) {
    return media.url;
  }

  return "";
}

// =====================================================
// GENERIC REQUEST
// =====================================================

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;

    try {
      const data = await response.json();
      message = data.detail || message;
    } catch {
      // Keep default error
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// =====================================================
// API
// =====================================================

export const api = {
  // ===================================================
  // STATES
  // ===================================================

  getStates: () =>
    request("/states"),

  createState: (data) =>
    request("/states", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateState: (id, data) =>
    request(`/states/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteState: (id) =>
    request(`/states/${id}`, {
      method: "DELETE",
    }),

  // ===================================================
  // CATEGORIES
  // ===================================================

  getCategories: () =>
    request("/categories"),

  createCategory: (data) =>
    request("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateCategory: (id, data) =>
    request(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteCategory: (id) =>
    request(`/categories/${id}`, {
      method: "DELETE",
    }),

  // ===================================================
  // CULTURAL ITEMS
  // ===================================================

  getCulturalItems: (params = {}) => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        searchParams.append(key, value);
      }
    });

    const query = searchParams.toString();

    return request(
      `/cultural-items${query ? `?${query}` : ""}`
    );
  },

  createCulturalItem: (data) =>
    request("/cultural-items", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getCulturalItemDetails: (id) =>
    request(`/cultural-items/${id}/details`),

  updateCulturalItem: (id, data) =>
    request(`/cultural-items/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteCulturalItem: (id) =>
    request(`/cultural-items/${id}`, {
      method: "DELETE",
    }),

  // ===================================================
  // MEDIA
  // ===================================================

  getMedia: async () => {
    const media = await request("/media");

    return media.map((item) => ({
      ...item,
      media_url: getMediaUrl(item),
    }));
  },

  getMediaForItem: async (culturalItemId) => {
    const media = await request(
      `/media/cultural-item/${culturalItemId}`
    );

    return media.map((item) => ({
      ...item,
      media_url: getMediaUrl(item),
    }));
  },

  getMediaById: async (id) => {
    const media = await request(`/media/${id}`);

    return {
      ...media,
      media_url: getMediaUrl(media),
    };
  },

  createMedia: (data) =>
    request("/media", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateMedia: (id, data) =>
    request(`/media/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteMedia: (id) =>
    request(`/media/${id}`, {
      method: "DELETE",
    }),

  uploadMedia: async ({
    cultural_item_id,
    media_type,
    title,
    file,
  }) => {
    const params = new URLSearchParams();

    params.append(
      "cultural_item_id",
      cultural_item_id
    );

    params.append(
      "media_type",
      media_type
    );

    if (title) {
      params.append("title", title);
    }

    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(
      `${API_BASE_URL}/media/upload?${params.toString()}`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      let message = `Request failed: ${response.status}`;

      try {
        const data = await response.json();
        message = data.detail || message;
      } catch {
        // Keep default error
      }

      throw new Error(message);
    }

    const media = await response.json();

    return {
      ...media,
      media_url: getMediaUrl(media),
    };
  },

  // ===================================================
  // SOURCES
  // ===================================================

  getSources: () =>
    request("/sources"),

  getSourcesForItem: (culturalItemId) =>
    request(
      `/sources/cultural-item/${culturalItemId}`
    ),

  getSourceById: (id) =>
    request(`/sources/${id}`),

  createSource: (data) =>
    request("/sources", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateSource: (id, data) =>
    request(`/sources/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteSource: (id) =>
    request(`/sources/${id}`, {
      method: "DELETE",
    }),

  // ===================================================
  // SEARCH
  // ===================================================

  search: (query) =>
    request(
      `/search?q=${encodeURIComponent(query)}`
    ),
};