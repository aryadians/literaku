"use client";

import { useState, useEffect } from "react";
import { IoAdd, IoList, IoCheckmark } from "react-icons/io5";
import Swal from "sweetalert2";

export function AddToCollectionButton({ bookId }: { bookId: string }) {
  const [collections, setCollections] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCollections = async () => {
    try {
      const res = await fetch("/api/collections");
      if (res.ok) {
        const data = await res.json();
        setCollections(data.collections);
      }
    } catch (e) {
      console.error("Failed to fetch collections");
    }
  };

  const addToCollection = async (collectionId: string, collectionName: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/collections/${collectionId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_id: bookId }),
      });

      if (res.ok) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: `Ditambahkan ke ${collectionName}`,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (e) {
      Swal.fire("Gagal", "Terjadi kesalahan", "error");
    } finally {
      setIsLoading(false);
      setShowDropdown(false);
    }
  };

  const createNewCollection = async () => {
    const { value: name } = await Swal.fire({
      title: "Playlist Baru",
      input: "text",
      inputLabel: "Nama Playlist",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
    });

    if (name) {
      try {
        const res = await fetch("/api/collections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        if (res.ok) {
          const newCol = await res.json();
          setCollections([...collections, newCol]);
          addToCollection(newCol.id, newCol.name);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!showDropdown) fetchCollections();
          setShowDropdown(!showDropdown);
        }}
        className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all"
        title="Tambah ke Playlist"
      >
        <IoAdd size={20} />
      </button>

      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)} 
          />
          <div className="absolute right-0 bottom-full mb-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden py-2">
            <div className="px-4 py-2 border-b border-gray-50 dark:border-gray-700">
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Pilih Playlist</p>
            </div>
            
            <div className="max-h-48 overflow-y-auto">
              {collections.length === 0 ? (
                <p className="px-4 py-3 text-xs text-gray-500 italic">Belum ada playlist</p>
              ) : (
                collections.map((col) => (
                  <button
                    key={col.id}
                    onClick={(e) => {
                      e.preventDefault();
                      addToCollection(col.id, col.name);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-brand-50 dark:hover:bg-brand-900/20 text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2 transition-colors"
                  >
                    <IoList className="text-gray-400" />
                    <span className="truncate">{col.name}</span>
                  </button>
                ))
              )}
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                createNewCollection();
              }}
              className="w-full text-left px-4 py-2.5 mt-1 border-t border-gray-50 dark:border-gray-700 text-brand-600 dark:text-brand-400 text-xs font-black uppercase tracking-widest hover:bg-brand-50 dark:hover:bg-brand-900/10 flex items-center gap-2"
            >
              <IoAdd /> Buat Baru
            </button>
          </div>
        </>
      )}
    </div>
  );
}
