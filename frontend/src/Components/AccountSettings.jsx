import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AccountSettings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "",
    occupation: "",
    anxietyLevel: 5,
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showDangerZone, setShowDangerZone] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setFormData({
      name: parsedUser.name || "",
      email: parsedUser.email || "",
      gender: parsedUser.gender || "",
      occupation: parsedUser.occupation || "",
      anxietyLevel: parsedUser.anxietyLevel || 5,
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:8000/api/users/${user.id}`,
        {
          name: formData.name,
          email: formData.email,
          gender: formData.gender,
          occupation: formData.occupation,
          anxietyLevel: formData.anxietyLevel
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedUser = { ...user, ...response.data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setMessage({ type: "success", text: "Profil uspešno ažuriran!" });

      setTimeout(() => { navigate("/"); }, 1500);
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.detail || "Greška pri ažuriranju profila" });
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Nove lozinke se ne poklapaju" });
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage({ type: "error", text: "Nova lozinka mora imati najmanje 6 karaktera" });
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8000/api/users/${user.id}/password`,
        { currentPassword: formData.currentPassword, newPassword: formData.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFormData({ ...formData, currentPassword: "", newPassword: "", confirmPassword: "" });
      setMessage({ type: "success", text: "Lozinka uspešno promenjena!" });

      setTimeout(() => { navigate("/"); }, 1500);
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.detail || "Greška pri promeni lozinke" });
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/api/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.detail || "Greška pri brisanju naloga" });
      setLoading(false);
    }
  };

  const handleResetProgress = () => {
    if (window.confirm("Da li si siguran da želiš da resetuješ sav progres? Ova akcija je nepovratna.")) {
      localStorage.removeItem(`challenges_${user.id}`);
      localStorage.removeItem(`challengesDate_${user.id}`);
      localStorage.removeItem(`completed_${user.id}`);
      localStorage.removeItem(`feelings_${user.id}`);
      localStorage.removeItem(`lastFeeling_${user.id}`);

      setMessage({ type: "success", text: "Progres je resetovan!" });
      setTimeout(() => navigate("/"), 1500);
    }
  };

  if (!user) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'DM Sans', sans-serif;
        }

        .settings-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
          color: white;
          padding: 60px 20px 40px;
        }

        .settings-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .back-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.95rem;
          margin-bottom: 28px;
          transition: all 0.2s ease;
          font-family: 'DM Sans', sans-serif;
        }

        .back-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateX(-3px);
        }

        .settings-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.8rem, 5vw, 2.5rem);
          font-weight: 700;
          margin-bottom: 30px;
        }

        .settings-section {
          background: rgba(32, 58, 67, 0.6);
          border-radius: 20px;
          padding: 28px;
          margin-bottom: 24px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .section-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.4rem;
          font-weight: 600;
          margin-bottom: 20px;
          color: #00ffb3;
        }

        .toggle-section-btn {
          width: 100%;
          padding: 14px 18px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: 'DM Sans', sans-serif;
        }

        .toggle-section-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
        }

        .toggle-section-btn.danger {
          background: rgba(255, 90, 90, 0.2);
          border-color: #ff5a5a;
          color: #ff5a5a;
        }

        .toggle-section-btn.danger:hover {
          background: rgba(255, 90, 90, 0.3);
        }

        .arrow {
          transition: transform 0.3s ease;
          font-size: 1.1rem;
        }

        .arrow.open { transform: rotate(180deg); }

        .collapsible-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }

        .collapsible-content.open {
          max-height: 1000px;
          margin-top: 20px;
        }

        .form-group { margin-bottom: 18px; }

        .form-label {
          display: block;
          font-size: 0.92rem;
          margin-bottom: 7px;
          opacity: 0.9;
        }

        .form-input, .form-select {
          width: 100%;
          padding: 12px 14px;
          background: rgba(15, 32, 39, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          font-family: 'DM Sans', sans-serif;
        }

        .form-input:focus, .form-select:focus {
          outline: none;
          border-color: #00ffb3;
          background: rgba(15, 32, 39, 0.7);
        }

        .form-select option { background: #203a43; color: white; }

        .slider-container { margin-top: 10px; }

        .slider {
          width: 100%;
          height: 8px;
          border-radius: 5px;
          background: rgba(255, 255, 255, 0.1);
          outline: none;
          -webkit-appearance: none;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #00ffb3;
          cursor: pointer;
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #00ffb3;
          cursor: pointer;
          border: none;
        }

        .slider-value {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
          font-size: 0.8rem;
          opacity: 0.65;
        }

        .current-value {
          color: #00ffb3;
          font-weight: 600;
          font-size: 1rem;
        }

        .submit-btn {
          padding: 12px 28px;
          background: #00ffb3;
          color: #0f2027;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: 'DM Sans', sans-serif;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 255, 179, 0.3);
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .danger-btn {
          background: #ff5a5a;
          color: white;
        }

        .danger-btn:hover { box-shadow: 0 10px 25px rgba(255, 90, 90, 0.3); }

        .reset-btn {
          background: #ffb300;
          color: #0f2027;
        }

        .reset-btn:hover { box-shadow: 0 10px 25px rgba(255, 179, 0, 0.3); }

        .message {
          padding: 14px;
          border-radius: 8px;
          margin-bottom: 18px;
          font-weight: 500;
          font-size: 0.95rem;
        }

        .message.success {
          background: rgba(0, 255, 179, 0.2);
          border: 1px solid #00ffb3;
          color: #00ffb3;
        }

        .message.error {
          background: rgba(255, 90, 90, 0.2);
          border: 1px solid #ff5a5a;
          color: #ff5a5a;
        }

        .danger-zone {
          border: 2px solid #ff5a5a !important;
          background: rgba(255, 90, 90, 0.05) !important;
        }

        .danger-zone .section-title { color: #ff5a5a; }

        .button-group {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .delete-confirm {
          background: rgba(255, 90, 90, 0.1);
          padding: 18px;
          border-radius: 8px;
          border: 1px solid #ff5a5a;
          margin-top: 14px;
        }

        .delete-confirm p {
          margin-bottom: 14px;
          color: #ff5a5a;
          font-weight: 600;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        @media (max-width: 600px) {
          .settings-container { padding: 40px 16px 40px; }

          .settings-section { padding: 20px 16px; border-radius: 16px; }

          .button-group { flex-direction: column; }

          .button-group .submit-btn { width: 100%; text-align: center; }

          .slider-value { font-size: 0.72rem; }
        }
      `}</style>

      <div className="settings-container">
        <div className="settings-content">
          <button className="back-btn" onClick={() => navigate("/")}>← Nazad na početnu</button>

          <h1 className="settings-title">Podešavanja naloga</h1>

          {message.text && (
            <div className={`message ${message.type}`}>{message.text}</div>
          )}

          <div className="settings-section">
            <h2 className="section-title">Osnovne informacije</h2>
            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label className="form-label">Ime</label>
                <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label className="form-label">Pol</label>
                <select name="gender" className="form-select" value={formData.gender} onChange={handleChange}>
                  <option value="">Odaberi...</option>
                  <option value="male">Muški</option>
                  <option value="female">Ženski</option>
                  <option value="neutral">Neutralno</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Zanimanje</label>
                <select name="occupation" className="form-select" value={formData.occupation} onChange={handleChange}>
                  <option value="">Odaberi...</option>
                  <option value="student">Student</option>
                  <option value="worker">Zaposleni</option>
                  <option value="unemployed">Nezaposlen</option>
                  <option value="entrepreneur">Preduzetnik</option>
                  <option value="other">Ostalo</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Nivo anksioznosti: <span className="current-value">{formData.anxietyLevel}/10</span>
                </label>
                <div className="slider-container">
                  <input type="range" name="anxietyLevel" min="1" max="10" className="slider" value={formData.anxietyLevel} onChange={handleChange} />
                  <div className="slider-value">
                    <span>1 (Veoma anksiozno)</span>
                    <span>10 (Veoma samopouzdano)</span>
                  </div>
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Čuvanje..." : "Sačuvaj promene"}
              </button>
            </form>
          </div>

          <div className="settings-section">
            <button className="toggle-section-btn" onClick={() => setShowPasswordSection(!showPasswordSection)}>
              <span>Promeni lozinku</span>
              <span className={`arrow ${showPasswordSection ? 'open' : ''}`}>▼</span>
            </button>

            <div className={`collapsible-content ${showPasswordSection ? 'open' : ''}`}>
              <form onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label className="form-label">Trenutna lozinka</label>
                  <input type="password" name="currentPassword" className="form-input" value={formData.currentPassword} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label className="form-label">Nova lozinka</label>
                  <input type="password" name="newPassword" className="form-input" value={formData.newPassword} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label className="form-label">Potvrdi novu lozinku</label>
                  <input type="password" name="confirmPassword" className="form-input" value={formData.confirmPassword} onChange={handleChange} />
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Menjanje..." : "Promeni lozinku"}
                </button>
              </form>
            </div>
          </div>

          <div className="settings-section danger-zone">
            <button className="toggle-section-btn danger" onClick={() => setShowDangerZone(!showDangerZone)}>
              <span>⚠️ Opasna zona</span>
              <span className={`arrow ${showDangerZone ? 'open' : ''}`}>▼</span>
            </button>

            <div className={`collapsible-content ${showDangerZone ? 'open' : ''}`}>
              <div className="button-group">
                <button className="submit-btn reset-btn" onClick={handleResetProgress}>Resetuj progres</button>
                <button className="submit-btn danger-btn" onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}>Obriši nalog</button>
              </div>

              {showDeleteConfirm && (
                <div className="delete-confirm">
                  <p>⚠️ Da li si siguran da želiš da obrišeš nalog? Ova akcija je nepovratna!</p>
                  <div className="button-group">
                    <button className="submit-btn danger-btn" onClick={handleDeleteAccount} disabled={loading}>
                      {loading ? "Brisanje..." : "Da, obriši nalog"}
                    </button>
                    <button className="submit-btn" onClick={() => setShowDeleteConfirm(false)}>Otkaži</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountSettings;