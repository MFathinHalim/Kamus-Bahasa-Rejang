"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const refreshToken = async () => {
      const res = await fetch("/api/user/session/token/refresh", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) return router.push("/");
      }
      setIsLoading(false);
    };
    refreshToken();
  }, [router]);

  if (isLoading) return <p className="text-center mt-20 text-xl">Loading...</p>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/user/session/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });
    if (res.ok) router.push("/");
    else setErrorMessage("Username atau password salah.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-sm p-12 flex flex-col items-center animate-fadeIn">
        <h1 className="text-5xl font-extrabold text-red-400 mb-8">Login</h1>
        {errorMessage && (
          <p className="text-red-500 mb-6 text-lg font-medium">
            {errorMessage}
          </p>
        )}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-5 text-xl rounded-2xl border-2 border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-300 transition-all bg-gray-50"
            required
          />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-5 text-xl rounded-2xl border-2 border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-300 transition-all bg-gray-50"
            required
          />
          <label className="flex items-center gap-3 text-gray-600 text-lg">
            <input
              type="checkbox"
              onChange={() => setShowPassword((p) => !p)}
              className="w-5 h-5 accent-red-400"
            />
            Show Password
          </label>
          <button className="w-full py-5 rounded-2xl text-white font-bold text-2xl bg-gradient-to-r from-red-400 to-pink-400 hover:scale-105 transform transition-all shadow-xl">
            Login
          </button>
        </form>
        <p className="mt-8 text-gray-600 text-lg">
          Belum punya akun?{" "}
          <a
            href="/user/signup"
            className="text-pink-400 font-bold hover:underline"
          >
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
