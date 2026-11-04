
"use client";

import { useState } from "react";

const navigation = [
  { name: "Overview", icon: "⌂" },
  { name: "AI Operations Director", icon: "✧" },
  { name: "Clients & Events", icon: "♡" },
  { name: "Marketing Studio", icon: "✎" },
  { name: "Content Calendar", icon: "▦" },
  { name: "Approval Centre", icon: "✓" },
  { name: "Publishing Queue", icon: "⇧" },
  { name: "Settings", icon: "⚙" },
];

const activities = [
  { title: "Marketing workspace", detail: "Your content studio is ready to configure", status: "Coming next" },
  { title: "Client management", detail: "Client and event records will appear here", status: "Coming next" },
  { title: "Approval centre", detail: "Review content before anything is published", status: "Coming next" },
];

export default function Home() {
  const [active, setActive] = useState("Overview");

  return (
    <main className="min-h-screen bg-[#F7F5FA] text-[#29233B]">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col bg-[#2C2053] p-6 text-white md:flex">
          <div className="mb-10">
            <div className="text-2xl font-bold tracking-wide">
              Event<span className="text-[#C39C49]">Bliss</span>
            </div>
            <p className="mt-1 text-xs tracking-[0.2em] text-purple-200">
              AI HEADQUARTERS
            </p>
          </div>

          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-purple-300">
            Workspace
          </p>

          <nav className="flex flex-col gap-2">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => setActive(item.name)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                  active === item.name
                    ? "bg-[#C39C49] font-semibold text-[#2C2053]"
                    : "text-purple-100 hover:bg-white/10"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-xl border border-white/15 bg-white/5 p-4">
            <p className="text-sm font-semibold text-[#E4C987]">
              EventBliss HQ
            </p>
            <p className="mt-1 text-xs text-purple-200">
              Private company workspace
            </p>
            <p className="mt-3 text-xs text-purple-300">
              Development version 1.0
            </p>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E9E3F0] bg-white px-5 py-5 md:px-9">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#947A48]">
                EventBliss Company
              </p>
              <h1 className="mt-1 text-xl font-bold text-[#2C2053] md:text-2xl">
                AI Headquarters
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                Development mode
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2C2053] font-semibold text-white">
                EB
              </div>
            </div>
          </header>

          <div className="p-5 md:p-9">
            <div className="mb-8">
              <p className="text-sm text-gray-500">Your private operations workspace</p>
              <h2 className="mt-2 text-2xl font-bold text-[#2C2053] md:text-3xl">
                {active === "Overview" ? "Welcome to EventBliss HQ" : active}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                Manage your events, clients, marketing and business operations
                from one central workspace.
              </p>
            </div>

            {active === "Overview" ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: "Active Clients", value: "—", note: "Database not connected" },
                    { label: "Upcoming Events", value: "—", note: "Database not connected" },
                    { label: "Marketing Posts", value: "—", note: "Content studio pending" },
                    { label: "Pending Approvals", value: "—", note: "Approval centre pending" },
                  ].map((card) => (
                    <div key={card.label} className="rounded-2xl border border-[#ECE6F1] bg-white p-5 shadow-sm">
                      <p className="text-sm text-gray-500">{card.label}</p>
                      <p className="mt-3 text-3xl font-bold text-[#2C2053]">{card.value}</p>
                      <p className="mt-2 text-xs text-gray-400">{card.note}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 grid gap-6 xl:grid-cols-3">
                  <div className="rounded-2xl border border-[#ECE6F1] bg-white p-6 xl:col-span-2">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-[#2C2053]">AI Operations Director</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Your future AI-powered business assistant
                        </p>
                      </div>
                      <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-[#2C2053]">
                        Setup pending
                      </span>
                    </div>
                    <div className="mt-6 rounded-xl bg-[#F7F5FA] p-5">
                      <div className="mb-3 flex items-center gap-2">
                        <span className="text-xl text-[#C39C49]">✧</span>
                        <p className="font-semibold text-[#2C2053]">Operations Director</p>
                      </div>
                      <p className="text-sm leading-6 text-gray-600">
                        Your AI assistant will help prepare marketing campaigns,
                        organize event information, monitor business tasks and
                        recommend next actions. You remain in control of approvals.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#ECE6F1] bg-white p-6">
                    <h3 className="font-bold text-[#2C2053]">Workspace status</h3>
                    <div className="mt-5 space-y-4">
                      {[
                        "Next.js application",
                        "Private GitHub repository",
                        "Database integration",
                        "Secure authentication",
                        "AI integration",
                      ].map((item, index) => (
                        <div key={item} className="flex items-center justify-between gap-2 text-sm">
                          <span className="text-gray-600">{item}</span>
                          <span className={`text-xs font-medium ${index < 2 ? "text-green-700" : "text-amber-700"}`}>
                            {index < 2 ? "Ready" : "Pending"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 rounded-2xl border border-[#ECE6F1] bg-white p-6">
                  <h3 className="font-bold text-[#2C2053]">Your workspace modules</h3>
                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    {activities.map((item) => (
                      <div key={item.title} className="rounded-xl bg-[#F7F5FA] p-4">
                        <h4 className="font-semibold text-[#2C2053]">{item.title}</h4>
                        <p className="mt-2 text-sm leading-5 text-gray-500">{item.detail}</p>
                        <p className="mt-4 text-xs font-semibold text-[#947A48]">{item.status}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-[#ECE6F1] bg-white p-8 shadow-sm">
                <div className="text-3xl text-[#C39C49]">✧</div>
                <h3 className="mt-4 text-xl font-bold text-[#2C2053]">{active}</h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
                  This module is part of the EventBliss AI HQ development plan.
                  We will build and connect its features in upcoming steps.
                </p>
                <p className="mt-5 inline-block rounded-full bg-amber-50 px-4 py-2 text-xs font-medium text-amber-800">
                  Not configured yet
                </p>
              </div>
            )}

            <footer className="mt-10 border-t border-[#E9E3F0] pt-5 text-xs text-gray-400">
              © 2026 EventBliss Company · Private AI Headquarters
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}
