"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    const { error: resetError } =
      await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo:
          `${window.location.origin}/auth/callback?next=/reset-password`,
      });

    if (resetError) {
      setError(resetError.message);
    } else {
      setMessage(
        "If your account exists, a password recovery email has been sent. Check your inbox."
      );
    }

    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#2C2053] px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#2C2053]">
            EventBliss
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Reset your administrator password
          </p>

          <div className="mx-auto mt-5 h-1 w-20 rounded-full bg-[#C39C49]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Company Email
            </label>

            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your administrator email"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#C39C49]"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {message && (
            <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#2C2053] py-3 font-semibold text-white hover:bg-[#3b2c6d] disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Recovery Email"}
          </button>
        </form>
      </div>
    </main>
  );
}