import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const payload = { email, password };

    try {
      const res = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/");
    } catch {
      alert("Backend not reachable");
    }
  };

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

        .auth-form input {
          padding: 14px 16px;
          border-radius: 12px;
          border: none;
          font-size: 1rem;
          outline: none;
        }

        .auth-form input::placeholder {
          color: #777;
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

        .register-link {
          margin-top: 15px;
          text-align: center;
          font-size: 0.95rem;
          opacity: 0.9;
        }

        .register-link span {
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
          <h2>Dobrodošao nazad</h2>

          <form className="auth-form" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email adresa"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Lozinka"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button className="submit-btn" type="submit">
              Prijavi se
            </button>

            <div className="register-link">
              Nemaš nalog?{" "}
              <span onClick={() => navigate("/register")}>
                Registruj se
              </span>
            </div>
          </form>

          <div className="back-home" onClick={() => navigate("/")}>
            ← Nazad na početnu
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
