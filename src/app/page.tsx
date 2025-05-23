"use client";
import { useEffect, useState } from "react";

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
  const [selectedLang, setSelectedLang] = useState("auto");
  const [mode, setMode] = useState("auto");
  const [result, setResult] = useState("Hasil muncul disini");
  const [aksaraOnly, setAksaraOnly] = useState(false);
  const [aksara, setAksara] = useState("kgf");

  const handleFetch = async () => {
    try {
      const langMode = mode === "auto" ? selectedLang : mode;
      const endpoint = aksaraOnly
        ? `/api/word/kaganga?word=${encodeURIComponent(inputWord)}`
        : `/api/word/translate/${langMode}?word=${encodeURIComponent(inputWord)}&lang=${selectedLang}`;

      const response = await fetch(endpoint);
      if (!response.ok) throw new Error("Translation not found");

      const data = await response.json();
      if (aksaraOnly) {
        setResult(inputWord);
        return setAksara(data);
      }
      setResult(data.result);
      setAksara(data.aksara);
    } catch (error) {
      console.error("Error fetching translation:", error);
      setResult("Translation error");
    }
  };

  const toggleMode = () => {
    if (mode !== "rejang" && selectedLang === 'auto') {
      setSelectedLang("id")
    }
    setMode((prevMode) => (prevMode === "rejang" ? "auto" : "rejang"));
  };

  const toggleAksaraOnly = () => {
    setAksaraOnly((prev) => !prev);
    setResult(inputWord || "Hasil Muncul Disini");
  };

  useEffect(() => {
    if (inputWord) handleFetch();
  }, [aksaraOnly]);

  const handleSelectChange = (e: any) => {
    setSelectedLang(e.target.value);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      <main className="w-full max-w-lg">
        <header className="w-full flex justify-between items-center pb-6">
          <a href="/" className="flex items-center gap-2 bg-gray-100 p-2 px-3 rounded-lg">
            <img
              src="https://cdn.glitch.global/453b0d20-b8fc-4202-841d-a49bccee5c1e/a.png?v=1712387524665"
              alt="Logo"
              width={32}
              height={32}
            />
            <span className="font-bold hidden md:block text-xl">Rejang Dictionary</span>
          </a>
          <a href="/list" className="text-lg text-gray-600 hover:underline">
            Word List
          </a>
        </header>

        <h2 className="text-2xl font-semibold mt-4">Translate from</h2>

        <div className="flex items-center gap-2 justify-between mb-4 mt-2">
          <div className={`flex items-center gap-2 ${mode === "rejang" ? "flex-row-reverse" : ""}`}>
            {mode === "rejang" ? (
              // Dropdown untuk memilih bahasa saat mode rejang
              <select
                value={selectedLang}
                onChange={handleSelectChange}
                className="bg-gray-200 shadow-sm h-8 px-3 rounded-full font-semibold text-center"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            ) : (
              // Tombol Auto saat mode bukan rejang
              <select
                value={selectedLang}
                onChange={handleSelectChange}
                className="bg-red-400 border-none text-white h-8 px-2 rounded-full font-semibold text-center"
              >
                <option key="auto" className="bg-gray-100 border-none border-transparent text-black" value="auto">
                  Auto
                </option>
                {languages.map((lang) => (
                  <option className="bg-gray-100 border-none border-none text-black" key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            )}

            {/* Toggle Mode */}
            <div
              onClick={toggleMode}
              className={`px-6 h-8 rounded-full font-semibold text-center flex items-center justify-center cursor-pointer ${mode === "rejang" ? "bg-red-400 text-white" : "bg-gray-200 shadow-sm text-gray-700"
                }`}
            >
              Rejang
            </div>
          </div>

          <button
            onClick={toggleAksaraOnly}
            className={`cursor-pointer ${aksaraOnly ? "bg-red-400 text-white" : "bg-gray-200 text-gray-700"
              } font-semibold py-2 px-4 rounded-lg`}
          >
            Aksara
          </button>
        </div>

        <textarea
          value={inputWord}
          onChange={(e) => setInputWord(e.target.value)}
          placeholder="Write here"
          className="w-full p-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 shadow-sm focus:ring-blue-500 mb-1 resize-none h-32 bg-gray-100"
        />

        <button
          onClick={handleFetch}
          className="w-full bg-red-400 hover:bg-red-500 text-white py-3 rounded-full text-xl font-semibold cursor-pointer"
        >
          Translate
        </button>

        <div className="mt-6 mb-3">
          <h6 className="text-2xl font-semibold mb-2">Result</h6>
          <div className="p-4 rounded-lg bg-gray-100 border border-gray-200 text-gray-700 text-xl shadow-sm">{result}<br /><span className="rejang">{aksara}</span>
          </div>
        </div>

        <footer className="mt-auto text-lg text-gray-500 py-4 w-full">© 2025, Fathin</footer>
        <div className="w-full bg-indigo-400 hover:bg-indigo-500 cursor-pointer text-white text-center py-3 rounded-lg mb-4">
          <a href="https://discord.gg/HtxQZh7w6B" target="_blank" rel="noopener noreferrer" className="text-lg font-semibold">
            🎉 Join Our Discord Server!
          </a>
        </div>
      </main>
    </div>
  );
}
