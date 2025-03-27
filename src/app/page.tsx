"use client";
import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [inputWord, setInputWord] = useState("");
  const [mode, setMode] = useState("indonesia");
  const [result, setResult] = useState("");
  const [aksaraOnly, setAksaraOnly] = useState(false); // Toggle variable
  const [aksara, setAksara] = useState("");

  const handleFetch = async () => {
    try {
      const endpoint = aksaraOnly
        ? `/api/word/kaganga?word=${encodeURIComponent(inputWord)}`
        : `/api/word/translate/${mode}?word=${encodeURIComponent(inputWord)}`;

      const response = await fetch(endpoint);
      if (!response.ok) throw new Error("Translation not found");

      const data = await response.json();
      if(aksaraOnly) { return setAksara(data) }
      setResult(data.result);
      setAksara(data.aksara);
    } catch (error) {
      console.error("Error fetching translation:", error);
      setResult("Translation error");
    }
  };

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === "rejang" ? "indonesia" : "rejang"));
  };

  const toggleAksaraOnly = async () => {
    setAksaraOnly((prev) => !prev); // Toggles aksaraOnly mode
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gray-100">
      <main className="w-full max-w-lg">
        <header className="w-full flex justify-between items-center pb-6">
          <div className="flex items-center gap-2">
            <img
              src="https://cdn.glitch.global/453b0d20-b8fc-4202-841d-a49bccee5c1e/a.png?v=1712387524665"
              alt="Logo"
              width={32}
              height={32}
            />
            <span className="font-bold d-none d-sm-none d-lg-block text-2xl">Kamus Bahasa Rejang</span>
          </div>
          <a href="#" className="text-lg text-gray-600 hover:underline">
            Daftar Kata
          </a>
        </header>

        <h2 className="text-2xl font-semibold mt-4">Terjemahkan dari Bahasa</h2>

        <div className="flex items-center justify-between mb-6 mt-2">
          <div
            className="relative flex items-center w-50 h-8 bg-gray-300 rounded-full cursor-pointer"
            onClick={toggleMode}
          >
            <div
              className={`absolute left-0 w-1/2 h-full flex items-center justify-center font-semibold rounded-full transition-all duration-300 ${mode === "indonesia" ? "bg-red-400 text-white" : "bg-gray-300 text-gray-700"
                }`}
            >
              Indonesia
            </div>
            <div
              className={`absolute right-0 w-1/2 h-full flex items-center justify-center font-semibold rounded-full transition-all duration-300 ${mode === "rejang" ? "bg-red-400 text-white" : "bg-gray-300 text-gray-700"
                }`}
            >
              Rejang
            </div>
          </div>

          <button
            onClick={toggleAksaraOnly}
            className={`${aksaraOnly ? "bg-red-400 text-white" : "bg-gray-300 text-gray-700"
              } font-semibold py-2 px-4 rounded-lg`}
          >
            {aksaraOnly ? "Aksara Only" : "Aksara Only"}
          </button>
        </div>

        <textarea
          value={inputWord}
          onChange={(e) => setInputWord(e.target.value)}
          placeholder="Tulis kata/kalimat yang ingin diterjemahkan"
          className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-1 resize-none h-32 bg-gray-100"
        />

        <button
          onClick={handleFetch}
          className="w-full bg-red-400 hover:bg-red-500 text-white py-3 rounded-full text-xl font-semibold"
        >
          Terjemahkan
        </button>

        <div className="mt-8">
          <h6 className="text-2xl font-semibold mb-2 transition-opacity duration-300">
            Hasil
          </h6>
          <div
            className={`p-4 border rounded-lg bg-gray-100 text-gray-700 text-xl overflow-hidden`}
          >
            <span className={`block transition-all duration-200 ${aksaraOnly ? "h-0 opacity-0" : "h-auto opacity-100"
              }`}>{result}</span>
            <span className="rejang">{aksara}</span>
          </div>
        </div>

        <footer className="mt-auto text-lg text-gray-500 py-4 w-full">
          © 2025, Fathin
        </footer>
      </main>
    </div>
  );
}
