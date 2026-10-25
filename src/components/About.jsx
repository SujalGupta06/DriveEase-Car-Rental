import "./About.css";

function About() {
  return (
    <section id="about" className="about-section">
      <div className="about-container">

        <div className="about-content">
          <span className="section-label">ABOUT DRIVE EASE</span>

          <h2>
            Your Journey,
            <br />
            <span>Our Responsibility.</span>
          </h2>

          <p>
            DriveEase is a modern car rental platform designed to make
            renting a car simple, transparent, and convenient.
          </p>

          <p>
            Browse verified vehicles, choose your preferred dates,
            check availability, and book your car with ease.
          </p>

          <div className="about-stats">
            <div>
              <h3>12,500+</h3>
              <p>Vehicles</p>
            </div>

            <div>
              <h3>4.9/5</h3>
              <p>Customer Rating</p>
            </div>

            <div>
              <h3>24/7</h3>
              <p>Support</p>
            </div>
          </div>
        </div>

        <div className="about-card">
          <div className="about-card-icon">🚗</div>

          <h3>Premium Mobility</h3>

          <p>
            From city rides to long journeys, find a vehicle
            that fits your needs and budget.
          </p>
        </div>

      </div>
    </section>
  );
}

export default About;