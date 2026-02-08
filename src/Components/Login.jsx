import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);

  return (
    <>
      <style>{`
        html, body, #root {
          width: 100%;
          margin: 0;
          padding: 0;
        }

        * {
          box-sizing: border-box;
          font-family: "Inter", sans-serif;
        }

        .auth-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
        }

        .auth-box {
          background: #203a43;
          padding: 50px 40px;
          width: 420px;
          border-radius: 25px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }

        .auth-box h2 {
          font-size: 2.2rem;
          margin-bottom: 30px;
          text-align: center;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .auth-form input,
        .auth-form select {
          padding: 14px 16px;
          border-radius: 12px;
          border: none;
          font-size: 1rem;
          outline: none;
        }

        .auth-form input::placeholder {
          color: #777;
        }

        .range-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 0.9rem;
          opacity: 0.9;
        }

        .range-group span {
          font-size: 0.85rem;
          opacity: 0.8;
        }

        .submit-btn {
          margin-top: 10px;
          padding: 14px;
          border: none;
          border-radius: 30px;
          background: #00ffb3;
          color: #0f2027;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0,255,179,0.3);
        }

        .switch {
          margin-top: 25px;
          text-align: center;
          font-size: 0.95rem;
          opacity: 0.9;
        }

        .switch span {
          color: #00ffb3;
          cursor: pointer;
          font-weight: 600;
        }

        .back-home {
          margin-top: 20px;
          text-align: center;
          font-size: 0.85rem;
          opacity: 0.7;
          cursor: pointer;
        }
      `}</style>

      <div className="auth-page">
        <div className="auth-box">
          <h2>{isRegister ? "Kreiraj nalog" : "Dobrodošao nazad"}</h2>

          <form className="auth-form">
            {isRegister && (
              <>
                <input type="text" placeholder="Ime i prezime" />
                <input type="number" placeholder="Godine" />
                <select>
                  <option value="">Zanimanje</option>
                  <option value="student">Student</option>
                  <option value="worker">Zaposlen</option>
                  <option value="unemployed">Nezaposlen</option>
                  <option value="other">Ostalo</option>
                </select>

                <div className="range-group">
                  <label>Nivo anksioznosti / samopouzdanja</label>
                  <input type="range" min="1" max="10" />
                  <span>1 = veoma anksiozan · 10 = veoma samopouzdan</span>
                </div>
              </>
            )}

            <input type="email" placeholder="Email adresa" />
            <input type="password" placeholder="Lozinka" />

            <button className="submit-btn">
              {isRegister ? "Registruj se" : "Prijavi se"}
            </button>
          </form>

          <div className="switch">
            {isRegister ? (
              <>
                Već imaš nalog?{" "}
                <span onClick={() => setIsRegister(false)}>Prijavi se</span>
              </>
            ) : (
              <>
                Nemaš nalog?{" "}
                <span onClick={() => setIsRegister(true)}>Registruj se</span>
              </>
            )}
          </div>

          <div className="back-home" onClick={() => navigate("/")}>
            ← Nazad na početnu
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
