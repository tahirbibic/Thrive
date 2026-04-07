import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Friends = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showHeader, setShowHeader] = useState(true);
  const [openMenu, setOpenMenu] = useState(false);

  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [activeTab, setActiveTab] = useState("friends");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      loadFriendsData(parsedUser.id);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const loadFriendsData = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const friendsRes = await axios.get(`http://localhost:5000/api/users/${userId}/friends`, config);
      setFriends(friendsRes.data.friends || []);

      const pendingRes = await axios.get(`http://localhost:5000/api/users/${userId}/friend-requests/pending`, config);
      setPendingRequests(pendingRes.data.requests || []);

      const sentRes = await axios.get(`http://localhost:5000/api/users/${userId}/friend-requests/sent`, config);
      setSentRequests(sentRes.data.requests || []);
    } catch (error) {
      console.error("Error loading friends data:", error);
      if (error.code === 'ERR_NETWORK') {
        alert("Backend server is not running. Please start your FastAPI server on port 5000.");
      }
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await axios.get(`http://localhost:5000/api/users/search?query=${searchQuery}&exclude=${user.id}`);
      setSearchResults(res.data.users || []);
    } catch (error) {
      console.error("Error searching users:", error);
      if (error.code === 'ERR_NETWORK') {
        alert("Cannot connect to server. Please ensure your backend is running on port 5000.");
      }
    }
  };

  const sendFriendRequest = async (targetUserId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:5000/api/users/${user.id}/friend-requests/send`, { targetUserId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Zahtev poslat!");
      loadFriendsData(user.id);
      setSearchQuery("");
      setSearchResults([]);
    } catch (error) {
      console.error("Error sending friend request:", error);
      alert("Greška pri slanju zahteva");
    }
  };

  const acceptFriendRequest = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:5000/api/users/${user.id}/friend-requests/accept`, { requestId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadFriendsData(user.id);
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const rejectFriendRequest = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:5000/api/users/${user.id}/friend-requests/reject`, { requestId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadFriendsData(user.id);
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  };

  const removeFriend = async (friendId) => {
    if (!window.confirm("Da li si siguran da želiš da ukloniš ovog prijatelja?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/users/${user.id}/friends/${friendId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadFriendsData(user.id);
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
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

        .friends-page {
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

        .nav-text {
          display: inline;
        }

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

        .page-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.8rem, 5vw, 2.5rem);
          font-weight: 700;
          margin-bottom: 8px;
        }

        .page-subtitle {
          font-size: 1rem;
          opacity: 0.75;
          margin-bottom: 30px;
        }

        .tabs {
          display: flex;
          gap: 0;
          margin-bottom: 24px;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }

        .tabs::-webkit-scrollbar { display: none; }

        .tab {
          padding: 12px 20px;
          cursor: pointer;
          opacity: 0.6;
          transition: all 0.2s ease;
          border-bottom: 2px solid transparent;
          margin-bottom: -2px;
          font-weight: 600;
          font-size: 0.9rem;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .tab:hover { opacity: 0.9; }

        .tab.active {
          opacity: 1;
          color: #00ffb3;
          border-bottom-color: #00ffb3;
        }

        .search-section {
          background: rgba(32, 58, 67, 0.6);
          padding: 24px;
          border-radius: 20px;
          margin-bottom: 24px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .search-bar {
          display: flex;
          gap: 12px;
          margin-bottom: 18px;
        }

        .search-input {
          flex: 1;
          min-width: 0;
          padding: 13px 16px;
          border-radius: 12px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          background: rgba(15, 32, 39, 0.5);
          color: white;
          font-size: 0.95rem;
          outline: none;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.2s ease;
        }

        .search-input:focus { border-color: #00ffb3; }

        .search-input::placeholder { color: rgba(255,255,255,0.4); }

        .search-btn {
          padding: 13px 22px;
          background: #00ffb3;
          color: #0f2027;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .search-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 255, 179, 0.3);
        }

        .search-results {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .user-card {
          background: rgba(15, 32, 39, 0.5);
          padding: 16px;
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          transition: transform 0.2s ease;
          flex-wrap: wrap;
        }

        .user-card:hover { transform: translateX(4px); }

        .user-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          min-width: 120px;
        }

        .user-name {
          font-size: 1rem;
          font-weight: 600;
        }

        .user-details {
          font-size: 0.85rem;
          opacity: 0.65;
        }

        .user-stats {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .stat-item { text-align: center; }

        .stat-value {
          font-size: 1.2rem;
          font-weight: 700;
          color: #00ffb3;
        }

        .stat-label {
          font-size: 0.72rem;
          opacity: 0.65;
        }

        .action-btn {
          padding: 10px 18px;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
        }

        .btn-primary {
          background: #00ffb3;
          color: #0f2027;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 255, 179, 0.3);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .btn-secondary:hover { background: rgba(255, 255, 255, 0.15); }

        .btn-danger {
          background: rgba(255, 90, 90, 0.2);
          color: #ff5a5a;
        }

        .btn-danger:hover { background: rgba(255, 90, 90, 0.3); }

        .content-section {
          background: rgba(32, 58, 67, 0.6);
          padding: 28px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .section-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.4rem;
          font-weight: 700;
          margin-bottom: 18px;
          color: #00ffb3;
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

        .empty-text { font-size: 1rem; }

        .friends-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
        }

        .friend-card {
          background: rgba(15, 32, 39, 0.5);
          padding: 22px 18px;
          border-radius: 16px;
          text-align: center;
          transition: all 0.2s ease;
          border: 2px solid transparent;
        }

        .friend-card:hover {
          transform: translateY(-4px);
          border-color: #00ffb3;
          box-shadow: 0 10px 25px rgba(0, 255, 179, 0.15);
        }

        .friend-avatar {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00ffb3, #00cc8f);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: 1.8rem;
          font-weight: 700;
          margin: 0 auto 12px;
          color: #0f2027;
        }

        .friend-name {
          font-family: 'Syne', sans-serif;
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .friend-stats {
          display: flex;
          justify-content: center;
          gap: 22px;
          margin: 12px 0;
        }

        .request-actions {
          display: flex;
          gap: 8px;
          margin-top: 14px;
        }

        .request-actions button { flex: 1; }

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

        .rank {
          font-family: 'Syne', sans-serif;
          font-size: 1.6rem;
          font-weight: 700;
          width: 46px;
          text-align: center;
          flex-shrink: 0;
        }

        .rank-1 { color: #FFD700; }
        .rank-2 { color: #C0C0C0; }
        .rank-3 { color: #CD7F32; }

        .leaderboard-avatar {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00ffb3, #00cc8f);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: 1.4rem;
          font-weight: 700;
          color: #0f2027;
          flex-shrink: 0;
        }

        .leaderboard-info { flex: 1; min-width: 0; }

        .leaderboard-name {
          font-family: 'Syne', sans-serif;
          font-size: 1.05rem;
          font-weight: 600;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .leaderboard-details {
          font-size: 0.85rem;
          opacity: 0.65;
        }

        .leaderboard-score { text-align: center; flex-shrink: 0; }

        .score-value {
          font-family: 'Syne', sans-serif;
          font-size: 1.8rem;
          font-weight: 700;
          color: #00ffb3;
        }

        .score-label {
          font-size: 0.75rem;
          opacity: 0.65;
        }

        .badge-indicator {
          display: inline-block;
          padding: 3px 7px;
          background: rgba(0, 255, 179, 0.2);
          border-radius: 6px;
          font-size: 0.72rem;
          color: #00ffb3;
          margin-left: 8px;
        }

        @media (max-width: 768px) {
          .header { padding: 14px 20px; }

          .logo { font-size: 1.5rem; }

          .nav-text { display: none; }

          .nav a { padding: 8px 10px; font-size: 1rem; }

          .settings-wrap { margin-left: 6px; }

          .settings-btn { padding: 9px 14px; font-size: 1rem; }

          .container { padding: 88px 16px 40px; }

          .content-section { padding: 20px 16px; }

          .friends-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }

          .friend-card { padding: 18px 14px; }

          .friend-avatar { width: 60px; height: 60px; font-size: 1.5rem; }

          .search-section { padding: 18px 16px; }

          .user-stats { display: none; }

          .leaderboard-item { gap: 12px; padding: 14px; }

          .rank { font-size: 1.3rem; width: 36px; }

          .leaderboard-avatar { width: 44px; height: 44px; font-size: 1.1rem; }

          .score-value { font-size: 1.4rem; }
        }

        @media (max-width: 480px) {
          .friends-grid { grid-template-columns: 1fr 1fr; }

          .search-bar { flex-direction: column; }

          .search-btn { width: 100%; text-align: center; }
        }

        @media (max-width: 360px) {
          .friends-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="friends-page">
        <header className="header">
          <div className="logo" onClick={() => navigate("/")}>Thrive</div>
          <nav className="nav">
            <a onClick={() => navigate("/")}>🏠 <span className="nav-text">Početna</span></a>
            <a className="active">👥 <span className="nav-text">Prijatelji</span></a>
            <a onClick={() => navigate("/leaderboard")}>🏆 <span className="nav-text">Rang lista</span></a>

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
          <h1 className="page-title">Prijatelji</h1>
          <p className="page-subtitle">Poveži se sa drugima i pratite napredak zajedno</p>

          <div className="tabs">
            <div className={`tab ${activeTab === "friends" ? "active" : ""}`} onClick={() => setActiveTab("friends")}>
              Moji prijatelji ({friends.length})
            </div>
            <div className={`tab ${activeTab === "leaderboard" ? "active" : ""}`} onClick={() => setActiveTab("leaderboard")}>
              Rang lista prijatelja
            </div>
            <div className={`tab ${activeTab === "requests" ? "active" : ""}`} onClick={() => setActiveTab("requests")}>
              Zahtevi ({pendingRequests.length})
            </div>
          </div>

          <div className="search-section">
            <div className="search-bar">
              <input
                type="text"
                className="search-input"
                placeholder="Pronađi prijatelje po imenu ili emailu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
              />
              <button className="search-btn" onClick={searchUsers}>🔍 Pretraži</button>
            </div>

            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map(result => (
                  <div key={result.id} className="user-card">
                    <div className="user-info">
                      <div className="user-name">{result.name} {result.surname}</div>
                      <div className="user-details">{result.email}</div>
                    </div>
                    <div className="user-stats">
                      <div className="stat-item">
                        <div className="stat-value">{result.lifetimeCompleted || 0}</div>
                        <div className="stat-label">Izazova</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value">🔥 {result.currentStreak || 0}</div>
                        <div className="stat-label">Niz</div>
                      </div>
                    </div>
                    <button className="action-btn btn-primary" onClick={() => sendFriendRequest(result.id)}>
                      Dodaj prijatelja
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {activeTab === "friends" && (
            <div className="content-section">
              {friends.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">👥</div>
                  <div className="empty-text">Još nemaš prijatelje. Pretraži korisnike i dodaj ih!</div>
                </div>
              ) : (
                <div className="friends-grid">
                  {friends.map(friend => (
                    <div key={friend.id} className="friend-card">
                      <div className="friend-avatar">{friend.name.charAt(0).toUpperCase()}</div>
                      <div className="friend-name">{friend.name} {friend.surname}</div>
                      <div className="friend-stats">
                        <div className="stat-item">
                          <div className="stat-value">{friend.lifetimeCompleted || 0}</div>
                          <div className="stat-label">Izazova</div>
                        </div>
                        <div className="stat-item">
                          <div className="stat-value">🔥 {friend.currentStreak || 0}</div>
                          <div className="stat-label">Niz</div>
                        </div>
                      </div>
                      <button className="action-btn btn-danger" onClick={() => removeFriend(friend.id)}>Ukloni</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "leaderboard" && (
            <div className="content-section">
              <h2 className="section-title">Rang lista prijatelja</h2>
              {friends.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🏆</div>
                  <div className="empty-text">Dodaj prijatelje da vidiš rang listu!</div>
                </div>
              ) : (
                <div className="leaderboard-list">
                  {[...friends]
                    .sort((a, b) => (b.lifetimeCompleted || 0) - (a.lifetimeCompleted || 0))
                    .map((friend, index) => (
                      <div key={friend.id} className="leaderboard-item">
                        <div className={`rank rank-${index + 1}`}>{index + 1}</div>
                        <div className="leaderboard-avatar">{friend.name.charAt(0).toUpperCase()}</div>
                        <div className="leaderboard-info">
                          <div className="leaderboard-name">
                            {friend.name} {friend.surname}
                            {index < 3 && <span className="badge-indicator">TOP {index + 1}</span>}
                          </div>
                          <div className="leaderboard-details">Trenutni niz: 🔥 {friend.currentStreak || 0} dana</div>
                        </div>
                        <div className="leaderboard-score">
                          <div className="score-value">{friend.lifetimeCompleted || 0}</div>
                          <div className="score-label">Završenih izazova</div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "requests" && (
            <div className="content-section">
              <h2 className="section-title">Zahtevi za prijateljstvo</h2>

              {pendingRequests.length === 0 && sentRequests.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📬</div>
                  <div className="empty-text">Nemaš aktivnih zahteva</div>
                </div>
              ) : (
                <>
                  {pendingRequests.length > 0 && (
                    <>
                      <h3 style={{ marginBottom: "15px", opacity: 0.8 }}>Primljeni zahtevi</h3>
                      <div className="friends-grid" style={{ marginBottom: "28px" }}>
                        {pendingRequests.map(request => (
                          <div key={request.id} className="friend-card">
                            <div className="friend-avatar">{request.senderName.charAt(0).toUpperCase()}</div>
                            <div className="friend-name">{request.senderName} {request.senderSurname}</div>
                            <div className="request-actions">
                              <button className="action-btn btn-primary" onClick={() => acceptFriendRequest(request.id)}>✓ Prihvati</button>
                              <button className="action-btn btn-secondary" onClick={() => rejectFriendRequest(request.id)}>✗ Odbij</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {sentRequests.length > 0 && (
                    <>
                      <h3 style={{ marginBottom: "15px", opacity: 0.8 }}>Poslati zahtevi</h3>
                      <div className="friends-grid">
                        {sentRequests.map(request => (
                          <div key={request.id} className="friend-card">
                            <div className="friend-avatar">{request.recipientName.charAt(0).toUpperCase()}</div>
                            <div className="friend-name">{request.recipientName} {request.recipientSurname}</div>
                            <div style={{ marginTop: "14px", opacity: 0.6, fontSize: "0.9rem" }}>Na čekanju...</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Friends;