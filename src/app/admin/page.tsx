"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [words, setWords] = useState([]);
  const [token, setToken] = useState("");
  const [toggleAdminList, setToggleAdminList] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState(1); // Menyimpan nomor halaman untuk pagination
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); // Untuk mengecek apakah masih ada data
  const observer = useRef(0); // Untuk intersection observer
  const router = useRouter();

  const refreshAccessToken = async () => {
    try {
      const response = await fetch("/api/user/session/token/refresh", {
        method: "POST",
        credentials: "include",
      });

      //if (!response.ok) return router.push("/");

      const data = await response.json();
      //if (!data.token) return router.push("/");

      setToken(data.token);
      fetchWordList(data.token, 1); // Fetch awal dengan halaman 1
    } catch (error) {
      console.error("Error refreshing access token:", error);
      //router.push("/");
    }
  };

  useEffect(() => {
    refreshAccessToken();
  }, []);

  const fetchWordList = async (tokenTemp: string, pageNumber: number) => {
    const endpoint = toggleAdminList
      ? `/api/word/list/ongoing?page=${pageNumber}`
      : `/api/word/list?page=${pageNumber}`;

    setIsLoading(true);
    const response = await fetch(endpoint, {
      method: "GET",
      headers: { Authorization: `Bearer ${tokenTemp}` },
    });

    if (response.ok) {
      const data = await response.json();
      //@ts-ignore
      setWords((prevWords) => [...prevWords, ...data.posts]);
      setHasMore(data.posts.length > 0); // Jika tidak ada data lagi, stop infinite scroll
    } else {
      setErrorMessage("Failed to fetch word list. Please try again later.");
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    const response = await fetch(`/api/word/remove/${id}?ongoing=${toggleAdminList}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      setWords((prevWords) => prevWords.filter((word: Data) => word._id !== id));
    } else {
      console.error("Failed to delete the word.");
    }
  };

  const handleAccept = async (id: string) => {
    const response = await fetch(`/api/word/accept/${id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      setWords((prevWords) => prevWords.filter((word: Data) => word._id !== id));
    } else {
      console.error("Failed to accept the word.");
    }
  };


  const toggleList = async () => {
    setToggleAdminList((prev) => !prev); // Toggle daftar admin/public
    setWords([]); // Reset daftar kata
    setPage(1); // Reset halaman
  };

  useEffect(() => {
    if (token) fetchWordList(token, 1); // Fetch ulang daftar kata awal setelah toggle
  }, [toggleAdminList]); // Akan berjalan setiap kali toggle berubah


  // Infinite Scroll menggunakan Intersection Observer
  const lastWordRef = (node: any) => {
    if (isLoading) return;
    //@ts-ignore
    if (observer.current) observer.current.disconnect();
    //@ts-ignore
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prevPage) => prevPage + 1);
      }
    });
    //@ts-ignore
    if (node) observer.current.observe(node);
  };

  useEffect(() => {
    if (page > 1) fetchWordList(token, page); // Fetch daftar kata berikutnya saat page bertambah
  }, [page]);

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
        
      <div className="w-full max-w-lg">
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
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Page</h2>
        <button
          onClick={toggleList}
          className={`w-full py-2 rounded-full font-semibold mb-4 ${
            toggleAdminList ? "bg-red-400 hover:bg-red-400 text-white" : "bg-gray-300 text-gray-700"
          }`}
        >
          {toggleAdminList ? "Tampilkan Public List" : "Tampilkan Ongoing List"}
        </button>
      </div>

      <main className="w-full max-w-lg">
        {errorMessage && <p className="text-red-400">{errorMessage}</p>}
        {words.length === 0 && !isLoading && <p className="text-gray-400">Tidak ada kata ditemukan.</p>}

        {words.map((word: Data, index) => (
          <div
            key={word._id}
            ref={index === words.length - 1 ? lastWordRef : null} // Tambahkan ref ke kata terakhir
            className="p-4 mb-4 rounded-lg bg-gray-100"
          >
            <p className="text-lg font-medium text-gray-700 mb-2">
              {word.Indonesia} - {word.Rejang}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleDelete(word._id)}
                className="bg-red-400 hover:bg-red-500 text-white py-2 px-4 rounded-lg font-semibold"
              >
                Hapus
              </button>
              {toggleAdminList && (
                <button
                  onClick={() => handleAccept(word._id)}
                  className="bg-green-400 hover:bg-green-500 text-white py-2 px-4 rounded-lg font-semibold"
                >
                  Terima
                </button>
              )}
            </div>
          </div>
        ))}

        {isLoading && <p className="text-center text-gray-400">Memuat kata...</p>}
      </main>

      <footer className="mt-auto text-gray-400 py-4 w-full text-center">
        © 2025, Admin Page by Fathin
      </footer>
    </div>
  );
}
