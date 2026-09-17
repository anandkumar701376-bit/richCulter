import "./Community.css";

export default function Community({ onNavigate }) {
  return (
    <div className="community-page">

      {/* =================================================
          HERO
          ================================================= */}

      <section className="community-hero">

        <div className="community-hero-content">

          <span>
            RICH CULTURE COMMUNITY
          </span>

          <h1>
            Share. Discover.
            <br />
            Preserve.
          </h1>

          <p>
            A future space where people can share cultural
            knowledge, stories, traditions and heritage from
            across India.
          </p>

          <div className="community-hero-actions">

            <button
              className="community-primary-button"
              onClick={() => onNavigate?.("about")}
            >
              Learn About Rich Culture
              <span>→</span>
            </button>

            <button
              className="community-secondary-button"
              onClick={() => onNavigate?.("explore")}
            >
              Explore Heritage
            </button>

          </div>

        </div>


        <div className="community-hero-symbol">

          <div className="community-symbol-circle">
            🪷
          </div>

          <span>
            MANY VOICES
          </span>

          <strong>
            ONE HERITAGE
          </strong>

        </div>

      </section>


      {/* =================================================
          INTRO
          ================================================= */}

      <section className="community-intro">

        <span>
          BUILDING TOGETHER
        </span>

        <h2>
          Culture belongs to everyone
        </h2>

        <p>
          India's cultural heritage is shaped by millions of
          communities, families and generations. Rich Culture
          aims to create a digital space where this knowledge
          can be discovered and preserved.
        </p>

      </section>


      {/* =================================================
          COMMUNITY FEATURES
          ================================================= */}

      <section className="community-features">

        <article className="community-feature-card">

          <div className="community-feature-icon">
            ✦
          </div>

          <h3>
            Share Knowledge
          </h3>

          <p>
            Help document cultural traditions, stories,
            festivals, arts, food and other forms of heritage.
          </p>

          <span className="community-coming">
            COMING SOON
          </span>

        </article>


        <article className="community-feature-card">

          <div className="community-feature-icon">
            ♧
          </div>

          <h3>
            Connect Communities
          </h3>

          <p>
            Discover cultural knowledge from different
            regions and communities across India.
          </p>

          <span className="community-coming">
            COMING SOON
          </span>

        </article>


        <article className="community-feature-card">

          <div className="community-feature-icon">
            ◈
          </div>

          <h3>
            Preserve Heritage
          </h3>

          <p>
            Contribute information that can help preserve
            India's diverse cultural heritage digitally.
          </p>

          <span className="community-coming">
            COMING SOON
          </span>

        </article>

      </section>


      {/* =================================================
          CONTRIBUTION FLOW
          ================================================= */}

      <section className="community-flow">

        <div className="community-flow-heading">

          <span>
            FUTURE CONTRIBUTION
          </span>

          <h2>
            How the Community will work
          </h2>

        </div>


        <div className="community-flow-steps">

          <div className="community-flow-step">

            <div className="community-step-number">
              01
            </div>

            <div>
              <h3>
                Discover
              </h3>

              <p>
                Explore cultural heritage already available
                on Rich Culture.
              </p>
            </div>

          </div>


          <div className="community-flow-line" />


          <div className="community-flow-step">

            <div className="community-step-number">
              02
            </div>

            <div>
              <h3>
                Contribute
              </h3>

              <p>
                Share cultural knowledge, stories or media
                with the platform.
              </p>
            </div>

          </div>


          <div className="community-flow-line" />


          <div className="community-flow-step">

            <div className="community-step-number">
              03
            </div>

            <div>
              <h3>
                Review
              </h3>

              <p>
                Contributions can be reviewed before becoming
                part of the public collection.
              </p>
            </div>

          </div>


          <div className="community-flow-line" />


          <div className="community-flow-step">

            <div className="community-step-number">
              04
            </div>

            <div>
              <h3>
                Preserve
              </h3>

              <p>
                Approved cultural knowledge becomes part of
                the growing digital heritage collection.
              </p>
            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          CTA
          ================================================= */}

      <section className="community-cta">

        <div>

          <span>
            EXPLORE TODAY
          </span>

          <h2>
            Start discovering India's heritage
          </h2>

          <p>
            Explore states, categories and cultural traditions
            already available on Rich Culture.
          </p>

        </div>

        <button
          onClick={() => onNavigate?.("explore")}
        >
          Explore India
          <span>→</span>
        </button>

      </section>

    </div>
  );
}