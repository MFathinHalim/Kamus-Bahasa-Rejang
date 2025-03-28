"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import Link from "next/link";

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  const refreshAccessToken = async () => {
    const storedToken = sessionStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      router.push("/");
    }

    const response = await fetch("/api/user/session/token/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      if (data.token) {
        setToken(data.token);
        sessionStorage.setItem("token", data.token);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    refreshAccessToken();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const response = await fetch("/api/user/session/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      if (data.token) {
        setToken(data.token);
        sessionStorage.setItem("token", data.token);
        router.push("/"); // Arahkan ke halaman utama setelah sukses Sign Up
      }
    } else {
      setErrorMessage(
        response.status === 401
          ? "Invalid username or password. Please try again."
          : "Server error. Please try again later."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
      <header className="w-full flex justify-between items-center pb-6">
        <a href="/" className="flex items-center gap-2 bg-gray-200 p-2 px-3 rounded-lg">
            <img
              src="https://cdn.glitch.global/453b0d20-b8fc-4202-841d-a49bccee5c1e/a.png?v=1712387524665"
              alt="Logo"
              width={32}
              height={32}
            />
            <span className="font-bold hidden md:block text-xl">Kamus Bahasa Rejang</span>
          </a>
          <a href="/list" className="text-lg text-gray-600 hover:underline">
            Daftar Kata
          </a>
        </header>

        <h2 className="text-3xl font-bold text-center mb-4 text-red-500">Sign Up</h2>
        {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-100"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-100"
              required
            />
            <div className="mt-2">
              <label className="text-sm text-gray-600 flex items-center">
                <input
                  type="checkbox"
                  onChange={() => setShowPassword((prev) => !prev)}
                  className="mr-2"
                />
                Show Password
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold text-xl"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-red-500 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
