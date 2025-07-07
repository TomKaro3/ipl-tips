import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminPage() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  useEffect(() => {
    if (!username || username !== "admin") {
      navigate("/login");
    }
  }, [username, navigate]);

  const [round, setRound] = useState("1");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleImport = async (type) => {
    setLoading(true);
    setMessage("");
    try {
      const route =
        type === "fixture" ? "importfixtures" : "importresults";

      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/matches`,
        {
          method: "POST",
          credentials: "include", // needed for cookies/sessions
        }
      );
      const text = await res.text();
      setMessage(text);
    } catch (err) {
      setMessage("Import failed.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-indigo-800 to-purple-700 text-white px-4">
      <div className="bg-white text-gray-900 rounded-2xl shadow-xl p-8 max-w-md w-full space-y-6">
        <h2 className="text-2xl font-bold text-center">Admin Import Panel</h2>

        <div className="space-y-2">
          <label className="block font-semibold">Round Number</label>
          <input
            type="text"
            value={round}
            onChange={(e) => setRound(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => handleImport("fixture")}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
          >
            Import Fixtures
          </button>
          <button
            onClick={() => handleImport("result")}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
          >
            Import Results
          </button>
        </div>

        {message && <p className="text-center text-sm mt-4">{message}</p>}
      </div>
    </div>
  );
}
