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
      transition={{ duration: 0.7 }}
      className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-indigo-900 via-purple-800 to-pink-700 px-6"
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.3 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 sm:p-12"
      >
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-10 tracking-tight">
          Welcome Back
        </h1>

        <div className="space-y-8">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            disabled={loading}
            className="w-full px-6 py-4 text-lg rounded-xl border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
            className="w-full px-6 py-4 text-lg rounded-xl border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full py-4 text-white text-lg font-semibold rounded-xl transition-colors ${
              loading
                ? "bg-indigo-300 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-purple-600 hover:to-indigo-600"
            }`}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </div>

        <p className="mt-10 text-center text-sm text-gray-500">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-indigo-600 hover:text-indigo-800 underline"
          >
            Sign up here
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}
