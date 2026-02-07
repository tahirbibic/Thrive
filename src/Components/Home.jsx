const Home = () => {
  return (
    <div className="home-page">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: "Segoe UI", sans-serif;
        }

        body {
          overflow-x: hidden;
        }

        .home-page {
          min-height: 100vh;
          background: #0f172a;
          color: white;
        }

        .container {
          width: 1200px;
          margin: 0 auto;
        }

        .header {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(10px);
        }

        .header-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 25px 0;
        }

        .logo {
          font-size: 26px;
          font-weight: bold;
          letter-spacing: 3px;
          color: #38bdf8;
        }

        .nav {
          display: flex;
          gap: 35px;
        }

        .nav a {
          text-decoration: none;
          color: white;
          opacity: 0.8;
          font-size: 15px;
          transition: 0.2s;
        }

        .nav a:hover {
          opacity: 1;
          transform: translateY(-1px);
        }

        .hero {
          height: calc(100vh - 90px);
          display: flex;
          align-items: center;
          background: radial-gradient(circle at top, #1e293b, #020617);
        }

        .hero-inner {
          width: 100%;
          text-align: center;
        }

        .hero-content {
          width: 850px;
          margin: 0 auto;
        }

        .hero h1 {
          font-size: 3.8rem;
          margin-bottom: 25px;
        }

        .hero span {
          color: #38bdf8;
        }

        .hero p {
          font-size: 1.15rem;
          opacity: 0.85;
          margin-bottom: 45px;
          line-height: 1.7;
        }

        .hero-buttons {
          display: flex;
          justify-content: center;
          gap: 20px;
        }

        .hero-buttons button {
          padding: 16px 36px;
          border-radius: 40px;
          border: none;
          font-size: 16px;
          cursor: pointer;
          transition: 0.25s;
        }

        .btn-primary {
          background: #38bdf8;
          color: #020617;
          font-weight: bold;
        }

        .btn-primary:hover {
          transform: scale(1.08);
          box-shadow: 0 10px 30px rgba(56,189,248,0.35);
        }

        .btn-secondary {
          background: transparent;
          border: 2px solid #38bdf8;
          color: #38bdf8;
        }

        .btn-secondary:hover {
          background: #38bdf8;
          color: #020617;
        }

        .features {
          background: #020617;
          padding: 120px 0;
        }

        .features h2 {
          text-align: center;
          font-size: 2.6rem;
          margin-bottom: 70px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 35px;
        }

        .feature-card {
          background: #0f172a;
          padding: 35px;
          border-radius: 18px;
          transition: 0.3s;
          border: 1px solid rgba(255,255,255,0.06);
        }

        .feature-card:hover {
          transform: translateY(-12px);
          border-color: #38bdf8;
          box-shadow: 0 15px 40px rgba(56,189,248,0.18);
        }

        .feature-card h3 {
          margin-bottom: 14px;
          color: #38bdf8;
          font-size: 1.2rem;
        }

        .feature-card p {
          opacity: 0.85;
          line-height: 1.6;
        }

        .footer {
          background: #020617;
          padding: 35px 0;
          text-align: center;
          opacity: 0.6;
          font-size: 14px;
        }
      `}</style>

      <header className="header">
        <div className="container header-inner">
          <div className="logo">THRIVE</div>
          <nav className="nav">
            <a href="#">Početna</a>
            <a href="#">Izazovi</a>
            <a href="#">Zajednica</a>
            <a href="#">Prijavite se</a>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-content">
            <h1>
            <span>Van okvira.</span>
            </h1>

            <p>
              THRIVE je interaktivna platforma koja ti pomaže da razviješ društvene veštine,
              povećaš samopouzdanje i svakog dana napraviš mali iskorak iz zone komfora.
            </p>

            <div className="hero-buttons">
              <button className="btn-primary">Počni danas</button>
              <button className="btn-secondary">Kako to funkcioniše</button>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Kako THRIVE pomaže tvoj rast</h2>

          <div className="features-grid">
            <div className="feature-card">
              <h3>Dnevni izazovi</h3>
              <p>Personalizovani dnevni izazovi koji te postepeno vode van zone komfora.</p>
            </div>

            <div className="feature-card">
              <h3>Izgraditelj samopouzdanosti</h3>
              <p>Sistem za izgradnju samopouzdanja kroz male, ali konstantne korake.</p>
            </div>

            <div className="feature-card">
              <h3>Praćenje napretka</h3>
              <p>Vizuelni prikaz tvog rasta i društvenog napretka.</p>
            </div>

            <div className="feature-card">
              <h3>Zajednica</h3>
              <p>Povezivanje sa drugima, timski izazovi i deljenje iskustava.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          © 2026 THRIVE — Van okvira.
        </div>
      </footer>
    </div>
  );
};

export default Home;