"use client";
import { useState, useEffect } from "react";

const languages = [
  { code: "id", name: "Indonesia" },
  { code: "en", name: "English" },
  { code: "fr", name: "French" },
  { code: "es", name: "Spanish" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
];

export default function Home() {
  const [inputWord, setInputWord] = useState("");
  const [result, setResult] = useState("The Result Will Appear Here");
  const [selectedLang, setSelectedLang] = useState("id");
  const [isRejangMode, setIsRejangMode] = useState(false);
  const [aksaraOnly, setAksaraOnly] = useState(false);
  const [token, setToken] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [aksara, setAksara] = useState("kgf");

  const refreshAccessToken = async (): Promise<string | null> => {
    const res = await fetch("/api/user/session/token/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.token ?? null;
  };
  useEffect(() => {
    const init = async () => {
      const tokenTemp = await refreshAccessToken();
      if (!tokenTemp) return;

      setToken(tokenTemp);

      const res = await fetch("/api/user/session/token/check", {
        method: "POST",
        headers: { Authorization: `Bearer ${tokenTemp}` },
      });

      if (!res.ok) return;
      const userData = await res.json();
      setIsLoggedIn(true);
    };

    init();
  }, []);
  useEffect(() => {
    refreshAccessToken();
  }, []);

  const handleFetch = async () => {
    if (!inputWord) return;

    try {
      let endpoint = "";

      if (aksaraOnly) {
        endpoint = `/api/word/kaganga?word=${encodeURIComponent(inputWord)}`;
      } else {
        const mode = isRejangMode ? "rejang" : selectedLang;
        endpoint = `/api/word/translate/${mode}?word=${encodeURIComponent(
          inputWord,
        )}&lang=${selectedLang}`;
      }

      const res = await fetch(endpoint);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResult(data.result || data);
      setAksara(data.aksara);
    } catch {
      setResult("Translation error");
    }
  };
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/user/session/logout", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        sessionStorage.clear();
        setIsLoggedIn(false);
      } else {
        console.error("Failed to logout");
      }
    } catch (error) {
      console.error("An error occurred during logout:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3] px-6 py-8 relative">
      {/* Top Right Profile */}
      <div className="absolute top-6 right-9">
        {isLoggedIn ? (
          <div className="relative">
            <img
              src="https://i.pinimg.com/736x/d9/06/d6/d906d6191391b009da3583c925577a65.jpg"
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-12 h-12 rounded-full bg-gray-400 cursor-pointer flex items-center justify-center text-white font-bold text-lg shadow-md"
            />

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg py-2">
                <a
                  href="/list"
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Word List
                </a>
                <button
                  onClick={() => handleLogout()}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <a
            href="/user/login"
            className="bg-red-400 text-white px-5 py-2 rounded-full font-semibold shadow-md"
          >
            Login
          </a>
        )}
      </div>

      <div className="max-w-6xl mx-auto text-center mt-16">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <span className="text-white font-bold text-2xl">
            <img src="/a.png" alt="Logo" className="w-16 h-16" />
          </span>
        </div>

        <h1 className="text-3xl hidden md:inline-block font-semibold bg-gray-200 px-8 py-3 rounded-xl mb-10">
          Kamus Bahasa Rejang
        </h1>

        <div className="flex justify-center items-center gap-4 mb-10 flex-wrap">
          <select
            value={selectedLang}
            onClick={() => setIsRejangMode(false)}
            onChange={(e) => setSelectedLang(e.target.value)}
            className={`px-6 py-3 rounded-full text-lg font-semibold transition ${
              !isRejangMode
                ? "bg-red-400 text-white"
                : "bg-gray-300 text-gray-700"
            }`}
          >
            {languages.map((lang) => (
              <option
                key={lang.code}
                value={lang.code}
                className="text-black bg-gray-300"
              >
                {lang.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsRejangMode(true)}
            className={`px-6 py-3 rounded-full text-lg font-semibold transition ${
              isRejangMode && !aksaraOnly
                ? "bg-red-400 text-white"
                : "bg-gray-300 text-gray-700"
            }`}
          >
            Rejang
          </button>

          <button
            onClick={() => setAksaraOnly(!aksaraOnly)}
            className={`px-6 py-3 rounded-full text-lg font-semibold transition ${
              aksaraOnly ? "bg-red-400 text-white" : "bg-gray-300 text-gray-700"
            }`}
          >
            Aksara Only
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <textarea
            value={inputWord}
            onChange={(e) => setInputWord(e.target.value)}
            placeholder="Tulis kata/kalimat yang ingin diterjemahkan"
            className="w-full h-56 p-6 rounded-xl border-1 border-gray-500 resize-none focus:outline-none text-lg"
          />

          <div className="w-full h-56 p-6 rounded-xl bg-gray-200 text-left overflow-auto text-lg">
            {result}
            <br />
            <span className="rejang">{aksara}</span>
          </div>
        </div>

        <button
          onClick={handleFetch}
          className="bg-red-400 hover:bg-red-500 text-white px-16 py-4 rounded-full text-xl font-semibold shadow-sm"
        >
          Terjemahkan
        </button>
      </div>
    </div>
  );
}
