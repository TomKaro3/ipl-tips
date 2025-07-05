import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
axios.defaults.withCredentials = true;

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!username || !password) return alert("Enter both username and password");
    axios
      .post(`${process.env.REACT_APP_API_BASE_URL}/users/login`, { username, password })
      .then(() => {
        localStorage.setItem("username", username);
        navigate("/tips");
      })
      .catch(() => {
        alert("Login failed. Check username and password.");
      });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-sm p-6 bg-white rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Illawarra Tips Login
        </h2>
        <div className="space-y-4">
          <input
            className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <input
            type="password"
            className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button
            onClick={handleLogin}
            className="w-full py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Login
          </button>
        </div>
        <p className="mt-4 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-500 hover:underline font-medium"
          >
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}
