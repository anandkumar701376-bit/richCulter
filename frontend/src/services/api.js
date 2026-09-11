import DataEntryLayout from "./src/layoutes/DataEntryLayout";

export default function App() {
  return <DataEntryLayout />;
}const API_BASE_URL = "http://10.50.46.184:8000/api";

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
      // Keep the default error message.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  getStates: () => request("/states"),

  getCategories: () => request("/categories"),

  getCulturalItems: (params = {}) => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value);
      }
    });

    const query = searchParams.toString();

    return request(
      `/cultural-items${query ? `?${query}` : ""}`
    );
  },

  getMedia: () => request("/media"),

  getSources: () => request("/sources"),

  search: (query) =>
    request(`/search?q=${encodeURIComponent(query)}`),
};