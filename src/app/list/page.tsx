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
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const fetchDatas = async (newPage: number) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/word/list?page=${newPage}&limit=${limit}`,
      );
      const newDatas: Data[] = response.data.posts;
      setDatas((prev) => [...prev, ...newDatas]);
      setHasMore(newDatas.length > 0);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch Data list:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatas(page);
  }, [page]);

  useEffect(() => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prev) => prev + 1);
      }
    });

    if (bottomRef.current) observer.current.observe(bottomRef.current);

    return () => observer.current?.disconnect();
  }, [hasMore]);

  const handleAddData = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/word/add", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: new URLSearchParams({
          Indonesia: newIndonesia,
          Rejang: newRejang,
        }),
      });

      if (response.ok) {
        const newData = await response.json();
        setDatas((prev) => [newData, ...prev]);
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
        body: new URLSearchParams({
          Indonesia: editData.Indonesia,
          Rejang: editData.Rejang,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setDatas((prev) =>
          prev.map((d) => (d._id === updated._id ? updated : d)),
        );
        setEditData(null);
      }
    } catch (error) {
      console.error("Failed to edit Data:", error);
    }
  };

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
      setUser(userData);
    };

    init();
  }, []);
  useEffect(() => {
    refreshAccessToken();
  }, []);

  return (
    <div className="min-h-screen bg-[#f3f3f3] px-6 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold bg-gray-200 inline-block px-8 py-3 rounded-xl">
            Kamus Rejang
          </h1>
        </div>

        {/* Add Form */}
        <form
          onSubmit={handleAddData}
          className="grid md:grid-cols-3 gap-4 mb-10"
        >
          <input
            type="text"
            placeholder="Indonesia"
            value={newIndonesia}
            onChange={(e) => setNewIndonesia(e.target.value)}
            className="p-4 rounded-xl bg-gray-200 text-lg focus:outline-none"
          />
          <input
            type="text"
            placeholder="Rejang"
            value={newRejang}
            onChange={(e) => setNewRejang(e.target.value)}
            className="p-4 rounded-xl bg-gray-200 text-lg focus:outline-none"
          />

          {user ? (
            <button className="bg-red-400 text-white rounded-xl text-lg font-semibold hover:bg-red-500">
              Add Word
            </button>
          ) : (
            <a
              href="/user/login"
              className="bg-red-400 text-white rounded-xl text-lg font-semibold flex items-center justify-center"
            >
              Login
            </a>
          )}
        </form>

        {/* Word Cards */}
        <div className="space-y-4">
          {Datas.map((Data) => (
            <div
              key={Data._id}
              onClick={() => user && setEditData(Data)}
              className="grid grid-cols-2 gap-6 p-6 rounded-xl bg-gray-200 hover:shadow-lg transition cursor-pointer text-lg"
            >
              <div>{Data.Indonesia}</div>
              <div className="font-semibold">{Data.Rejang}</div>
            </div>
          ))}
        </div>

        {loading && (
          <p className="text-center mt-6 text-gray-600">Loading more data...</p>
        )}

        {hasMore && <div ref={bottomRef} className="h-10 w-full" />}
      </div>

      {/* Edit Modal */}
      {user && editData && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Edit Word
            </h2>

            <input
              type="text"
              value={editData.Indonesia}
              onChange={(e) =>
                setEditData({ ...editData, Indonesia: e.target.value })
              }
              className="w-full p-4 rounded-xl bg-gray-200 mb-4"
            />

            <input
              type="text"
              value={editData.Rejang}
              onChange={(e) =>
                setEditData({ ...editData, Rejang: e.target.value })
              }
              className="w-full p-4 rounded-xl bg-gray-200 mb-6"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={handleEditData}
                className="bg-red-400 text-white px-6 py-2 rounded-full"
              >
                Save
              </button>
              <button
                onClick={() => setEditData(null)}
                className="bg-gray-300 px-6 py-2 rounded-full"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
