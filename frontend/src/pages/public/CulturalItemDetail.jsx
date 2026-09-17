import { useEffect, useState } from "react";

import { api } from "../../services/api";

import "./CulturalItemDetail.css";


export default function CulturalItemDetail({
  item,
  onNavigate,
  returnState,
}) {
  const [details, setDetails] = useState(null);
  const [media, setMedia] = useState([]);
  const [sources, setSources] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Currently selected image
  const [selectedImage, setSelectedImage] = useState(null);

  // Fullscreen image viewer
  const [lightboxOpen, setLightboxOpen] = useState(false);


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

        const loadedMedia =
          Array.isArray(mediaData)
            ? mediaData
            : [];

        setDetails(detailsData || item);
        setMedia(loadedMedia);

        setSources(
          Array.isArray(sourcesData)
            ? sourcesData
            : []
        );

        // Select first available image
        const firstImage =
          loadedMedia.find(
            (mediaItem) =>
              mediaItem.media_type === "image" &&
              mediaItem.media_url
          );

        setSelectedImage(firstImage || null);

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
    onNavigate?.("home", returnState);
  }


  // =====================================================
  // OPEN IMAGE
  // =====================================================

  function openImage(mediaItem) {
    if (
      mediaItem?.media_type === "image" &&
      mediaItem?.media_url
    ) {
      setSelectedImage(mediaItem);
      setLightboxOpen(true);
    }
  }


  // =====================================================
  // CLOSE IMAGE VIEWER
  // =====================================================

  function closeLightbox() {
    setLightboxOpen(false);
  }


  // =====================================================
  // KEYBOARD HANDLING
  // =====================================================

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setLightboxOpen(false);
      }
    }

    if (lightboxOpen) {
      document.addEventListener(
        "keydown",
        handleKeyDown
      );
    }

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [lightboxOpen]);


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
  // IMAGE MEDIA
  // =====================================================

  const imageMedia =
    media.filter(
      (mediaItem) =>
        mediaItem.media_type === "image" &&
        mediaItem.media_url
    );


  // =====================================================
  // MAIN IMAGE
  // =====================================================

  const mainImage =
    selectedImage || imageMedia[0] || null;


  // =====================================================
  // OTHER MEDIA
  // =====================================================

  const otherMedia =
    media.filter(
      (mediaItem) =>
        mediaItem.media_type !== "image"
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
        <span className="back-arrow">
          ←
        </span>

        <span>
          Back to {returnState?.name || "India"}
        </span>
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


        {/* =================================================
            MEDIA AREA
            ================================================= */}

        <div className="cultural-detail-media-area">


          {/* MAIN IMAGE */}

          <div
            className={
              mainImage
                ? "cultural-detail-image cultural-detail-image-clickable"
                : "cultural-detail-image"
            }
            onClick={() =>
              mainImage && openImage(mainImage)
            }
          >

            {mainImage ? (

              <img
                src={mainImage.media_url}
                alt={
                  mainImage.title ||
                  culturalItem.title
                }
              />

            ) : (

              <div className="cultural-detail-image-empty">
                ◆
              </div>

            )}

            {mainImage && (
              <div className="image-view-hint">
                Click to view larger
              </div>
            )}

          </div>


          {/* THUMBNAILS */}

          {imageMedia.length > 1 && (

            <div className="cultural-detail-thumbnails">

              {imageMedia.map((mediaItem) => {

                const isActive =
                  selectedImage?.id ===
                  mediaItem.id;

                return (
                  <button
                    key={mediaItem.id}
                    type="button"
                    className={
                      isActive
                        ? "cultural-detail-thumbnail active"
                        : "cultural-detail-thumbnail"
                    }
                    onClick={() =>
                      setSelectedImage(mediaItem)
                    }
                  >

                    <img
                      src={mediaItem.media_url}
                      alt={
                        mediaItem.title ||
                        culturalItem.title
                      }
                    />

                  </button>
                );

              })}

            </div>

          )}


          {/* CURRENT IMAGE TITLE */}

          {mainImage?.title && (
            <div className="cultural-detail-image-caption">
              {mainImage.title}
            </div>
          )}

        </div>


        {/* =================================================
            CONTENT
            ================================================= */}

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


          {/* IMAGE GALLERY */}

          {imageMedia.length > 0 && (

            <div className="cultural-media-grid">

              {imageMedia.map((mediaItem) => (

                <button
                  type="button"
                  className="cultural-media-card"
                  key={mediaItem.id}
                  onClick={() =>
                    openImage(mediaItem)
                  }
                >

                  <img
                    src={mediaItem.media_url}
                    alt={
                      mediaItem.title ||
                      culturalItem.title
                    }
                  />

                  {mediaItem.title && (
                    <p>
                      {mediaItem.title}
                    </p>
                  )}

                </button>

              ))}

            </div>

          )}


          {/* OTHER MEDIA */}

          {otherMedia.length > 0 && (

            <div className="cultural-other-media">

              {otherMedia.map((mediaItem) => (

                <div
                  className="media-placeholder"
                  key={mediaItem.id}
                >

                  <span>
                    {mediaItem.media_type
                      ?.toUpperCase() ||
                      "MEDIA"}
                  </span>

                  {mediaItem.title && (
                    <p>
                      {mediaItem.title}
                    </p>
                  )}

                </div>

              ))}

            </div>

          )}

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


      {/* =================================================
          FULLSCREEN IMAGE VIEWER
          ================================================= */}

      {lightboxOpen && mainImage && (

        <div
          className="cultural-image-lightbox"
          onClick={closeLightbox}
        >

          <button
            type="button"
            className="cultural-image-lightbox-close"
            onClick={closeLightbox}
            aria-label="Close image viewer"
          >
            ×
          </button>


          <div
            className="cultural-image-lightbox-content"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <img
              src={mainImage.media_url}
              alt={
                mainImage.title ||
                culturalItem.title
              }
            />

            {mainImage.title && (
              <p>
                {mainImage.title}
              </p>
            )}

          </div>

        </div>

      )}

    </div>
  );
}