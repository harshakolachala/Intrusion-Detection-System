import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="text-center max-w-md">
        <AlertTriangle className="w-20 h-20 text-red-500 mx-auto mb-6" />

        <h1 className="text-6xl font-bold text-white">404</h1>

        <h2 className="text-2xl font-semibold text-slate-200 mt-4">
          Page Not Found
        </h2>

        <p className="text-slate-400 mt-4">
          The page you are looking for does not exist or has been moved.
        </p>

        <button
          onClick={() => navigate("/dashboard")}
          className="mt-8 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFound;