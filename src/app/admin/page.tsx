"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [words, setWords] = useState<any>([]);
  const [token, setToken] = useState("");
  const [toggleAdminList, setToggleAdminList] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

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
      if (!tokenTemp) return router.push("/");

      setToken(tokenTemp);

      const res = await fetch("/api/user/session/token/check", {
        method: "POST",
        headers: { Authorization: `Bearer ${tokenTemp}` },
      });

      if (!res.ok) return router.push("/");

      const userData = await res.json();
      if (!userData.atmin) return router.push("/");

      setUser(userData);
      fetchWordList(tokenTemp, 1);
    };

    init();
  }, []);

  useEffect(() => {
    if (token) fetchWordList(token, 1);
  }, [toggleAdminList]);

  const fetchWordList = async (tokenTemp: string, pageNumber: number) => {
    setIsLoading(true);
    const endpoint = toggleAdminList
      ? `/api/word/list/ongoing?page=${pageNumber}`
      : `/api/word/list?page=${pageNumber}`;
    const response = await fetch(endpoint, {
      method: "GET",
      headers: { Authorization: `Bearer ${tokenTemp}` },
    });

    if (response.ok) {
      const data = await response.json();
      setWords((prev: any) => [...prev, ...data.posts]);
      setHasMore(data.posts.length > 0);
    } else {
      setErrorMessage("Failed to fetch word list. Please try again later.");
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(
      `/api/word/remove/${id}?ongoing=${toggleAdminList}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (res.ok) setWords((prev: any) => prev.filter((w: any) => w._id !== id));
  };

  const handleAccept = async (id: string) => {
    const res = await fetch(`/api/word/accept/${id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setWords((prev: any) => prev.filter((w: any) => w._id !== id));
  };

  const toggleList = () => {
    setToggleAdminList((p) => !p);
    setWords([]);
    setPage(1);
  };

  const lastWordRef = (node: any) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) setPage((p) => p + 1);
    });
    if (node) observer.current.observe(node);
  };

  useEffect(() => {
    if (page > 1) fetchWordList(token, page);
  }, [page]);

  return (
    <div className="min-h-screen bg-[#f3f3f3] px-6 py-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <header className="flex justify-between items-center mb-8">
          <a
            href="/"
            className="flex items-center gap-2 bg-red-400 p-3 rounded-xl shadow-md text-white font-bold text-lg"
          >
            Kamus Bahasa Rejang
          </a>
          <button
            onClick={toggleList}
            className={`px-6 py-3 rounded-full font-semibold transition ${
              toggleAdminList
                ? "bg-red-400 text-white"
                : "bg-gray-300 text-gray-700"
            }`}
          >
            {toggleAdminList
              ? "Tampilkan Public List"
              : "Tampilkan Ongoing List"}
          </button>
        </header>

        {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}

        <div className="flex flex-col gap-4">
          {words.length === 0 && !isLoading && (
            <p className="text-gray-400 text-center">
              Tidak ada kata ditemukan.
            </p>
          )}

          {words.map((word: any, index: number) => (
            <div
              key={word._id}
              ref={index === words.length - 1 ? lastWordRef : null}
              className="bg-white p-6 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center"
            >
              <p className="text-lg font-semibold mb-2 md:mb-0">
                {word.Indonesia} - {word.Rejang}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(word._id)}
                  className="bg-red-400 hover:bg-red-500 text-white px-4 py-2 rounded-full font-semibold"
                >
                  Hapus
                </button>
                {toggleAdminList && (
                  <button
                    onClick={() => handleAccept(word._id)}
                    className="bg-green-400 hover:bg-green-500 text-white px-4 py-2 rounded-full font-semibold"
                  >
                    Terima
                  </button>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <p className="text-gray-400 text-center">Memuat kata...</p>
          )}
        </div>
      </div>
    </div>
  );
}
