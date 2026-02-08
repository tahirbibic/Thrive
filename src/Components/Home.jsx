import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const lastScrollY = useRef(0);
  const [showHeader, setShowHeader] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 80) {
        setShowHeader(true);
      } else if (currentScrollY > lastScrollY.current) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <style>{`
        html, body, #root {
          width: 100%;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: "Inter", sans-serif;
          scroll-behavior: smooth;
        }

        .home {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
          color: white;
        }

        .header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 60px;
          background: rgba(10, 20, 26, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          transform: translateY(0);
          transition: transform 0.35s ease;
        }

        .header.hidden {
          transform: translateY(-100%);
        }

        .logo {
          font-size: 1.8rem;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .nav a {
          margin-left: 30px;
          text-decoration: none;
          color: white;
          opacity: 0.85;
          transition: opacity 0.2s ease, transform 0.2s ease;
          cursor: pointer;
        }

        .nav a:hover {
          opacity: 1;
          transform: translateY(-1px);
        }

        .login-btn {
          padding: 10px 20px;
          border-radius: 999px;
          background: #00ffb3;
          color: #0f2027;
          font-weight: 700;
          opacity: 1;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 255, 179, 0.35);
        }

        .hero {
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding-top: 80px;
        }

        .slogan {
          font-size: 4rem;
          font-weight: 800;
          margin-bottom: 20px;
        }

        .tagline {
          font-size: 1.2rem;
          opacity: 0.9;
          max-width: 500px;
          margin-bottom: 40px;
        }

        .start-btn {
          padding: 15px 50px;
          font-size: 1.1rem;
          font-weight: 600;
          border: none;
          border-radius: 30px;
          background: #00ffb3;
          color: #0f2027;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .start-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 255, 179, 0.3);
        }

        .how {
          padding: 120px 80px;
          background: #0f2027;
          text-align: center;
        }

        .how h2 {
          font-size: 2.8rem;
          margin-bottom: 60px;
        }

        .cards {
          display: flex;
          justify-content: center;
          gap: 40px;
          flex-wrap: wrap;
        }

        .card {
          background: #203a43;
          padding: 40px 30px;
          width: 300px;
          border-radius: 20px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
        }

        .card h3 {
          font-size: 1.4rem;
          margin-bottom: 15px;
        }

        .card p {
          opacity: 0.9;
          line-height: 1.6;
        }

        /* FOOTER */

        .footer {
          background: #0a141a;
          padding: 80px 60px 40px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 40px;
          margin-bottom: 40px;
        }

        .footer-section h3 {
          margin-bottom: 15px;
          font-size: 1.2rem;
        }

        .footer-section p {
          opacity: 0.85;
          line-height: 1.6;
        }

        .footer-section a {
          display: block;
          color: #00ffb3;
          text-decoration: none;
          margin-top: 6px;
          font-size: 0.95rem;
        }

        .footer-bottom {
          text-align: center;
          font-size: 0.85rem;
          opacity: 0.6;
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 20px;
        }
      `}</style>

      <div className="home">
        <header className={`header ${showHeader ? "" : "hidden"}`}>
          <div className="logo">Thrive</div>
          <nav className="nav">
            <a href="#how">Kako radi</a>
            <a href="#footer">Kontakt</a>
            <a onClick={() => navigate("/login")} className="login-btn">Prijavi se</a>
          </nav>
        </header>

        <main className="hero">
          <h1 className="slogan">Van okvira.</h1>
          <p className="tagline">
            Svaki dan mali izazov koji te gura van zone komfora.
          </p>
          <button onClick={() => navigate("/login")} className="start-btn">
            Počni
          </button>
        </main>

        <section className="how" id="how">
          <h2>Kako radi</h2>

          <div className="cards">
            <div className="card">
              <h3>Dnevni izazovi</h3>
              <p>
                Svaki dan dobijaš mali društveni izazov prilagođen tvom tipu
                ličnosti i svakodnevnom okruženju.
              </p>
            </div>

            <div className="card">
              <h3>Izlazak iz zone komfora</h3>
              <p>
                Postepeno se suočavaš sa novim društvenim situacijama i gradiš
                samopouzdanje bez pritiska.
              </p>
            </div>

            <div className="card">
              <h3>Praćenje napretka</h3>
              <p>
                Pratiš svoj napredak, skupljaš uspehe i vidiš koliko si daleko
                stigao.
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer" id="footer">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Thrive</h3>
              <p>
                Platforma za lični razvoj i izlazak iz zone komfora.
              </p>
            </div>

            <div className="footer-section">
              <h3>Kontakt</h3>
              <a href="mailto:contact@thriveapp.com">contact@thriveapp.com</a>
              <a href="tel:+381601234567">+381 60 123 4567</a>
            </div>
          </div>

          <div className="footer-bottom">
            © {new Date().getFullYear()} Thrive. All rights reserved.
          </div>
        </footer>
      </div>
    </>
  );
};

export default Home;
