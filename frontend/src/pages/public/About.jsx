import "./About.css";

export default function About({ onNavigate }) {
  return (
    <div className="about-page">

      {/* =================================================
          HERO
          ================================================= */}

      <section className="about-hero">

        <div className="about-hero-content">

          <span>
            ABOUT RICH CULTURE
          </span>

          <h1>
            India's Heritage,
            <br />
            Digitally Preserved.
          </h1>

          <p>
            Rich Culture is a digital platform designed to
            help people explore, understand and appreciate
            India's diverse cultural heritage.
          </p>

          <button
            className="about-hero-button"
            onClick={() => onNavigate?.("explore")}
          >
            Explore India's Heritage
            <span>→</span>
          </button>

        </div>


        <div className="about-hero-emblem">

          <div className="about-emblem-circle">
            🇮🇳
          </div>

          <span>
            RICH CULTURE
          </span>

          <strong>
            MANY CULTURES
          </strong>

          <small>
            ONE INDIA
          </small>

        </div>

      </section>


      {/* =================================================
          WHAT IS RICH CULTURE
          ================================================= */}

      <section className="about-introduction">

        <div className="about-section-label">
          OUR PLATFORM
        </div>

        <h2>
          What is Rich Culture?
        </h2>

        <p>
          India has an extraordinary variety of cultural
          traditions, festivals, arts, food, music, crafts
          and community practices. Rich Culture brings this
          diversity together in one digital platform.
        </p>

        <p>
          The platform organizes cultural heritage by
          <strong> States & UTs</strong>,
          <strong> Cultural Categories</strong> and
          individual <strong>Cultural Items</strong>,
          making it easier to discover India's heritage.
        </p>

      </section>


      {/* =================================================
          PLATFORM AREAS
          ================================================= */}

      <section className="about-platform">

        <div className="about-section-heading">

          <span>
            DISCOVER
          </span>

          <h2>
            One platform, many ways to explore
          </h2>

        </div>


        <div className="about-platform-grid">

          <article className="about-platform-card">

            <div className="about-card-icon">
              ◎
            </div>

            <h3>
              Explore India
            </h3>

            <p>
              Discover cultural heritage from different
              regions of India through an interactive
              exploration experience.
            </p>

            <button
              onClick={() => onNavigate?.("explore")}
            >
              Explore
              <span>→</span>
            </button>

          </article>


          <article className="about-platform-card">

            <div className="about-card-icon">
              ◈
            </div>

            <h3>
              States & UTs
            </h3>

            <p>
              Browse India's States and Union Territories
              and discover the cultural heritage associated
              with each region.
            </p>

            <button
              onClick={() => onNavigate?.("states")}
            >
              View States
              <span>→</span>
            </button>

          </article>


          <article className="about-platform-card">

            <div className="about-card-icon">
              ▦
            </div>

            <h3>
              Cultural Categories
            </h3>

            <p>
              Explore heritage through categories such as
              festivals, traditions, arts and other cultural
              forms.
            </p>

            <button
              onClick={() => onNavigate?.("categories")}
            >
              View Categories
              <span>→</span>
            </button>

          </article>

        </div>

      </section>


      {/* =================================================
          MISSION
          ================================================= */}

      <section className="about-mission">

        <div className="about-mission-symbol">
          🪷
        </div>

        <div className="about-mission-content">

          <span>
            OUR PURPOSE
          </span>

          <h2>
            Explore · Preserve · Celebrate
          </h2>

          <p>
            Rich Culture aims to make India's cultural
            heritage easier to discover while creating a
            foundation for preserving cultural knowledge
            digitally.
          </p>

          <div className="about-mission-points">

            <div>
              <strong>
                Explore
              </strong>

              <span>
                Make cultural knowledge accessible.
              </span>
            </div>

            <div>
              <strong>
                Preserve
              </strong>

              <span>
                Create a digital record of heritage.
              </span>
            </div>

            <div>
              <strong>
                Celebrate
              </strong>

              <span>
                Encourage appreciation of India's diversity.
              </span>
            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          TECHNOLOGY
          ================================================= */}

      <section className="about-technology">

        <div className="about-section-heading">

          <span>
            TECHNOLOGY
          </span>

          <h2>
            Technology behind Rich Culture
          </h2>

          <p>
            The platform is being developed with modern
            web technologies to create a scalable digital
            heritage system.
          </p>

        </div>


        <div className="about-tech-grid">

          <div className="about-tech-item">
            <strong>
              React
            </strong>

            <span>
              Interactive frontend
            </span>
          </div>


          <div className="about-tech-item">
            <strong>
              FastAPI
            </strong>

            <span>
              Backend API
            </span>
          </div>


          <div className="about-tech-item">
            <strong>
              PostgreSQL
            </strong>

            <span>
              Cultural heritage database
            </span>
          </div>


          <div className="about-tech-item">
            <strong>
              REST API
            </strong>

            <span>
              Frontend-backend communication
            </span>
          </div>

        </div>

      </section>


      {/* =================================================
          COMMUNITY
          ================================================= */}

      <section className="about-community">

        <div>

          <span>
            FUTURE VISION
          </span>

          <h2>
            Built for communities
          </h2>

          <p>
            Rich Culture is designed with a future community
            contribution system in mind, where cultural
            knowledge can be shared, reviewed and preserved
            digitally.
          </p>

        </div>

        <button
          onClick={() => onNavigate?.("community")}
        >
          Visit Community
          <span>→</span>
        </button>

      </section>


      {/* =================================================
          PROJECT
          ================================================= */}

      <section className="about-project">

        <div className="about-project-badge">
          SIH
        </div>

        <div>

          <span>
            PROJECT
          </span>

          <h2>
            Rich Culture
          </h2>

          <p>
            A digital Indian cultural heritage platform
            developed as a Smart India Hackathon project.
          </p>

        </div>

      </section>

    </div>
  );
}