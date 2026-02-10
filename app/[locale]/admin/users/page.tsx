"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  IoSearch,
  IoTrash,
  IoShieldCheckmark,
  IoShieldOutline,
  IoPeople,
} from "react-icons/io5";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 10;

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let query = supabase.from("profiles").select("*", { count: "exact" });

      if (search) {
        query = query.or(
          `full_name.ilike.%${search}%,username.ilike.%${search}%,email.ilike.%${search}%`,
        );
      }

      const from = (page - 1) * LIMIT;
      const to = from + LIMIT - 1;

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      setUsers(data || []);
      if (count) {
        setTotalPages(Math.ceil(count / LIMIT));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (
    id: string,
    currentRole: string,
    name: string,
  ) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const action = newRole === "admin" ? "Jadikan Admin" : "Hapus Admin";

    // Prevent removing own admin status if fetching current user ID is possible,
    // but for now relying on backend policies or just warning.
    // Actually, let's verify if current user is the one being modified using session email
    // (since we don't have id in session easily available without checking).

    // Simple check:
    if (session?.user?.email) {
      // We'd need to know if 'id' matches current user.
      // We can check if email matches (if we fetched email in profiles, but profiles might not have email depending on schema).
      // 'profiles' usually has 'id' matching auth.uid.
      // We can't easily check auth.uid from session here without extra logic.
      // For now, simpler: Just confirm.
    }

    const result = await Swal.fire({
      title: `${action}?`,
      text: `Anda yakin ingin mengubah status ${name} menjadi ${newRole}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Ubah",
    });

    if (result.isConfirmed) {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", id);

      if (error) {
        Swal.fire("Gagal", error.message, "error");
      } else {
        Swal.fire("Berhasil", `Role user diubah menjadi ${newRole}`, "success");
        fetchUsers();
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    // Warning: This only deletes the profile.
    const result = await Swal.fire({
      title: "Hapus User?",
      text: `Hapus profil "${name}"? Akun login mungkin masih ada, tapi data profil akan hilang.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus!",
    });

    if (result.isConfirmed) {
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) {
        Swal.fire("Gagal", error.message, "error");
      } else {
        Swal.fire("Berhasil", "User berhasil dihapus", "success");
        fetchUsers();
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Kelola Pengguna
      </h1>

      <Card>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative max-w-md">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama, username, atau email..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold">
              <tr>
                <th className="px-6 py-3">Nama</th>
                <th className="px-6 py-3">Username</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center">
                    Tidak ada user ditemukan.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                            {(user.full_name || user.username || "?")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {user.full_name || "No Name"}
                      </span>
                    </td>
                    <td className="px-6 py-4">@{user.username || "-"}</td>
                    <td className="px-6 py-4">
                      {user.role === "admin" ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 font-bold flex items-center w-fit gap-1">
                          <IoShieldCheckmark className="w-3 h-3" /> Admin
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 flex items-center w-fit gap-1">
                          <IoPeople className="w-3 h-3" /> User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() =>
                          handleToggleRole(
                            user.id,
                            user.role,
                            user.full_name || user.username,
                          )
                        }
                        className={`p-2 rounded-lg transition-colors ${
                          user.role === "admin"
                            ? "text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                            : "text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                        }`}
                        title={
                          user.role === "admin"
                            ? "Hapus Admin"
                            : "Jadikan Admin"
                        }
                      >
                        {user.role === "admin" ? (
                          <IoShieldOutline className="w-5 h-5" />
                        ) : (
                          <IoShieldCheckmark className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(user.id, user.full_name || user.username)
                        }
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Hapus User"
                      >
                        <IoTrash className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-center gap-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 text-sm font-medium">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
