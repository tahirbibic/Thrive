import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Leaderboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [rankingType, setRankingType] = useState("lifetime");
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      loadLeaderboard(parsedUser.id, rankingType);
    } else {
      navigate("/login");
    }
  }, [navigate, rankingType]);

  const loadLeaderboard = async (userId, type) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/leaderboard/${type}`);
      setLeaderboardData(res.data.leaderboard || []);

      const userIndex = res.data.leaderboard.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        setUserRank({ rank: userIndex + 1, ...res.data.leaderboard[userIndex] });
      } else {
        setUserRank(null);
      }
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getScoreLabel = () => {
    switch (rankingType) {
      case "lifetime": return "Ukupno izazova";
      case "weekly": return "Ove nedelje";
      case "monthly": return "Ovog meseca";
      case "streak": return "Trenutni niz";
      default: return "Poeni";
    }
  };

  const getScoreValue = (userData) => {
    switch (rankingType) {
      case "lifetime": return userData.lifetimeCompleted || 0;
      case "weekly": return userData.weeklyCompleted || 0;
      case "monthly": return userData.monthlyCompleted || 0;
      case "streak": return userData.currentStreak || 0;
      default: return 0;
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

        .leaderboard-page {
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
          padding: 16px 40px;
          background: rgba(10, 20, 26, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .logo {
          font-family: 'Syne', sans-serif;
          font-size: 1.8rem;
          font-weight: 800;
          letter-spacing: 1px;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .logo:hover { color: #00ffb3; }

        .nav {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .nav a {
          text-decoration: none;
          color: white;
          opacity: 0.85;
          transition: all 0.2s ease;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 8px;
          font-weight: 500;
          font-size: 0.9rem;
          white-space: nowrap;
        }

        .nav a:hover {
          opacity: 1;
          background: rgba(0, 255, 179, 0.1);
        }

        .nav a.active {
          color: #00ffb3;
          opacity: 1;
          font-weight: 600;
        }

        .nav-text { display: inline; }

        .settings-wrap {
          position: relative;
          margin-left: 12px;
        }

        .settings-btn {
          padding: 10px 18px;
          border-radius: 999px;
          background: #00ffb3;
          color: #0f2027;
          font-weight: 700;
          cursor: pointer;
          font-size: 1.2rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .settings-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 255, 179, 0.35);
        }

        .dropdown {
          position: absolute;
          top: 55px;
          right: 0;
          background: #203a43;
          border-radius: 14px;
          min-width: 200px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.5);
          overflow: hidden;
          z-index: 2000;
        }

        .drop-item {
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: background 0.2s ease;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .drop-item:hover { background: rgba(255,255,255,0.06); }

        .drop-logout {
          color: #ff5a5a;
          background: rgba(255,90,90,0.08);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 100px 40px 60px;
        }

        .page-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .page-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.8rem, 5vw, 3rem);
          font-weight: 700;
          margin-bottom: 8px;
        }

        .trophy-icon {
          font-size: 3.5rem;
          margin-bottom: 16px;
        }

        .page-subtitle {
          font-size: 1rem;
          opacity: 0.75;
        }

        .ranking-tabs {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 32px;
          flex-wrap: wrap;
          padding: 0 8px;
        }

        .ranking-tab {
          padding: 11px 20px;
          background: rgba(32, 58, 67, 0.6);
          border: 2px solid transparent;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .ranking-tab:hover {
          border-color: rgba(0, 255, 179, 0.3);
          transform: translateY(-2px);
        }

        .ranking-tab.active {
          background: #00ffb3;
          color: #0f2027;
          border-color: #00ffb3;
        }

        .user-rank-card {
          background: linear-gradient(135deg, #00ffb3, #00cc8f);
          padding: 24px 28px;
          border-radius: 20px;
          margin-bottom: 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #0f2027;
          box-shadow: 0 10px 30px rgba(0, 255, 179, 0.3);
          gap: 16px;
          flex-wrap: wrap;
        }

        .user-rank-info {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .rank-badge {
          font-family: 'Syne', sans-serif;
          font-size: 2.5rem;
          font-weight: 700;
        }

        .rank-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .rank-title {
          font-size: 0.85rem;
          opacity: 0.8;
          font-weight: 600;
        }

        .rank-position {
          font-family: 'Syne', sans-serif;
          font-size: 1.8rem;
          font-weight: 700;
        }

        .rank-score { text-align: center; }

        .score-value {
          font-family: 'Syne', sans-serif;
          font-size: 2.5rem;
          font-weight: 700;
        }

        .score-label {
          font-size: 0.85rem;
          opacity: 0.8;
          font-weight: 600;
        }

        .podium {
          display: flex;
          justify-content: center;
          align-items: flex-end;
          gap: 16px;
          margin-bottom: 32px;
          padding: 0 8px;
        }

        .podium-place {
          flex: 1;
          max-width: 260px;
          text-align: center;
          transition: transform 0.2s ease;
        }

        .podium-place:hover { transform: translateY(-8px); }

        .podium-1 { order: 2; }
        .podium-2 { order: 1; }
        .podium-3 { order: 3; }

        .podium-card {
          background: rgba(32, 58, 67, 0.6);
          border-radius: 20px;
          padding: 26px 16px;
          backdrop-filter: blur(10px);
          border: 3px solid transparent;
        }

        .podium-1 .podium-card {
          border-color: #FFD700;
          background: rgba(255, 215, 0, 0.1);
        }

        .podium-2 .podium-card { border-color: #C0C0C0; }
        .podium-3 .podium-card { border-color: #CD7F32; }

        .podium-rank {
          font-size: 2.5rem;
          margin-bottom: 12px;
        }

        .podium-avatar {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00ffb3, #00cc8f);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: 2.2rem;
          font-weight: 700;
          margin: 0 auto 12px;
          color: #0f2027;
        }

        .podium-1 .podium-avatar {
          width: 108px;
          height: 108px;
          font-size: 2.6rem;
        }

        .podium-name {
          font-family: 'Syne', sans-serif;
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .podium-score {
          font-family: 'Syne', sans-serif;
          font-size: 1.8rem;
          font-weight: 700;
          color: #00ffb3;
          margin-bottom: 4px;
        }

        .podium-label {
          font-size: 0.8rem;
          opacity: 0.65;
        }

        .leaderboard-section {
          background: rgba(32, 58, 67, 0.6);
          border-radius: 20px;
          padding: 30px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .section-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.6rem;
          font-weight: 700;
          margin-bottom: 22px;
          color: #00ffb3;
        }

        .leaderboard-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .leaderboard-item {
          background: rgba(15, 32, 39, 0.5);
          padding: 18px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.2s ease;
        }

        .leaderboard-item:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 14px rgba(0, 255, 179, 0.1);
        }

        .leaderboard-item.current-user {
          border: 2px solid #00ffb3;
          background: rgba(0, 255, 179, 0.05);
        }

        .rank {
          font-family: 'Syne', sans-serif;
          font-size: 1.4rem;
          font-weight: 700;
          width: 46px;
          text-align: center;
          flex-shrink: 0;
        }

        .rank-4-10 { color: #00ffb3; }

        .leaderboard-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00ffb3, #00cc8f);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: 1.2rem;
          font-weight: 700;
          color: #0f2027;
          flex-shrink: 0;
        }

        .leaderboard-info { flex: 1; min-width: 0; }

        .leaderboard-name {
          font-family: 'Syne', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .leaderboard-details {
          font-size: 0.82rem;
          opacity: 0.65;
        }

        .leaderboard-score { text-align: center; flex-shrink: 0; }

        .score-number {
          font-family: 'Syne', sans-serif;
          font-size: 1.6rem;
          font-weight: 700;
          color: #00ffb3;
        }

        .score-text {
          font-size: 0.72rem;
          opacity: 0.65;
        }

        .loading {
          text-align: center;
          padding: 50px;
          font-size: 1.1rem;
          opacity: 0.6;
        }

        .empty-state {
          text-align: center;
          padding: 50px 20px;
          opacity: 0.6;
        }

        .empty-icon {
          font-size: 3.5rem;
          margin-bottom: 16px;
        }

        @media (max-width: 768px) {
          .header { padding: 14px 20px; }

          .logo { font-size: 1.5rem; }

          .nav-text { display: none; }

          .nav a { padding: 8px 10px; font-size: 1rem; }

          .settings-wrap { margin-left: 6px; }

          .settings-btn { padding: 9px 14px; font-size: 1rem; }

          .container { padding: 88px 16px 40px; }

          .ranking-tabs { gap: 8px; }

          .ranking-tab { padding: 9px 14px; font-size: 0.82rem; }

          .user-rank-card { padding: 18px 20px; }

          .rank-badge { font-size: 2rem; }

          .rank-position { font-size: 1.5rem; }

          .score-value { font-size: 2rem; }

          .podium { gap: 10px; }

          .podium-avatar { width: 70px; height: 70px; font-size: 1.7rem; }

          .podium-1 .podium-avatar { width: 84px; height: 84px; font-size: 2rem; }

          .podium-card { padding: 18px 12px; border-radius: 16px; }

          .podium-name { font-size: 0.9rem; }

          .podium-score { font-size: 1.4rem; }

          .leaderboard-section { padding: 20px 16px; }

          .leaderboard-item { gap: 10px; padding: 14px; }

          .rank { font-size: 1.1rem; width: 36px; }

          .leaderboard-avatar { width: 40px; height: 40px; font-size: 1rem; }

          .score-number { font-size: 1.3rem; }
        }

        @media (max-width: 480px) {
          .podium { align-items: center; flex-direction: column; }

          .podium-place { max-width: 100%; width: 100%; order: unset !important; }

          .podium-1 { order: 1 !important; }
          .podium-2 { order: 2 !important; }
          .podium-3 { order: 3 !important; }

          .user-rank-card { flex-direction: column; text-align: center; }

          .user-rank-info { justify-content: center; }
        }
      `}</style>

      <div className="leaderboard-page">
        <header className="header">
          <div className="logo" onClick={() => navigate("/")}>Thrive</div>
          <nav className="nav">
            <a onClick={() => navigate("/")}>🏠 <span className="nav-text">Početna</span></a>
            <a onClick={() => navigate("/friends")}>👥 <span className="nav-text">Prijatelji</span></a>
            <a className="active">🏆 <span className="nav-text">Rang lista</span></a>

            <div className="settings-wrap">
              <div className="settings-btn" onClick={() => setOpenMenu(!openMenu)}>⚙</div>
              {openMenu && (
                <div className="dropdown">
                  <div className="drop-item" onClick={() => navigate("/AccountSettings")}>⚙ Podešavanja</div>
                  <div className="drop-item drop-logout" onClick={logout}>✖ Odjavi se</div>
                </div>
              )}
            </div>
          </nav>
        </header>

        <div className="container">
          <div className="page-header">
            <div className="trophy-icon">🏆</div>
            <h1 className="page-title">Globalna Rang Lista</h1>
            <p className="page-subtitle">Takmičite se sa korisnicima širom sveta</p>
          </div>

          <div className="ranking-tabs">
            <div className={`ranking-tab ${rankingType === "lifetime" ? "active" : ""}`} onClick={() => setRankingType("lifetime")}>Svi vremena</div>
            <div className={`ranking-tab ${rankingType === "weekly" ? "active" : ""}`} onClick={() => setRankingType("weekly")}>Ove nedelje</div>
            <div className={`ranking-tab ${rankingType === "monthly" ? "active" : ""}`} onClick={() => setRankingType("monthly")}>Ovog meseca</div>
            <div className={`ranking-tab ${rankingType === "streak" ? "active" : ""}`} onClick={() => setRankingType("streak")}>Najduži niz</div>
          </div>

          {userRank && (
            <div className="user-rank-card">
              <div className="user-rank-info">
                <div className="rank-badge">{getRankIcon(userRank.rank)}</div>
                <div className="rank-details">
                  <div className="rank-title">Tvoja pozicija</div>
                  <div className="rank-position">{userRank.rank}. mesto</div>
                </div>
              </div>
              <div className="rank-score">
                <div className="score-value">{getScoreValue(userRank)}</div>
                <div className="score-label">{getScoreLabel()}</div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="loading">Učitavanje...</div>
          ) : leaderboardData.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <div>Nema dostupnih podataka</div>
            </div>
          ) : (
            <>
              {leaderboardData.length >= 3 && (
                <div className="podium">
                  {[1, 0, 2].map(index => {
                    const userData = leaderboardData[index];
                    if (!userData) return null;
                    return (
                      <div key={userData.id} className={`podium-place podium-${index + 1}`}>
                        <div className="podium-card">
                          <div className="podium-rank">{getRankIcon(index + 1)}</div>
                          <div className="podium-avatar">{userData.name.charAt(0).toUpperCase()}</div>
                          <div className="podium-name">{userData.name} {userData.surname}</div>
                          <div className="podium-score">{getScoreValue(userData)}</div>
                          <div className="podium-label">{getScoreLabel()}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {leaderboardData.length > 3 && (
                <div className="leaderboard-section">
                  <h2 className="section-title">Ostali takmičari</h2>
                  <div className="leaderboard-list">
                    {leaderboardData.slice(3).map((userData, index) => (
                      <div key={userData.id} className={`leaderboard-item ${userData.id === user.id ? 'current-user' : ''}`}>
                        <div className={`rank ${index + 4 <= 10 ? 'rank-4-10' : ''}`}>#{index + 4}</div>
                        <div className="leaderboard-avatar">{userData.name.charAt(0).toUpperCase()}</div>
                        <div className="leaderboard-info">
                          <div className="leaderboard-name">
                            {userData.name} {userData.surname}
                            {userData.id === user.id && " (Ti)"}
                          </div>
                          <div className="leaderboard-details">
                            {rankingType === "streak"
                              ? `Najduži niz: ${userData.longestStreak || 0} dana`
                              : `Ukupno: ${userData.lifetimeCompleted || 0} izazova`}
                          </div>
                        </div>
                        <div className="leaderboard-score">
                          <div className="score-number">{getScoreValue(userData)}</div>
                          <div className="score-text">{getScoreLabel()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Leaderboard;