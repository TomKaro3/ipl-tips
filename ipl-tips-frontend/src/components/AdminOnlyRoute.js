import { Navigate } from "react-router-dom";

export default function AdminOnlyRoute({ children }) {
  const username = localStorage.getItem("username");
  if (username !== "admin") return <Navigate to="/login" />;
  return children;
}
