"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const EVENTBLISS_LOGO = "https://eventbliss.ca/assets/eventbliss-logo.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setError("Please enter your company email and password.");
      setLoading(false);
      return;
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    window.location.replace("/");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#2C2053] px-4 py-10">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full border border-[#C39C49]/20" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-36 -right-24 h-96 w-96 rounded-full border border-[#C39C49]/20" />

      <div className="relative w-full max-w-md rounded-3xl border border-[#C39C49]/30 bg-white p-8 shadow-2xl sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-2xl border border-[#C39C49]/30 bg-[#FBFAFD] p-3 shadow-sm">
            {!logoFailed ? (
              <img
                src={EVENTBLISS_LOGO}
                alt="EventBliss logo"
                className="max-h-full max-w-full object-contain"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <span className="font-serif text-3xl font-bold text-[#2C2053]">EB</span>
            )}
          </div>

          <h1 className="font-serif text-3xl font-bold tracking-wide text-[#2C2053]">
            EventBliss AI
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Your private event management workspace
          </p>
          <div className="mx-auto mt-5 h-1 w-20 rounded-full bg-[#C39C49]" />
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-[#2C2053]"
            >
              Company Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your company email"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-800 outline-none transition focus:border-[#C39C49] focus:ring-2 focus:ring-[#C39C49]/20"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-[#2C2053]"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-800 outline-none transition focus:border-[#C39C49] focus:ring-2 focus:ring-[#C39C49]/20"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#2C2053] py-3.5 font-semibold text-white transition hover:bg-[#40316F] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In to EventBliss AI"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-gray-400">
          © {year ?? ""} EventBliss · Private Internal System
        </p>
      </div>
    </main>
  );
}
