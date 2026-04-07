import { Routes, Route } from "react-router-dom";
import Home from "./Components/Home";
import Login from "./Components/Login";
import Register from "./Components/Register";
import AccountSettings from "./Components/AccountSettings";
import Friends from "./Components/Friends";
import Leaderboard from "./Components/Leaderboard";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/accountsettings" element={<AccountSettings />} />
      <Route path="/friends" element={<Friends />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
    </Routes>
  );
};

export default App;
