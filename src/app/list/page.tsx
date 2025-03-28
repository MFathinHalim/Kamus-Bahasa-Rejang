"use client";
import { useEffect, useState, useRef } from "react";
import axios from "axios";

export default function DataListPage() {
  const [Datas, setDatas] = useState<Data[]>([]);
  const [page, setPage] = useState<number>(1);
  const limit = 5;
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [token, setToken] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [editData, setEditData] = useState<Data | null>(null);
  const [newIndonesia, setNewIndonesia] = useState<string>("");
  const [newRejang, setNewRejang] = useState<string>("");
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchDatas = async (newPage: number) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/word/list?page=${newPage}&limit=${limit}`);
      const newDatas: Data[] = response.data.posts;
      setDatas((prevDatas) => [...prevDatas, ...newDatas]);
      setHasMore(newDatas.length > 0);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch Data list:", error);
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
      if (!response.ok) return;
      const data = await response.json();
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
        if (!response.ok) return;
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
    fetchDatas(page);
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

  const handleAddData = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/word/add", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: new URLSearchParams({ Indonesia: newIndonesia, Rejang: newRejang }),
      });
      if (response.ok) {
        const newData = await response.json();
        setNewIndonesia("");
        setNewRejang("");
      }
    } catch (error) {
      console.error("Failed to add Data:", error);
    }
  };

  const handleEditData = async () => {
    if (!editData) return;
    try {
      const response = await fetch(`/api/word/edit/${editData._id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: new URLSearchParams({ Indonesia: editData.Indonesia, Rejang: editData.Rejang }),
      });
      if (response.ok) {
        const updatedData = await response.json();
        setDatas((prevDatas) =>
          prevDatas.map((Data) => (Data._id === updatedData._id ? updatedData : Data))
        );
        setEditData(null);
      }
    } catch (error) {
      console.error("Failed to edit Data:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <main className="w-full max-w-lg rounded-lg">
        <header className="w-full flex justify-between items-center pb-6">
          <a href="/" className="flex items-center gap-2 bg-gray-200 p-2 px-3 rounded-lg">
            <img
              src="https://cdn.glitch.global/453b0d20-b8fc-4202-841d-a49bccee5c1e/a.png?v=1712387524665"
              alt="Logo"
              width={32}
              height={32}
            />
            <span className="font-bold hidden md:block text-xl">Rejang Dictionary</span>
          </a>
        </header>
        <h1 className="text-2xl font-bold mb-6 text-center">Word List</h1>

        <form onSubmit={handleAddData} className="mb-6 flex w-full gap-2">
          <input
            type="text"
            placeholder="Indonesia"
            value={newIndonesia}
            onChange={(e) => setNewIndonesia(e.target.value)}
            className="p-2 bg-gray-100 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Rejang"
            value={newRejang}
            onChange={(e) => setNewRejang(e.target.value)}
            className="p-2 bg-gray-100 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {user ? (
            <button type="submit" className="p-2 bg-red-400 text-white rounded-lg shadow-md hover:bg-red-500">
              Add
            </button>
          ) : (
            <a href="/user/login" className="p-2 bg-red-400 text-white rounded-lg shadow-md hover:bg-blue-500">
              Login
            </a>
          )}
        </form>

        {Datas.map((Data, index) => (
          <div
            className="grid grid-cols-2 gap-4 py-4 mt-2 text-center rounded-lg bg-gray-100 shadow-md hover:shadow-lg cursor-pointer"
            key={index}
            onClick={() => user && setEditData(Data)}
          >
            <div>{Data.Indonesia}</div>
            <div>{Data.Rejang}</div>
          </div>
        ))}
        {loading && <p className="mt-4 text-center">Loading more data...</p>}
        {hasMore && <div ref={bottomRef} className="h-10 w-full" />}

        {user && editData && (
          <div className="fixed top-0 left-0 w-full h-full bg-black/20 backdrop-blur-sm flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-xl font-bold mb-4">Edit Kata</h2>
              <input
                type="text"
                value={editData.Indonesia}
                onChange={(e) => setEditData({ ...editData, Indonesia: e.target.value })}
                className="p-2 border rounded-lg w-full mb-2 focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={editData.Rejang}
                onChange={(e) => setEditData({ ...editData, Rejang: e.target.value })}
                className="p-2 border rounded-lg w-full mb-4 focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleEditData}
                  className="p-2 bg-green-400 text-white rounded-full px-5 shadow-md hover:bg-green-500"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditData(null)}
                  className="p-2 bg-red-400 text-white rounded-full px-5 shadow-md hover:bg-red-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
