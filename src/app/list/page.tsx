"use client"
import { useEffect, useState, useRef } from "react";
import axios from "axios";

interface Word {
  id: string;
  indonesia: string;
  rejang: string;
}

export default function WordListPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [page, setPage] = useState<number>(1);
  const limit = 5; // Menampilkan 5 kata per halaman
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [token, setToken] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [editWord, setEditWord] = useState<Word | null>(null);
  const [newIndonesia, setNewIndonesia] = useState<string>("");
  const [newRejang, setNewRejang] = useState<string>("");
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchWords = async (newPage: number) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/word/list?page=${newPage}&limit=${limit}`);
      const newWords: Word[] = response.data.posts;

      setWords((prevWords) => [...prevWords, ...newWords]);
      setHasMore(newWords.length > 0);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch word list:", error);
      setLoading(false);
    }
  };

  const refreshAccessToken = async () => {
    try {
      if (sessionStorage.getItem("token")) {
        return sessionStorage.getItem("token");
      }

      const response = await fetch("/api/user/session/token/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) return (window.location.href = "/");

      const data = await response.json();
      if (!data.token) return (window.location.href = "/");
      sessionStorage.setItem("token", data.token);
      return data.token;
    } catch (error) {
      console.error("Error refreshing access token:", error);
      return null;
    }
  };

  useEffect(() => {
    async function fetchUserData() {
      try {
        const tokenTemp = await refreshAccessToken();
        if (!tokenTemp) return;
        setToken(tokenTemp);

        const response = await fetch(`/api/user/session/token/check`, {
          method: "POST",
          headers: { Authorization: `Bearer ${tokenTemp}` },
        });

        if (!response.ok) window.location.href = "/user/login";

        const check = await response.json();
        setUser(check);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUser(null);
      }
    }

    if (user === null) fetchUserData();
  }, [user]);

  useEffect(() => {
    fetchWords(page);
  }, [page]);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prevPage) => prevPage + 1);
      }
    });

    if (bottomRef.current) {
      observer.current.observe(bottomRef.current);
    }

    return () => {
      if (observer.current && bottomRef.current) {
        observer.current.unobserve(bottomRef.current);
      }
    };
  }, [hasMore]);

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/word/add", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: new URLSearchParams({ Indonesia: newIndonesia, Rejang: newRejang }),
      });

      if (response.ok) {
        const newWord = await response.json();
        setWords([newWord.post, ...words]);
        setNewIndonesia("");
        setNewRejang("");
      }
    } catch (error) {
      console.error("Failed to add word:", error);
    }
  };

  const handleEditWord = async () => {
    if (!editWord) return;

    try {
      const response = await fetch(`/api/word/edit/${editWord.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: new URLSearchParams({ Indonesia: editWord.indonesia, Rejang: editWord.rejang }),
      });

      if (response.ok) {
        const updatedWord = await response.json();
        setWords((prevWords) =>
          prevWords.map((word) => (word.id === updatedWord.id ? updatedWord : word))
        );
        setEditWord(null);
      }
    } catch (error) {
      console.error("Failed to edit word:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold mb-6">DAFTAR KATA</h1>

      <form onSubmit={handleAddWord} className="mb-4">
        <input
          type="text"
          placeholder="Indonesia"
          value={newIndonesia}
          onChange={(e) => setNewIndonesia(e.target.value)}
          className="p-2 border rounded mr-2"
        />
        <input
          type="text"
          placeholder="Rejang"
          value={newRejang}
          onChange={(e) => setNewRejang(e.target.value)}
          className="p-2 border rounded mr-2"
        />
        <button type="submit" className="p-2 bg-blue-500 text-white rounded">
          Add
        </button>
      </form>

      <div className="grid grid-cols-2 gap-4 text-center w-full max-w-lg">
        <span className="font-bold">Indonesia</span>
        <span className="font-bold">Rejang</span>

        {words.map((word, index) => (
          <div key={index} onClick={() => setEditWord(word)}>
            <div className="bg-gray-200 rounded-lg p-4">{word.indonesia}</div>
            <div className="bg-gray-200 rounded-lg p-4">{word.rejang}</div>
          </div>
        ))}
      </div>

      {loading && <p className="mt-4">Loading more words...</p>}
      {hasMore && <div ref={bottomRef} className="h-10 w-full" />}

      {editWord && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Edit Word</h2>
            <input
              type="text"
              value={editWord.indonesia}
              onChange={(e) => setEditWord({ ...editWord, indonesia: e.target.value })}
              className="p-2 border rounded w-full mb-2"
            />
            <input
              type="text"
              value={editWord.rejang}
              onChange={(e) => setEditWord({ ...editWord, rejang: e.target.value })}
              className="p-2 border rounded w-full mb-4"
            />
            <button
              onClick={handleEditWord}
              className="p-2 bg-green-500 text-white rounded mr-2"
            >
              Save
            </button>
            <button
              onClick={() => setEditWord(null)}
              className="p-2 bg-red-500 text-white rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}