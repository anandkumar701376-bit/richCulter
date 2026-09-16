import { useEffect, useState } from "react";

import { api } from "../../services/api";

import "./CulturalItemDetail.css";


export default function CulturalItemDetail({
  item,
  onNavigate,
}) {
  const [details, setDetails] = useState(null);
  const [media, setMedia] = useState([]);
  const [sources, setSources] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // =====================================================
  // LOAD CULTURAL ITEM DETAILS
  // =====================================================

  useEffect(() => {
    async function loadDetails() {
      if (!item?.id) {
        setLoading(false);
        setError("Cultural item was not selected.");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [
          detailsData,
          mediaData,
          sourcesData,
        ] = await Promise.all([
          api.getCulturalItemDetails(item.id),
          api.getMediaForItem(item.id),
          api.getSourcesForItem(item.id),
        ]);

        setDetails(detailsData || item);
        setMedia(Array.isArray(mediaData) ? mediaData : []);
        setSources(
          Array.isArray(sourcesData)
            ? sourcesData
            : []
        );

      } catch (err) {
        console.error(
          "Failed to load cultural item details:",
          err
        );

        setError(
          err.message ||
          "Unable to load cultural item details."
        );

        // Keep the basic item information available
        setDetails(item);

      } finally {
        setLoading(false);
      }
    }

    loadDetails();
  }, [item]);


  // =====================================================
  // BACK TO STATE
  // =====================================================

  function handleBack() {
    onNavigate?.("home");
  }


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="cultural-detail-page">

        <div className="cultural-detail-loading">

          <div className="detail-loading-spinner" />

          <h2>
            Loading cultural heritage...
          </h2>

          <p>
            Fetching information from Rich Culture.
          </p>

        </div>

      </div>
    );
  }


  // =====================================================
  // NO ITEM
  // =====================================================

  if (!item) {
    return (
      <div className="cultural-detail-page">

        <div className="cultural-detail-empty">

          <span>
            CULTURAL HERITAGE
          </span>

          <h1>
            No cultural item selected
          </h1>

          <p>
            Please return to the India map and
            select a cultural heritage item.
          </p>

          <button
            onClick={handleBack}
          >
            ← Back to India
          </button>

        </div>

      </div>
    );
  }


  const culturalItem =
    details || item;


  // =====================================================
  // FIND MAIN IMAGE
  // =====================================================

  const imageMedia =
    media.find(
      (mediaItem) =>
        mediaItem.media_type === "image" &&
        mediaItem.media_url
    );


  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="cultural-detail-page">


      {/* =================================================
          BACK
          ================================================= */}

      <button
        className="cultural-detail-back"
        onClick={handleBack}
      >
        ← Back to India
      </button>


      {/* =================================================
          ERROR
          ================================================= */}

      {error && (
        <div className="cultural-detail-error">
          {error}
        </div>
      )}


      {/* =================================================
          HERO / MAIN INFORMATION
          ================================================= */}

      <section className="cultural-detail-hero">


        {/* IMAGE */}

        <div className="cultural-detail-image">

          {imageMedia ? (

            <img
              src={imageMedia.media_url}
              alt={culturalItem.title}
            />

          ) : (

            <div className="cultural-detail-image-empty">
              ◆
            </div>

          )}

        </div>


        {/* CONTENT */}

        <div className="cultural-detail-main">

          <span className="cultural-detail-label">
            CULTURAL HERITAGE
          </span>

          <h1>
            {culturalItem.title}
          </h1>

          {culturalItem.state_name && (
            <div className="cultural-detail-location">
              📍 {culturalItem.state_name}
            </div>
          )}

          <p className="cultural-detail-description">
            {culturalItem.description ||
              "Discover this cultural heritage of India."}
          </p>


          {/* CATEGORY */}

          {culturalItem.category_name && (
            <div className="cultural-detail-category">

              <span>
                CATEGORY
              </span>

              <strong>
                {culturalItem.category_name}
              </strong>

            </div>
          )}

        </div>

      </section>


      {/* =================================================
          ABOUT
          ================================================= */}

      <section className="cultural-detail-section">

        <span className="detail-section-label">
          ABOUT
        </span>

        <h2>
          {culturalItem.title}
        </h2>

        <p>
          {culturalItem.description ||
            "Information about this cultural heritage entry will appear here."}
        </p>

      </section>


      {/* =================================================
          MEDIA
          ================================================= */}

      {media.length > 0 && (

        <section className="cultural-detail-section">

          <span className="detail-section-label">
            MEDIA
          </span>

          <h2>
            Cultural Media
          </h2>

          <div className="cultural-media-grid">

            {media.map((mediaItem) => (

              <div
                className="cultural-media-card"
                key={mediaItem.id}
              >

                {mediaItem.media_type === "image" &&
                  mediaItem.media_url ? (

                  <img
                    src={mediaItem.media_url}
                    alt={
                      mediaItem.title ||
                      culturalItem.title
                    }
                  />

                ) : (

                  <div className="media-placeholder">

                    <span>
                      {mediaItem.media_type
                        ?.toUpperCase() ||
                        "MEDIA"}
                    </span>

                  </div>

                )}

                {mediaItem.title && (
                  <p>
                    {mediaItem.title}
                  </p>
                )}

              </div>

            ))}

          </div>

        </section>

      )}


      {/* =================================================
          SOURCES
          ================================================= */}

      <section className="cultural-detail-section">

        <span className="detail-section-label">
          SOURCES
        </span>

        <h2>
          References
        </h2>


        {sources.length > 0 ? (

          <div className="cultural-sources">

            {sources.map((source) => (

              <div
                className="cultural-source-card"
                key={source.id}
              >

                <div className="source-icon">
                  ◈
                </div>

                <div>

                  <strong>
                    {source.name ||
                      source.title ||
                      "Cultural Source"}
                  </strong>

                  {source.description && (
                    <p>
                      {source.description}
                    </p>
                  )}

                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Visit source →
                    </a>
                  )}

                </div>

              </div>

            ))}

          </div>

        ) : (

          <div className="no-cultural-sources">
            Source information will appear here.
          </div>

        )}

      </section>


      {/* =================================================
          FOOTER ACTION
          ================================================= */}

      <div className="cultural-detail-footer">

        <button
          onClick={handleBack}
        >
          ← Explore More Indian Culture
        </button>

      </div>


    </div>
  );
}