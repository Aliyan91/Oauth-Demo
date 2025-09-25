"use client";

import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/csrf-token", { withCredentials: true })
      .then((res) => setCsrfToken(res.data.csrfToken))
      .catch((err) => console.error(err));
  }, []);

  const handleGithubClick = () => {
    window.location.href = "http://localhost:5000/auth/github";
  };

  const handleProtectedAction = async () => {
    try {
      await axios.post(
        "http://localhost:5000/protected",
        { data: "test" },
        {
          headers: { "csrf-token": csrfToken },
          withCredentials: true,
        }
      );
      alert("Action successful");
    } catch (err) {
      alert("CSRF validation failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <div className="w-full max-w-md bg-gray-950 border border-gray-800 rounded-2xl shadow-lg p-8 space-y-6">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="text-gray-400 mt-2">
            Sign in with one of the following providers
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          <button onClick={handleGithubClick} className="w-full flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg shadow transition cursor-pointer">
            <Image src="/github2.webp" alt="GitHub" width={40} height={20} />
            Continue with GitHub
          </button>

          <button onClick={() => window.location.href = "http://localhost:5000/auth/google"} className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 px-4 rounded-lg shadow transition cursor-pointer">
            <Image src="/google.webp" alt="Google" width={30} height={20} />
            Continue with Google
          </button>

          <button onClick={() => window.location.href = "http://localhost:5000/auth/facebook"} className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg shadow transition cursor-pointer">
            <Image src="/facebook.webp" alt="Facebook" width={30} height={20} />
            Continue with Facebook
          </button>
        </div>

        {/* Example protected button */}
        <button
          onClick={handleProtectedAction}
          className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
        >
          Do Protected Action
        </button>
      </div>
    </div>
  );
}
