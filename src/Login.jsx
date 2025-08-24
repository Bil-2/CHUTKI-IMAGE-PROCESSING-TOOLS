import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import config from "./config";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Check for token in query params (Google OAuth redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      navigate("/");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    // ✅ Strong password regex
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    if (!strongPasswordRegex.test(password)) {
      alert(
        "Password must be at least 6 characters and include:\n" +
        "- Uppercase letter\n- Lowercase letter\n- Number\n- Special character"
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${config.API_BASE_URL}${config.ENDPOINTS.LOGIN}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        navigate("/");
      } else {
        alert(data.message || "Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = `${config.API_BASE_URL}${config.ENDPOINTS.GOOGLE_AUTH}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 dark:from-gray-900 dark:via-purple-900 dark:to-black transition-colors">
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="https://img.icons8.com/fluency/96/bot.png"
            alt="Chutki Logo"
            className="w-12 h-12 sm:w-14 sm:h-14 animate-bounce"
          />
        </div>

        {/* Title */}
        <p className="text-sm sm:text-base font-bold italic tracking-wide text-center mb-6 text-purple-600 dark:text-purple-300">
          <span className="relative px-2">Chutki Image Tools</span>
        </p>

        <h1 className="text-xl sm:text-2xl font-bold text-center text-purple-700 dark:text-purple-300 mb-4">
          Login
        </h1>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            autoComplete="email"
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:ring focus:ring-purple-300 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              autoComplete="current-password"
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:ring focus:ring-purple-300 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-300"
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm sm:text-base py-2 rounded-lg hover:opacity-90 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-4">
          <hr className="flex-1 border-gray-300 dark:border-gray-600" />
          <span className="px-2 text-gray-500 dark:text-gray-400 text-xs sm:text-sm">or</span>
          <hr className="flex-1 border-gray-300 dark:border-gray-600" />
        </div>

        {/* Google Sign-In */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg py-2 text-sm sm:text-base hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <img
            src="https://img.icons8.com/color/48/google-logo.png"
            alt="Google"
            className="w-4 h-4 sm:w-5 sm:h-5"
          />
          <span className="text-gray-700 dark:text-gray-300">Sign in with Google</span>
        </button>

        {/* Register Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
