import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [gender, setGender] = useState("male");
  const [job, setJob] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [anxiety, setAnxiety] = useState(1);
  const [showPwdPopup, setShowPwdPopup] = useState(false);

  const female = gender === "female";

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      setShowPwdPopup(true);
      setTimeout(() => setShowPwdPopup(false), 5000);
      return;
    }

    const payload = {
      name,
      surname,
      gender,
      job,
      email,
      password,
      anxiety
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Registration failed");
        return;
      }

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
          position: relative;
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

        .gender-switch {
          display: flex;
          background: #0f2027;
          border-radius: 14px;
          overflow: hidden;
        }

        .gender-btn {
          flex: 1;
          padding: 12px;
          text-align: center;
          cursor: pointer;
          font-weight: 600;
          background: transparent;
          color: #aaa;
        }

        .gender-btn.active {
          background: #00ffb3;
          color: #0f2027;
        }

        .range-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 0.9rem;
        }

        .range-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          opacity: 0.8;
        }

        .range-group input[type="range"] {
          -webkit-appearance: none;
          width: 100%;
          height: 8px;
          border-radius: 10px;
          background: #0f2027;
          outline: none;
        }

        .range-group input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #00ffb3;
          cursor: pointer;
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
        }

        .pwd-wrapper {
          display: flex;
          gap: 8px;
          width: 100%;
        }

        .pwd-wrapper input {
          flex: 1;
        }

        .pwd-popup {
          width: 150px;
          background: #ff4d4d;
          color: white;
          padding: 8px 10px;
          border-radius: 8px;
          font-size: 0.75rem;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
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
          <h2>Kreiraj nalog</h2>

          <form className="auth-form" onSubmit={handleRegister}>
            <input type="text" placeholder="Ime" value={name} onChange={(e)=>setName(e.target.value)} required />
            <input type="text" placeholder="Prezime" value={surname} onChange={(e)=>setSurname(e.target.value)} required />

            <div className="gender-switch">
              <div className={`gender-btn ${gender==="male"?"active":""}`} onClick={()=>setGender("male")}>Muško</div>
              <div className={`gender-btn ${gender==="female"?"active":""}`} onClick={()=>setGender("female")}>Žensko</div>
            </div>

            <select value={job} onChange={(e)=>setJob(e.target.value)} required>
              <option value="">Zanimanje</option>
              <option value="student">Student</option>
              <option value="worker">{female ? "Zaposlena" : "Zaposlen"}</option>
              <option value="unemployed">{female ? "Nezaposlena" : "Nezaposlen"}</option>
              <option value="entrepreneur">Preduzetnik</option>
              <option value="other">Ostalo</option>
            </select>

            <input type="email" placeholder="Email adresa" value={email} onChange={(e)=>setEmail(e.target.value)} required />

            <div className="pwd-wrapper">
              <input type="password" placeholder="Lozinka" value={password} onChange={(e)=>setPassword(e.target.value)} required />
              {showPwdPopup && (
                <div className="pwd-popup">
                  Min. 8 karaktera
                </div>
              )}
            </div>

            <div className="range-group">
              <label>Nivo anksioznosti</label>
              <span style={{ color: "#aaa", fontSize: "0.75rem", marginTop: "-4px" }}>
                (1 – {female ? "veoma anksiozna" : "veoma anksiozan"}, 5 – neutralno, 10 – samopouzdan)
              </span>
              <input type="range" min="1" max="10" step="1" value={anxiety} onChange={(e)=>setAnxiety(Number(e.target.value))}/>
              <div className="range-labels">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>

            <button className="submit-btn" type="submit">
              Registruj se
            </button>

            <div style={{ marginTop: "18px", textAlign: "center", fontSize: "0.9rem", opacity: 0.85 }}>
              Imaš nalog?{" "}
              <span style={{ color: "#00ffb3", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("/login")}>
                Prijavi se
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

export default Register;
