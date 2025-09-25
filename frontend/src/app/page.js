"use client";

import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = () => {
    // Here you can also clear cookies/session if needed
    router.push("/login"); // redirect to login page
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
      <p className="text-gray-400 mb-10">Welcome to your dashboard!</p>

      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-medium transition"
      >
        Logout
      </button>
    </div>
  );
}


