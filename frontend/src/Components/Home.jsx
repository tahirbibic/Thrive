import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import challengePool from "./challengepool";

const Home = () => {
  const navigate = useNavigate();
  const lastScrollY = useRef(0);
  const [showHeader, setShowHeader] = useState(true);
  const [user, setUser] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [challenges, setChallenges] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [dailyFeeling, setDailyFeeling] = useState(null);
  const [canAnswerFeeling, setCanAnswerFeeling] = useState(true);
  const [feelingsHistory, setFeelingsHistory] = useState([]);
  const [lifetimeCompleted, setLifetimeCompleted] = useState(0);
  const [lastResetDate, setLastResetDate] = useState("");
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [badges, setBadges] = useState([]);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [newBadge, setNewBadge] = useState(null);

  const BADGE_DEFINITIONS = [
    { id: "first_step", name: "Prvi Korak", description: "Završi svoj prvi izazov", icon: "🎯", requirement: (stats) => stats.lifetimeCompleted >= 1 },
    { id: "week_warrior", name: "Nedeljni Ratnik", description: "Održi 7-dnevni niz", icon: "🔥", requirement: (stats) => stats.currentStreak >= 7 },
    { id: "social_butterfly", name: "Društveni Leptir", description: "Završi 25 izazova", icon: "🦋", requirement: (stats) => stats.lifetimeCompleted >= 25 },
    { id: "month_master", name: "Mesečni Majstor", description: "Održi 30-dnevni niz", icon: "👑", requirement: (stats) => stats.currentStreak >= 30 },
    { id: "confidence_builder", name: "Graditelj Samopouzdanja", description: "Završi 50 izazova", icon: "💪", requirement: (stats) => stats.lifetimeCompleted >= 50 },
    { id: "century_club", name: "Vekovski Klub", description: "Završi 100 izazova", icon: "💯", requirement: (stats) => stats.lifetimeCompleted >= 100 },
    { id: "unstoppable", name: "Nezaustavljiv", description: "Održi 100-dnevni niz", icon: "⚡", requirement: (stats) => stats.currentStreak >= 100 },
    { id: "perfect_week", name: "Savršena Nedelja", description: "Završi sve izazove 7 dana uzastopno", icon: "✨", requirement: (stats) => stats.perfectWeek },
    { id: "comfort_zone_crusher", name: "Rušilac Zone Komfora", description: "Završi 250 izazova", icon: "🚀", requirement: (stats) => stats.lifetimeCompleted >= 250 },
  ];

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

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      loadUserData(parsedUser);
      fetchLifetimeCompleted(parsedUser.id);
      loadStreakData(parsedUser.id);
      loadBadges(parsedUser.id);
    }
  }, []);

  const getBelgradeDate = () => {
    const now = new Date();
    const belgradeTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Belgrade" }));
    return belgradeTime.toISOString().split('T')[0];
  };

  const fetchLifetimeCompleted = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      console.log("🔑 Token from localStorage:", token);
      console.log("👤 User ID:", userId);
      if (!token) {
        console.error("❌ No token found in localStorage!");
        return;
      }
      const response = await axios.get(`http://localhost:5000/api/users/${userId}/lifetime-completed`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("✅ Lifetime completed fetched:", response.data);
      setLifetimeCompleted(response.data.lifetimeCompleted || 0);
    } catch (error) {
      console.error("❌ Error fetching lifetime completed:", error);
      if (error.response?.status === 401) {
        console.error("Token is invalid or expired. Try logging out and logging in again.");
      }
    }
  };

  const updateLifetimeCompleted = async (userId, challengeText) => {
    console.log("🎯 Completing challenge:", challengeText);
    console.log("👤 User ID:", userId);
    try {
      const token = localStorage.getItem("token");
      console.log("🔑 Token exists:", !!token);
      const today = getBelgradeDate();
      const response = await axios.post(
        `http://localhost:5000/api/users/${userId}/complete-challenge`,
        { challengeText: challengeText || "Challenge completed", date: today },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("✅ Backend response:", response.data);
      setLifetimeCompleted(response.data.lifetimeCompleted);
      setCurrentStreak(response.data.currentStreak);
      setLongestStreak(response.data.longestStreak);
      localStorage.setItem(`currentStreak_${userId}`, response.data.currentStreak.toString());
      localStorage.setItem(`longestStreak_${userId}`, response.data.longestStreak.toString());
      localStorage.setItem(`lastActivity_${userId}`, today);
      checkAndAwardBadges(userId);
    } catch (error) {
      console.error("❌ Error updating lifetime completed:", error);
      console.error("Error details:", error.response?.data);
    }
  };

  const loadStreakData = (userId) => {
    const storedStreak = localStorage.getItem(`currentStreak_${userId}`);
    const storedLongest = localStorage.getItem(`longestStreak_${userId}`);
    const lastActivityDate = localStorage.getItem(`lastActivity_${userId}`);
    if (storedStreak) setCurrentStreak(parseInt(storedStreak));
    if (storedLongest) setLongestStreak(parseInt(storedLongest));
    const today = getBelgradeDate();
    if (lastActivityDate) {
      const daysDiff = getDaysDifference(lastActivityDate, today);
      if (daysDiff > 1) {
        setCurrentStreak(0);
        localStorage.setItem(`currentStreak_${userId}`, "0");
      }
    }
  };

  const getDaysDifference = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const updateStreak = (userId) => {
    const today = getBelgradeDate();
    const lastActivity = localStorage.getItem(`lastActivity_${userId}`);
    if (!lastActivity || lastActivity !== today) {
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      localStorage.setItem(`currentStreak_${userId}`, newStreak.toString());
      localStorage.setItem(`lastActivity_${userId}`, today);
      if (newStreak > longestStreak) {
        setLongestStreak(newStreak);
        localStorage.setItem(`longestStreak_${userId}`, newStreak.toString());
      }
      checkAndAwardBadges(userId);
    }
  };

  const loadBadges = (userId) => {
    const storedBadges = localStorage.getItem(`badges_${userId}`);
    if (storedBadges) {
      setBadges(JSON.parse(storedBadges));
    }
  };

  const checkAndAwardBadges = (userId) => {
    const stats = {
      lifetimeCompleted,
      currentStreak,
      longestStreak,
      perfectWeek: checkPerfectWeek(),
    };
    const currentBadgeIds = badges.map(b => b.id);
    const newlyEarnedBadges = [];
    BADGE_DEFINITIONS.forEach(badge => {
      if (!currentBadgeIds.includes(badge.id) && badge.requirement(stats)) {
        newlyEarnedBadges.push(badge);
      }
    });
    if (newlyEarnedBadges.length > 0) {
      const updatedBadges = [...badges, ...newlyEarnedBadges];
      setBadges(updatedBadges);
      localStorage.setItem(`badges_${userId}`, JSON.stringify(updatedBadges));
      setNewBadge(newlyEarnedBadges[0]);
      setShowBadgeModal(true);
      setTimeout(() => { setShowBadgeModal(false); }, 4000);
    }
  };

  const checkPerfectWeek = () => {
    const storedHistory = localStorage.getItem(`challengeHistory_${user?.id}`);
    if (!storedHistory) return false;
    const history = JSON.parse(storedHistory);
    const last7Days = history.slice(-7);
    return last7Days.length === 7 && last7Days.every(day => day.completed === 5);
  };

  const loadUserData = (userData) => {
    const today = getBelgradeDate();
    const storedChallenges = localStorage.getItem(`challenges_${userData.id}`);
    const storedDate = localStorage.getItem(`challengesDate_${userData.id}`);
    const storedCompleted = localStorage.getItem(`completed_${userData.id}`);
    const storedFeelings = localStorage.getItem(`feelings_${userData.id}`);
    const lastFeelingTime = localStorage.getItem(`lastFeeling_${userData.id}`);
    if (storedDate !== today || !storedChallenges) {
      const newChallenges = generateChallenges(userData);
      setChallenges(newChallenges);
      localStorage.setItem(`challenges_${userData.id}`, JSON.stringify(newChallenges));
      localStorage.setItem(`challengesDate_${userData.id}`, today);
      localStorage.setItem(`completed_${userData.id}`, JSON.stringify([]));
      localStorage.setItem(`backendSynced_${userData.id}`, JSON.stringify([]));
      setCompletedChallenges([]);
      if (storedCompleted) {
        const prevCompleted = JSON.parse(storedCompleted).length;
        saveDailyChallengeHistory(userData.id, today, prevCompleted);
      }
    } else {
      setChallenges(JSON.parse(storedChallenges));
      if (storedCompleted) {
        setCompletedChallenges(JSON.parse(storedCompleted));
      }
    }
    if (storedFeelings) {
      setFeelingsHistory(JSON.parse(storedFeelings));
    }
    if (lastFeelingTime) {
      const timeDiff = Date.now() - parseInt(lastFeelingTime);
      if (timeDiff < 86400000) {
        setCanAnswerFeeling(false);
      }
    }
    setLastResetDate(today);
  };

  const saveDailyChallengeHistory = (userId, date, completedCount) => {
    const historyKey = `challengeHistory_${userId}`;
    const stored = localStorage.getItem(historyKey);
    const history = stored ? JSON.parse(stored) : [];
    history.push({ date, completed: completedCount });
    if (history.length > 30) { history.shift(); }
    localStorage.setItem(historyKey, JSON.stringify(history));
  };

  // ─── Uses imported challengePool — no local object needed ───────────────────
  const generateChallenges = (userData) => {
    const gender = userData.gender || "neutral";
    const occupation = userData.occupation || "student";
    const anxietyLevel = userData.anxietyLevel || 5;
    const anxietyCategory = anxietyLevel <= 3 ? 'high' : anxietyLevel <= 7 ? 'medium' : 'low';
    const pool = challengePool[occupation]?.[gender]?.[anxietyCategory] || challengePool.student.neutral.medium;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5).map((text, idx) => ({ id: Date.now() + idx, text, completed: false }));
  };

  // ─── Uses imported challengePool — no local object needed ───────────────────
  const shuffleChallenge = (challengeId) => {
    const gender = user.gender || "neutral";
    const occupation = user.occupation || "student";
    const anxietyLevel = user.anxietyLevel || 5;
    const anxietyCategory = anxietyLevel <= 3 ? 'high' : anxietyLevel <= 7 ? 'medium' : 'low';
    const pool = challengePool[occupation]?.[gender]?.[anxietyCategory] || challengePool.student.neutral.medium;
    const currentTexts = challenges.map(c => c.text);
    const availablePool = pool.filter(text => !currentTexts.includes(text));
    if (availablePool.length === 0) return;
    const newChallenge = availablePool[Math.floor(Math.random() * availablePool.length)];
    const updated = challenges.map(ch => ch.id === challengeId ? { ...ch, text: newChallenge, completed: false } : ch);
    setChallenges(updated);
    localStorage.setItem(`challenges_${user.id}`, JSON.stringify(updated));
  };

const toggleChallenge = (id) => {
  const updated = challenges.map(ch => ch.id === id ? { ...ch, completed: !ch.completed } : ch);
  setChallenges(updated);
  localStorage.setItem(`challenges_${user.id}`, JSON.stringify(updated));
  const completedList = JSON.parse(localStorage.getItem(`completed_${user.id}`) || "[]");
  const backendSyncedList = JSON.parse(localStorage.getItem(`backendSynced_${user.id}`) || "[]");
  const challenge = updated.find(ch => ch.id === id);
  const challengeCompleted = challenge?.completed;

  if (challengeCompleted && !completedList.includes(id)) {
    completedList.push(id);
    setCompletedChallenges(completedList);
    localStorage.setItem(`completed_${user.id}`, JSON.stringify(completedList));
    if (!backendSyncedList.includes(id)) {
      backendSyncedList.push(id);
      localStorage.setItem(`backendSynced_${user.id}`, JSON.stringify(backendSyncedList));
      updateLifetimeCompleted(user.id, challenge.text);
    }
  } else if (!challengeCompleted) {
    const filtered = completedList.filter(cid => cid !== id);
    setCompletedChallenges(filtered);
    localStorage.setItem(`completed_${user.id}`, JSON.stringify(filtered));

    if (backendSyncedList.includes(id)) {
      const updatedSynced = backendSyncedList.filter(cid => cid !== id);
      localStorage.setItem(`backendSynced_${user.id}`, JSON.stringify(updatedSynced));
      const token = localStorage.getItem("token");
      axios.post(
        `http://localhost:5000/api/users/${user.id}/uncomplete-challenge`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      ).then(res => {
        setLifetimeCompleted(res.data.lifetimeCompleted);
      }).catch(err => {
        console.error("Error uncompleting challenge:", err);
      });
    }
  }
};

  const submitFeeling = (feeling) => {
    const newFeeling = { date: new Date().toISOString().split('T')[0], feeling };
    const updatedFeelings = [...feelingsHistory, newFeeling];
    setFeelingsHistory(updatedFeelings);
    setDailyFeeling(feeling);
    setCanAnswerFeeling(false);
    localStorage.setItem(`feelings_${user.id}`, JSON.stringify(updatedFeelings));
    localStorage.setItem(`lastFeeling_${user.id}`, Date.now().toString());
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const getFeelingsStats = () => {
    const last7Days = feelingsHistory.slice(-7);
    const counts = { "Više samopouzdanja": 0, "Manje samopouzdanja": 0, "Neutralno": 0, "Uzbuđen/a": 0, "Anksiozno": 0 };
    last7Days.forEach(f => { if (counts.hasOwnProperty(f.feeling)) { counts[f.feeling]++; } });
    return counts;
  };

  const getChartData = () => {
    const last14Feelings = feelingsHistory.slice(-14);
    const historyKey = `challengeHistory_${user?.id}`;
    const stored = localStorage.getItem(historyKey);
    const challengeHistory = stored ? JSON.parse(stored) : [];
    const last14Challenges = challengeHistory.slice(-14);
    const feelingScores = { "Više samopouzdanja": 2, "Uzbuđen/a": 1, "Neutralno": 0, "Manje samopouzdanja": -1, "Anksiozno": -2 };
    const dataPoints = [];
    let emotionalScore = 0;
    for (let i = 0; i < Math.max(last14Feelings.length, last14Challenges.length); i++) {
      const feeling = last14Feelings[i];
      const challenge = last14Challenges[i];
      if (feeling) { emotionalScore += feelingScores[feeling.feeling] || 0; }
      dataPoints.push({ date: feeling?.date || challenge?.date || '', emotional: emotionalScore, challenges: challenge?.completed || 0 });
    }
    return dataPoints;
  };

  const getGenderText = (gender) => {
    if (gender === "male") return "Dobrodošao nazad";
    if (gender === "female") return "Dobrodošla nazad";
    return "Dobrodošao/la nazad";
  };

  const getFeelingQuestion = (gender) => {
    if (gender === "male") return "Kako si se osećao danas?";
    if (gender === "female") return "Kako si se osećala danas?";
    return "Kako si se osećao/la danas?";
  };

  if (!user) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

          html, body, #root { width: 100%; margin: 0; padding: 0; overflow-x: hidden; }
          * { margin: 0; padding: 0; box-sizing: border-box; scroll-behavior: smooth; }

          .home {
            min-height: 100vh;
            background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
            color: white;
            font-family: 'DM Sans', sans-serif;
          }

          .header {
            position: fixed; top: 0; left: 0; width: 100%; z-index: 1000;
            display: flex; justify-content: space-between; align-items: center;
            padding: 16px 40px;
            background: rgba(10, 20, 26, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            transform: translateY(0);
            transition: transform 0.35s ease;
          }

          .header.hidden { transform: translateY(-100%); }

          .logo {
            font-family: 'Syne', sans-serif;
            font-size: 1.8rem; font-weight: 800; letter-spacing: 1px;
          }

          .nav { display: flex; align-items: center; gap: 8px; }

          .nav a {
            text-decoration: none; color: white; opacity: 0.85;
            transition: opacity 0.2s ease, transform 0.2s ease;
            cursor: pointer; font-family: 'DM Sans', sans-serif;
            font-size: 0.95rem; padding: 8px 12px;
          }

          .nav a:hover { opacity: 1; transform: translateY(-1px); }

          .login-btn {
            padding: 10px 22px !important; border-radius: 999px;
            background: #00ffb3; color: #0f2027 !important; font-weight: 700 !important;
            opacity: 1 !important; display: inline-flex; align-items: center; gap: 8px;
            transition: transform 0.2s ease, box-shadow 0.2s ease !important;
          }

          .login-btn:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 10px 25px rgba(0, 255, 179, 0.35);
          }

          .hero {
            height: 100vh; display: flex; flex-direction: column;
            justify-content: center; align-items: center;
            text-align: center; padding: 80px 24px 0;
          }

          .slogan {
            font-family: 'Syne', sans-serif;
            font-size: clamp(2.5rem, 8vw, 5rem);
            font-weight: 800; margin-bottom: 20px; line-height: 1.1;
          }

          .tagline {
            font-size: clamp(1rem, 3vw, 1.2rem); opacity: 0.9;
            max-width: 500px; margin-bottom: 40px; line-height: 1.6; padding: 0 16px;
          }

          .start-btn {
            padding: 15px 50px; font-size: 1.1rem; font-weight: 600;
            border: none; border-radius: 30px; background: #00ffb3; color: #0f2027;
            cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease;
            font-family: 'DM Sans', sans-serif;
          }

          .start-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0, 255, 179, 0.3);
          }

          .how { padding: 80px 24px; background: #0f2027; text-align: center; }

          .how h2 {
            font-family: 'Syne', sans-serif;
            font-size: clamp(1.8rem, 5vw, 2.8rem); margin-bottom: 50px;
          }

          .cards {
            display: flex; justify-content: center; gap: 30px;
            flex-wrap: wrap; max-width: 1100px; margin: 0 auto;
          }

          .card {
            background: #203a43; padding: 35px 28px; width: 100%; max-width: 300px;
            border-radius: 20px; transition: transform 0.2s ease, box-shadow 0.2s ease;
          }

          .card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.4); }

          .card h3 { font-family: 'Syne', sans-serif; font-size: 1.3rem; margin-bottom: 14px; }
          .card p { opacity: 0.9; line-height: 1.6; font-size: 0.95rem; }

          .footer {
            background: #0a141a; padding: 60px 24px 30px;
            border-top: 1px solid rgba(255,255,255,0.08);
          }

          .footer-content {
            display: flex; justify-content: space-between; flex-wrap: wrap;
            gap: 30px; margin-bottom: 30px; max-width: 1100px;
            margin-left: auto; margin-right: auto;
          }

          .footer-section h3 { font-family: 'Syne', sans-serif; margin-bottom: 12px; font-size: 1.15rem; }
          .footer-section p { opacity: 0.85; line-height: 1.6; font-size: 0.9rem; }
          .footer-section a { display: block; color: #00ffb3; text-decoration: none; margin-top: 6px; font-size: 0.9rem; }

          .footer-bottom {
            text-align: center; font-size: 0.82rem; opacity: 0.5;
            border-top: 1px solid rgba(255,255,255,0.08); padding-top: 18px;
            max-width: 1100px; margin: 0 auto;
          }

          @media (max-width: 600px) {
            .header { padding: 14px 20px; }
            .logo { font-size: 1.4rem; }
            .nav a:not(.login-btn) { display: none; }
            .hero { padding-top: 70px; }
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
            <p className="tagline">Svaki dan mali izazov koji te gura van zone komfora.</p>
            <button onClick={() => navigate("/login")} className="start-btn">Počni</button>
          </main>

          <section className="how" id="how">
            <h2>Kako radi</h2>
            <div className="cards">
              <div className="card">
                <h3>Dnevni izazovi</h3>
                <p>Svaki dan dobijaš mali društveni izazov prilagođen tvom tipu ličnosti i svakodnevnom okruženju.</p>
              </div>
              <div className="card">
                <h3>Izlazak iz zone komfora</h3>
                <p>Postepeno se suočavaš sa novim društvenim situacijama i gradiš samopouzdanje bez pritiska.</p>
              </div>
              <div className="card">
                <h3>Praćenje napretka</h3>
                <p>Pratiš svoj napredak, skupljaš uspehe i vidiš koliko si daleko stigao.</p>
              </div>
            </div>
          </section>

          <footer className="footer" id="footer">
            <div className="footer-content">
              <div className="footer-section">
                <h3>Thrive</h3>
                <p>Platforma za lični razvoj i izlazak iz zone komfora.</p>
              </div>
              <div className="footer-section">
                <h3>Kontakt</h3>
                <a href="mailto:bibictahir@gmail.com">bibictahir@gmail.com</a>
                <a href="tel:+381628109178">+381 62 8109 178</a>
              </div>
            </div>
            <div className="footer-bottom">© {new Date().getFullYear()} Thrive. All rights reserved.</div>
          </footer>
        </div>
      </>
    );
  }

  const feelingStats = getFeelingsStats();
  const chartData = getChartData();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        html, body, #root { width: 100%; margin: 0; padding: 0; overflow-x: hidden; }
        * { margin: 0; padding: 0; box-sizing: border-box; scroll-behavior: smooth; }

        .home {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
          color: white;
          font-family: 'DM Sans', sans-serif;
        }

        .header {
          position: fixed; top: 0; left: 0; width: 100%; z-index: 1000;
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 40px;
          background: rgba(10, 20, 26, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          transform: translateY(0);
          transition: transform 0.35s ease;
        }

        .header.hidden { transform: translateY(-100%); }

        .logo {
          font-family: 'Syne', sans-serif;
          font-size: 1.8rem; font-weight: 800; letter-spacing: 1px;
          cursor: pointer; transition: color 0.2s ease;
        }

        .logo:hover { color: #00ffb3; }

        .nav { display: flex; align-items: center; gap: 4px; }

        .nav-link {
          text-decoration: none; color: white; opacity: 0.85;
          transition: all 0.2s ease; cursor: pointer;
          padding: 8px 12px; border-radius: 8px;
          font-weight: 500; font-size: 0.9rem; white-space: nowrap;
        }

        .nav-link:hover { opacity: 1; background: rgba(0, 255, 179, 0.1); transform: translateY(-1px); }

        .nav-text-label { display: inline; }

        .settings-wrap { position: relative; display: inline-block; margin-left: 12px; }

        .settings-btn {
          padding: 10px 18px; border-radius: 999px;
          background: #00ffb3; color: #0f2027; font-weight: 700;
          cursor: pointer; display: flex; align-items: center; gap: 8px;
          transition: transform 0.2s ease, box-shadow 0.2s ease; font-size: 1.2rem;
        }

        .settings-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0, 255, 179, 0.35); }

        .dropdown {
          position: absolute; top: 55px; right: 0;
          background: #203a43; border-radius: 14px; min-width: 210px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.5); overflow: hidden; z-index: 2000;
        }

        .drop-item {
          padding: 14px 16px; display: flex; align-items: center; gap: 10px;
          cursor: pointer; transition: background 0.2s ease; font-weight: 600; font-size: 0.95rem;
        }

        .drop-item:hover { background: rgba(255,255,255,0.06); }
        .drop-settings { color: white; }
        .drop-logout { color: #ff5a5a; background: rgba(255,90,90,0.08); }

        .dashboard { padding: 100px 40px 60px; max-width: 1200px; margin: 0 auto; }

        .welcome {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.8rem, 5vw, 2.5rem); font-weight: 700; margin-bottom: 8px;
        }

        .subtitle { font-size: 1rem; opacity: 0.75; margin-bottom: 28px; }

        .quick-access {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 16px; margin-bottom: 30px;
        }

        .access-card {
          background: linear-gradient(135deg, rgba(0, 255, 179, 0.15), rgba(0, 204, 143, 0.1));
          border: 2px solid rgba(0, 255, 179, 0.3); border-radius: 16px;
          padding: 22px; display: flex; align-items: center; gap: 18px;
          cursor: pointer; transition: all 0.3s ease; position: relative; overflow: hidden;
        }

        .access-card::before {
          content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(135deg, rgba(0, 255, 179, 0.1), transparent);
          opacity: 0; transition: opacity 0.3s ease;
        }

        .access-card:hover::before { opacity: 1; }
        .access-card:hover { transform: translateY(-4px); border-color: #00ffb3; box-shadow: 0 10px 30px rgba(0, 255, 179, 0.2); }

        .access-icon { font-size: 2.5rem; flex-shrink: 0; transition: transform 0.3s ease; }
        .access-card:hover .access-icon { transform: scale(1.1) rotate(5deg); }
        .access-content { flex: 1; }

        .access-title {
          font-family: 'Syne', sans-serif; font-size: 1.2rem; font-weight: 700;
          margin-bottom: 4px; color: #00ffb3;
        }

        .access-desc { font-size: 0.85rem; opacity: 0.75; }
        .access-arrow { font-size: 1.5rem; color: #00ffb3; transition: transform 0.3s ease; }
        .access-card:hover .access-arrow { transform: translateX(5px); }

        .section {
          background: rgba(32, 58, 67, 0.6); border-radius: 20px; padding: 30px;
          margin-bottom: 30px; backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .section-title {
          font-family: 'Syne', sans-serif; font-size: 1.6rem; font-weight: 700;
          margin-bottom: 22px; color: #00ffb3;
        }

        .challenge-list { display: flex; flex-direction: column; gap: 12px; }

        .challenge-item {
          background: rgba(15, 32, 39, 0.5); padding: 16px; border-radius: 12px;
          display: flex; align-items: center; gap: 14px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .challenge-item:hover { transform: translateX(4px); box-shadow: 0 4px 14px rgba(0, 255, 179, 0.1); }

        .checkbox {
          width: 24px; height: 24px; min-width: 24px;
          border: 2px solid #00ffb3; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: all 0.2s ease; cursor: pointer;
        }

        .checkbox.checked { background: #00ffb3; }
        .checkmark { color: #0f2027; font-weight: 900; font-size: 14px; }

        .challenge-text { font-size: 1rem; flex-grow: 1; cursor: pointer; line-height: 1.4; }
        .challenge-text.completed { text-decoration: line-through; opacity: 0.5; }

        .shuffle-btn {
          padding: 7px 12px; background: rgba(0, 255, 179, 0.1);
          border: 1px solid #00ffb3; border-radius: 8px; color: #00ffb3;
          cursor: pointer; font-size: 0.82rem; font-weight: 600;
          transition: all 0.2s ease; flex-shrink: 0; white-space: nowrap;
          font-family: 'DM Sans', sans-serif;
        }

        .shuffle-btn:hover { background: #00ffb3; color: #0f2027; }

        .stats-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 16px; margin-bottom: 24px;
        }

        .stat-card { background: rgba(15, 32, 39, 0.5); padding: 22px 16px; border-radius: 12px; text-align: center; }

        .stat-number {
          font-family: 'Syne', sans-serif; font-size: 2.2rem; font-weight: 700;
          color: #00ffb3; margin-bottom: 6px;
        }

        .stat-label { font-size: 0.85rem; opacity: 0.75; }

        .streak-indicator {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          font-family: 'Syne', sans-serif; font-size: 2.2rem; font-weight: 700; color: #ff6b35;
        }

        .feelings-bar { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; }

        .feeling-option {
          flex: 1; min-width: 120px; padding: 13px 10px;
          background: rgba(15, 32, 39, 0.5); border: 2px solid transparent;
          border-radius: 12px; text-align: center; cursor: pointer;
          transition: all 0.2s ease; font-size: 0.88rem; font-family: 'DM Sans', sans-serif;
        }

        .feeling-option:hover:not(.disabled) { border-color: #00ffb3; transform: translateY(-2px); }
        .feeling-option.selected { background: #00ffb3; color: #0f2027; border-color: #00ffb3; font-weight: 700; }
        .feeling-option.disabled { opacity: 0.4; cursor: not-allowed; }

        .disabled-message {
          margin-top: 12px; padding: 14px; background: rgba(255, 179, 0, 0.1);
          border-radius: 8px; text-align: center; color: #ffb300; font-size: 0.9rem;
        }

        .chart-container { background: rgba(15, 32, 39, 0.5); padding: 24px; border-radius: 12px; margin-top: 18px; }

        .chart-title { font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 600; margin-bottom: 16px; opacity: 0.9; }

        .dual-line-chart { position: relative; height: 260px; margin-top: 20px; }

        .chart-canvas {
          position: relative; height: 100%;
          border-left: 2px solid rgba(255, 255, 255, 0.2);
          border-bottom: 2px solid rgba(255, 255, 255, 0.2);
          padding: 16px 0 28px 44px;
        }

        .chart-grid { position: absolute; top: 0; left: 44px; right: 0; bottom: 28px; }

        .grid-line { position: absolute; left: 0; right: 0; height: 1px; background: rgba(255, 255, 255, 0.05); }

        .chart-plot { position: relative; height: 100%; }

        .line { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }

        .data-point {
          position: absolute; width: 8px; height: 8px; border-radius: 50%;
          transform: translate(-50%, -50%); transition: all 0.2s ease;
        }

        .data-point:hover { transform: translate(-50%, -50%) scale(1.5); }

        .chart-legend {
          display: flex; justify-content: center; gap: 24px;
          margin-top: 16px; font-size: 0.85rem; flex-wrap: wrap;
        }

        .legend-item { display: flex; align-items: center; gap: 8px; }
        .legend-color { width: 20px; height: 3px; border-radius: 2px; }
        .legend-color.emotional { background: #00ffb3; }
        .legend-color.challenges { background: #ff6b35; }

        .badges-section { margin-top: 26px; }

        .badges-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 12px; margin-top: 16px;
        }

        .badge-card {
          background: rgba(15, 32, 39, 0.5); padding: 18px 14px; border-radius: 12px;
          text-align: center; border: 2px solid transparent; transition: all 0.2s ease;
        }

        .badge-card.earned { border-color: #00ffb3; background: rgba(0, 255, 179, 0.05); }
        .badge-card.locked { opacity: 0.4; }

        .badge-icon { font-size: 2.5rem; margin-bottom: 8px; filter: grayscale(100%); display: block; }
        .badge-card.earned .badge-icon { filter: grayscale(0%); }

        .badge-name { font-family: 'Syne', sans-serif; font-size: 0.88rem; font-weight: 600; margin-bottom: 4px; }
        .badge-desc { font-size: 0.72rem; opacity: 0.7; line-height: 1.3; }

        .badge-modal {
          position: fixed; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          background: linear-gradient(135deg, #203a43, #2c5364);
          padding: 36px 30px; border-radius: 20px; border: 3px solid #00ffb3;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
          z-index: 10000; text-align: center; min-width: 280px; max-width: 90vw;
          animation: badgeAppear 0.4s ease;
        }

        @keyframes badgeAppear {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }

        .badge-modal-icon { font-size: 4.5rem; margin-bottom: 16px; animation: badgeBounce 0.6s ease; display: block; }

        @keyframes badgeBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-18px); }
        }

        .badge-modal-title { font-family: 'Syne', sans-serif; font-size: 1.4rem; font-weight: 700; color: #00ffb3; margin-bottom: 8px; }
        .badge-modal-subtitle { font-family: 'Syne', sans-serif; font-size: 1.15rem; margin-bottom: 12px; }
        .badge-modal-desc { opacity: 0.8; line-height: 1.5; font-size: 0.95rem; }

        .refresh-btn {
          margin-top: 10px; padding: 8px 16px;
          background: rgba(0, 255, 179, 0.2); border: 1px solid #00ffb3;
          border-radius: 8px; color: #00ffb3; cursor: pointer; font-size: 0.8rem;
          font-family: 'DM Sans', sans-serif; font-weight: 600; transition: all 0.2s ease;
        }

        .refresh-btn:hover { background: rgba(0, 255, 179, 0.35); }

        @media (max-width: 768px) {
          .header { padding: 14px 20px; }
          .logo { font-size: 1.5rem; }
          .nav-text-label { display: none; }
          .nav-link { padding: 8px 10px; font-size: 1rem; }
          .settings-wrap { margin-left: 6px; }
          .settings-btn { padding: 9px 14px; font-size: 1rem; }
          .dashboard { padding: 88px 16px 40px; }
          .section { padding: 22px 16px; border-radius: 16px; }
          .section-title { font-size: 1.35rem; }
          .challenge-item { padding: 14px 12px; gap: 10px; }
          .challenge-text { font-size: 0.92rem; }
          .shuffle-btn { padding: 6px 10px; font-size: 0.78rem; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .stat-card { padding: 18px 12px; }
          .stat-number, .streak-indicator { font-size: 1.8rem; }
          .feelings-bar { gap: 8px; }
          .feeling-option { min-width: 100px; padding: 11px 8px; font-size: 0.82rem; }
          .quick-access { grid-template-columns: 1fr; }
          .access-card { padding: 18px 16px; }
          .access-icon { font-size: 2rem; }
          .badges-grid { grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 10px; }
          .badge-card { padding: 14px 10px; }
          .badge-icon { font-size: 2rem; }
          .dual-line-chart { height: 200px; }
          .dropdown { right: -10px; min-width: 190px; }
        }

        @media (max-width: 400px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .feeling-option { min-width: 80px; font-size: 0.78rem; padding: 10px 6px; }
          .welcome { font-size: 1.6rem; }
        }
      `}</style>

      <div className="home">
        <header className={`header ${showHeader ? "" : "hidden"}`}>
          <div className="logo" onClick={() => navigate("/")}>Thrive</div>
          <nav className="nav">
            <a className="nav-link" onClick={() => navigate("/")}>
              <span className="nav-text-label">Početna</span>
            </a>
            <a className="nav-link" onClick={() => navigate("/friends")}>
              👥 <span className="nav-text-label">Prijatelji</span>
            </a>
            <a className="nav-link" onClick={() => navigate("/leaderboard")}>
              🏆 <span className="nav-text-label">Rang lista</span>
            </a>

            <div className="settings-wrap">
              <div className="settings-btn" onClick={() => setOpenMenu(!openMenu)}>⚙</div>
              {openMenu && (
                <div className="dropdown">
                  <div className="drop-item drop-settings" onClick={() => navigate("/AccountSettings")}>⚙ Account Settings</div>
                  <div className="drop-item drop-logout" onClick={logout}>✖ Log out</div>
                </div>
              )}
            </div>
          </nav>
        </header>

        <div className="dashboard">
          <h1 className="welcome">{getGenderText(user.gender)}, {user.name}!</h1>
          <p className="subtitle">Nastavi da gradiš svoje samopouzdanje svaki dan.</p>

          <div className="quick-access">
            <div className="access-card" onClick={() => navigate("/friends")}>
              <div className="access-icon">👥</div>
              <div className="access-content">
                <div className="access-title">Prijatelji</div>
                <div className="access-desc">Poveži se i uporedi napredak</div>
              </div>
              <div className="access-arrow">→</div>
            </div>
            <div className="access-card" onClick={() => navigate("/leaderboard")}>
              <div className="access-icon">🏆</div>
              <div className="access-content">
                <div className="access-title">Rang Lista</div>
                <div className="access-desc">Vidi gde si na svetskoj listi</div>
              </div>
              <div className="access-arrow">→</div>
            </div>
          </div>

          {showBadgeModal && newBadge && (
            <div className="badge-modal">
              <span className="badge-modal-icon">{newBadge.icon}</span>
              <div className="badge-modal-title">Čestitamo!</div>
              <div className="badge-modal-subtitle">{newBadge.name}</div>
              <div className="badge-modal-desc">{newBadge.description}</div>
            </div>
          )}

          <div className="section">
            <h2 className="section-title">Današnji izazovi</h2>
            <div className="challenge-list">
              {challenges.map(challenge => (
                <div key={challenge.id} className="challenge-item">
                  <div className={`checkbox ${challenge.completed ? 'checked' : ''}`} onClick={() => toggleChallenge(challenge.id)}>
                    {challenge.completed && <span className="checkmark">✓</span>}
                  </div>
                  <div className={`challenge-text ${challenge.completed ? 'completed' : ''}`} onClick={() => toggleChallenge(challenge.id)}>
                    {challenge.text}
                  </div>
                  <button className="shuffle-btn" onClick={() => shuffleChallenge(challenge.id)}>Pomešaj</button>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <h2 className="section-title">Tvoj napredak</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{lifetimeCompleted}</div>
                <div className="stat-label">Ukupno završenih</div>
                <button className="refresh-btn" onClick={() => { fetchLifetimeCompleted(user.id); }}>🔄 Refresh</button>
              </div>
              <div className="stat-card">
                <div className="streak-indicator">🔥 {currentStreak}</div>
                <div className="stat-label">Trenutni niz</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{longestStreak}</div>
                <div className="stat-label">Najduži niz</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{challenges.filter(ch => ch.completed).length}/{challenges.length}</div>
                <div className="stat-label">Današnji progres</div>
              </div>
            </div>

            <div className="chart-container">
              <div className="chart-title">Tvoj napredak kroz vreme</div>
              <div className="dual-line-chart">
                <div className="chart-canvas">
                  <div className="chart-grid">
                    {[0, 1, 2, 3, 4].map(i => (
                      <div key={i} className="grid-line" style={{ top: `${i * 25}%` }} />
                    ))}
                  </div>
                  <div className="chart-plot">
                    {chartData.length > 0 && (
                      <svg className="line emotional-line" style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 100 100" preserveAspectRatio="none">
                        <polyline
                          points={chartData.map((point, i) => {
                            const x = (i / Math.max(chartData.length - 1, 1)) * 100;
                            const maxScore = Math.max(...chartData.map(p => Math.abs(p.emotional))) || 1;
                            const y = 50 - (point.emotional / (maxScore * 2)) * 80;
                            return `${x},${y}`;
                          }).join(' ')}
                          fill="none" stroke="#00ffb3" strokeWidth="0.5" vectorEffect="non-scaling-stroke"
                        />
                      </svg>
                    )}
                    {chartData.length > 0 && (
                      <svg className="line challenges-line" style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 100 100" preserveAspectRatio="none">
                        <polyline
                          points={chartData.map((point, i) => {
                            const x = (i / Math.max(chartData.length - 1, 1)) * 100;
                            const maxChallenges = Math.max(...chartData.map(p => p.challenges)) || 5;
                            const y = 100 - (point.challenges / maxChallenges) * 80;
                            return `${x},${y}`;
                          }).join(' ')}
                          fill="none" stroke="#ff6b35" strokeWidth="0.5" vectorEffect="non-scaling-stroke"
                        />
                      </svg>
                    )}
                    {chartData.map((point, i) => {
                      const x = (i / Math.max(chartData.length - 1, 1)) * 100;
                      const maxScore = Math.max(...chartData.map(p => Math.abs(p.emotional))) || 1;
                      const y = 50 - (point.emotional / (maxScore * 2)) * 80;
                      return (
                        <div key={`e-${i}`} className="data-point" style={{ left: `${x}%`, top: `${y}%`, background: '#00ffb3' }} title={`${point.date}: Emocionalno ${point.emotional > 0 ? '+' : ''}${point.emotional}`} />
                      );
                    })}
                    {chartData.map((point, i) => {
                      const x = (i / Math.max(chartData.length - 1, 1)) * 100;
                      const maxChallenges = Math.max(...chartData.map(p => p.challenges)) || 5;
                      const y = 100 - (point.challenges / maxChallenges) * 80;
                      return (
                        <div key={`c-${i}`} className="data-point" style={{ left: `${x}%`, top: `${y}%`, background: '#ff6b35' }} title={`${point.date}: ${point.challenges} izazova`} />
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-color emotional"></div>
                  <span>Emocionalno stanje</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color challenges"></div>
                  <span>Završeni izazovi</span>
                </div>
              </div>
            </div>

            <div className="badges-section">
              <h3 className="chart-title">Tvoje značke</h3>
              <div className="badges-grid">
                {BADGE_DEFINITIONS.map(badge => {
                  const isEarned = badges.some(b => b.id === badge.id);
                  return (
                    <div key={badge.id} className={`badge-card ${isEarned ? 'earned' : 'locked'}`}>
                      <span className="badge-icon">{badge.icon}</span>
                      <div className="badge-name">{badge.name}</div>
                      <div className="badge-desc">{badge.description}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="section">
            <h2 className="section-title">{getFeelingQuestion(user.gender)}</h2>
            {!canAnswerFeeling && (
              <div className="disabled-message">Već si odgovorio/la danas. Vrati se sutra!</div>
            )}
            <div className="feelings-bar">
              {["Više samopouzdanja", "Manje samopouzdanja", "Neutralno", "Uzbuđen/a", "Anksiozno"].map(feeling => (
                <div
                  key={feeling}
                  className={`feeling-option ${dailyFeeling === feeling ? 'selected' : ''} ${!canAnswerFeeling ? 'disabled' : ''}`}
                  onClick={() => canAnswerFeeling && submitFeeling(feeling)}
                >
                  {feeling}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;