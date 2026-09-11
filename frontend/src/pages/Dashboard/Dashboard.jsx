import { useEffect, useState } from "react";
import { api } from "../../services/api";
import "./Dashboard.css";

export default function Dashboard() {
  const [stats, setStats] = useState({
    states: 0,
    categories: 0,
    culturalItems: 0,
    media: 0,
    sources: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [
          statesResponse,
          categoriesResponse,
          culturalItemsResponse,
          mediaResponse,
          sourcesResponse,
        ] = await Promise.all([
          api.getStates(),
          api.getCategories(),
          api.getCulturalItems({ page: 1, limit: 1 }),
          api.getMedia(),
          api.getSources(),
        ]);

        setStats({
          states: Array.isArray(statesResponse)
            ? statesResponse.length
            : statesResponse.items?.length ?? 0,

          categories: Array.isArray(categoriesResponse)
            ? categoriesResponse.length
            : categoriesResponse.items?.length ?? 0,

          culturalItems:
            culturalItemsResponse.total ??
            culturalItemsResponse.items?.length ??
            0,

          media: Array.isArray(mediaResponse)
            ? mediaResponse.length
            : mediaResponse.items?.length ?? 0,

          sources: Array.isArray(sourcesResponse)
            ? sourcesResponse.length
            : sourcesResponse.items?.length ?? 0,
        });
      } catch (err) {
        setError(err.message || "Unable to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const cards = [
    {
      label: "States & UTs",
      value: stats.states,
      description: "Available for data entry",
    },
    {
      label: "Categories",
      value: stats.categories,
      description: "Cultural classifications",
    },
    {
      label: "Cultural Items",
      value: stats.culturalItems,
      description: "Current database records",
    },
    {
      label: "Media",
      value: stats.media,
      description: "Images, video & audio",
    },
    {
      label: "Sources",
      value: stats.sources,
      description: "Reference records",
    },
  ];

  return (
    <div className="dashboard">
      <div className="welcome">
        <div>
          <span className="section-label">WORKSPACE OVERVIEW</span>
          <h1>Culture Data Entry</h1>
          <p>
            Enter, manage and organize India's cultural heritage
            information.
          </p>
        </div>

        <div className="welcome-mark">C</div>
      </div>

      {error && (
        <div className="error-box">
          <strong>Unable to load dashboard</strong>
          <span>{error}</span>
        </div>
      )}

      <div className="stats-grid">
        {cards.map((card) => (
          <div className="stat-card" key={card.label}>
            <span className="stat-label">{card.label}</span>

            <strong className="stat-value">
              {loading ? "—" : card.value}
            </strong>

            <span className="stat-description">
              {card.description}
            </span>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="section-label">DATA WORKFLOW</span>
              <h2>What to enter</h2>
            </div>
          </div>

          <div className="workflow-list">
            <div className="workflow-item">
              <span>01</span>
              <div>
                <strong>Cultural Item</strong>
                <p>State, category, title and description</p>
              </div>
            </div>

            <div className="workflow-item">
              <span>02</span>
              <div>
                <strong>Media</strong>
                <p>Images, videos and audio associated with the item</p>
              </div>
            </div>

            <div className="workflow-item">
              <span>03</span>
              <div>
                <strong>Sources</strong>
                <p>References used to verify the information</p>
              </div>
            </div>
          </div>
        </section>

        <section className="panel quick-panel">
          <span className="section-label">NEXT</span>
          <h2>Data Entry Forms</h2>
          <p>
            The next screen will let your team create complete
            cultural items and attach their media and sources.
          </p>

          <div className="next-status">
            <span className="status-dot" />
            Backend API connected
          </div>
        </section>
      </div>
    </div>
  );
}