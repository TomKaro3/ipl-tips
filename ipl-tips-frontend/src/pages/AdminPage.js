import { useState } from "react";

export default function AdminPage() {
  const [round, setRound] = useState("1");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleImport = async (type) => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/matches/${type}/${round}`, {
        method: "POST",
      });
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
          <label htmlFor="round" className="block text-sm font-medium">
            Select Round
          </label>
          <select
            id="round"
            value={round}
            onChange={(e) => setRound(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500"
          >
            {[...Array(22)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                R{i + 1}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col space-y-4">
          <button
            onClick={() => handleImport("importfixtures")}
            className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition"
            disabled={loading}
          >
            {loading ? "Importing Fixtures..." : "Import Fixtures"}
          </button>
          <button
            onClick={() => handleImport("importresults")}
            className="py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition"
            disabled={loading}
          >
            {loading ? "Importing Results..." : "Import Results"}
          </button>
        </div>

        {message && (
          <div className="mt-4 text-center text-sm font-medium text-purple-700">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
