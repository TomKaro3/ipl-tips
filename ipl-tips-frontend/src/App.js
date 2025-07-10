import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import TipPage from "./pages/TipPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import AdminPage from "./pages/AdminPage";
import AdminOnlyRoute from "./components/AdminOnlyRoute";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<PrivateRoute><Navigate to="/" /></PrivateRoute>} />
        <Route path="/tips" element={<PrivateRoute><TipPage /></PrivateRoute>} />
        <Route path="/leaderboard" element={<PrivateRoute><LeaderboardPage /></PrivateRoute>} />
        <Route path="/admin" element={<AdminOnlyRoute><AdminPage /></AdminOnlyRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;