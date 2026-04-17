"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AppHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
    window.location.href = "/login";
  };

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold text-slate-900">
          Movie Booking
        </Link>

        <nav className="flex items-center gap-4 text-sm text-slate-600">
          <Link href="/movies">Movies</Link>
          <Link href="/cinemas">Cinemas</Link>
          <Link href="/admin">Admin</Link>

          {isLoggedIn ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-slate-900 px-3 py-2 text-white"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-slate-900 px-3 py-2 text-white"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}