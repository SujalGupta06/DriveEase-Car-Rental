import "./Hero.css";

function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-container">

        {/* Left Content */}
        <div className="hero-content">

          <span className="hero-label">
            PREMIUM MOBILITY NETWORK
          </span>

          <h1>
            Rent Your
            <br />
            <span>Perfect Car.</span>
          </h1>

          <p>
            Experience freedom on every journey with our premium
            collection of verified vehicles and seamless rental
            experience.
          </p>

          <div className="hero-stats">

            <div className="hero-stat">
              <h3>12,500+</h3>
              <p>Active Fleet</p>
            </div>

            <div className="hero-stat">
              <h3>4.9/5</h3>
              <p>Client Rating</p>
            </div>

            <div className="hero-stat">
              <h3>100%</h3>
              <p>Transparent Fee</p>
            </div>

          </div>

        </div>

        {/* Right Image */}
        <div className="hero-image-wrapper">

          <img
            src="https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80"
            alt="Premium rental car"
            className="hero-image"
          />

          <div className="hero-image-overlay">
            <span>EXECUTIVE CLASS</span>
            <strong>Premium Collection</strong>
          </div>

        </div>

      </div>
    </section>
  );
}

export default Hero;