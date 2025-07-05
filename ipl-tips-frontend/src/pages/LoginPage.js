import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
axios.defaults.withCredentials = true;

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!username || !password) return alert("Enter both username and password");
    setLoading(true);
    axios
      .post(`${process.env.REACT_APP_API_BASE_URL}/users/login`, { username, password })
      .then(() => {
        localStorage.setItem("username", username);
        navigate("/tips");
      })
      .catch(() => {
        alert("Login failed. Check username and password.");
      })
      .finally(() => setLoading(false));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 px-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 15 }}
        className="w-full max-w-md p-8 bg-white rounded-3xl shadow-2xl border border-blue-200"
      >
        <h2 className="text-3xl font-extrabold text-center text-indigo-700 mb-8 tracking-wide">
          Illawarra Tips Login
        </h2>
        <div className="space-y-6">
          <input
            className="w-full px-5 py-4 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-300 placeholder-indigo-300 transition"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            disabled={loading}
          />
          <input
            type="password"
            className="w-full px-5 py-4 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-300 placeholder-indigo-300 transition"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full py-4 text-white text-lg font-semibold rounded-xl transition-colors ${
              loading
                ? "bg-indigo-300 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
        <p className="mt-6 text-center text-sm text-indigo-600">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold underline hover:text-indigo-800"
          >
            Sign up here
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}
