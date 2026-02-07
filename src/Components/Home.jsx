<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>THRIVE</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: "Segoe UI", sans-serif;
    }

    body {
      background: #0f172a;
      color: white;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 60px;
      background: rgba(255,255,255,0.03);
      backdrop-filter: blur(10px);
    }

    .logo {
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 2px;
      color: #38bdf8;
    }

    nav a {
      margin-left: 25px;
      text-decoration: none;
      color: white;
      opacity: 0.8;
    }

    nav a:hover {
      opacity: 1;
    }

    .hero {
      min-height: 90vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 40px;
      background: radial-gradient(circle at top, #1e293b, #020617);
    }

    .hero-content {
      max-width: 700px;
    }

    .hero h1 {
      font-size: 3rem;
      margin-bottom: 20px;
    }

    .hero span {
      color: #38bdf8;
    }

    .hero p {
      font-size: 1.1rem;
      opacity: 0.8;
      margin-bottom: 35px;
    }

    .hero-buttons button {
      padding: 14px 28px;
      margin: 10px;
      border-radius: 30px;
      border: none;
      font-size: 16px;
      cursor: pointer;
      transition: 0.3s;
    }

    .btn-primary {
      background: #38bdf8;
      color: #020617;
      font-weight: bold;
    }

    .btn-primary:hover {
      transform: scale(1.05);
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
      padding: 80px 60px;
      background: #020617;
      text-align: center;
    }

    .features h2 {
      font-size: 2.2rem;
      margin-bottom: 50px;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
    }

    .feature-card {
      background: #0f172a;
      padding: 30px;
      border-radius: 16px;
      transition: 0.3s;
      border: 1px solid rgba(255,255,255,0.05);
    }

    .feature-card:hover {
      transform: translateY(-8px);
      border-color: #38bdf8;
    }

    .feature-card h3 {
      margin-bottom: 10px;
      color: #38bdf8;
    }

    footer {
      padding: 30px;
      text-align: center;
      background: #020617;
      opacity: 0.6;
      font-size: 14px;
    }
  </style>
</head>

<body>
  <header>
    <div class="logo">THRIVE</div>
    <nav>
      <a href="#">Home</a>
      <a href="#">Challenges</a>
      <a href="#">Community</a>
      <a href="#">Login</a>
    </nav>
  </header>

  <!-- HERO -->
  <section class="hero">
    <div class="hero-content">
      <h1>Grow socially. <span>Live boldly.</span></h1>
      <p>
        THRIVE je interaktivna platforma koja ti pomaže da razviješ društvene veštine,
        povećaš samopouzdanje i svakog dana napraviš mali iskorak iz zone komfora.
      </p>

      <div class="hero-buttons">
        <button class="btn-primary">Start Today</button>
        <button class="btn-secondary">How it works</button>
      </div>
    </div>
  </section>

  <!-- FEATURES -->
  <section class="features">
    <h2>How THRIVE helps you grow</h2>

    <div class="features-grid">
      <div class="feature-card">
        <h3>Daily Challenges</h3>
        <p>Personalizovani dnevni izazovi koji te postepeno vode van zone komfora.</p>
      </div>

      <div class="feature-card">
        <h3>Confidence Builder</h3>
        <p>Sistem za izgradnju samopouzdanja kroz male, ali konstantne korake.</p>
      </div>

      <div class="feature-card">
        <h3>Progress Tracking</h3>
        <p>Vizuelni prikaz tvog rasta i društvenog napretka.</p>
      </div>

      <div class="feature-card">
        <h3>Community</h3>
        <p>Povezivanje sa drugima, timski izazovi i deljenje iskustava.</p>
      </div>
    </div>
  </section>

  <footer>
    © 2026 THRIVE — Z. Live boldly.
  </footer>

</body>
</html>
