import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const hasRedirected = useRef(false);

  useEffect(() => {
    console.log("OAuthSuccess component mounted");

    // Prevent multiple redirects
    if (hasRedirected.current) {
      console.log("Already redirected, skipping");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    console.log("URL params:", window.location.search);
    console.log("Token found:", !!token);

    if (token) {
      console.log("Saving token and redirecting to home");
      hasRedirected.current = true;

      // Save token for later API requests
      localStorage.setItem("token", token);

      // Redirect to home/dashboard
      navigate("/", { replace: true });
    } else {
      console.log("No token found, redirecting to login");
      hasRedirected.current = true;

      // If no token, go back to login
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-lg font-semibold text-gray-700">Finishing sign-in...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
}
