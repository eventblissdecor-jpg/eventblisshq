"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type CampaignPost = {
  title: string;
  caption: string;
  topic: string;
  date: string;
};

const topics = [
  {
    topic: "Wedding Inspiration",
    title: "Your dream wedding deserves beautiful planning",
    caption:
      "Every love story deserves a beautiful celebration. From the first idea to the final details, EventBliss helps bring your wedding vision to life.\n\nLet us help you create a day filled with meaningful moments, thoughtful details and unforgettable memories.\n\nContact EventBliss to start planning your celebration.\n\n#EventBliss #WeddingPlanning #KamloopsWeddings #WeddingInspiration",
  },
  {
    topic: "Event Planning Tips",
    title: "Planning an event? Start with these simple steps",
    caption:
      "Every successful event begins with a thoughtful plan.\n\nHere are three things to consider:\n\n1. Decide what you are celebrating.\n2. Set your budget and estimate your guest count.\n3. Choose a style and atmosphere that reflects your vision.\n\nNeed help bringing everything together? EventBliss is here to help.\n\n#EventBliss #EventPlanningTips #KamloopsEvents #EventPlanning",
  },
  {
    topic: "Décor and Styling",
    title: "Beautiful details make unforgettable celebrations",
    caption:
      "The right décor creates an atmosphere your guests will remember.\n\nFrom elegant styling to carefully selected details, EventBliss brings your event vision together with thoughtful planning and creativity.\n\nLet's create something beautiful.\n\n#EventBliss #EventDecor #EventStyling #Kamloops",
  },
];

const fieldClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#C39C49]";

const primaryButton =
  "rounded-xl bg-[#2C2053] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#40316f] disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButton =
  "rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-[#C39C49]";

function getNextMonday() {
  const date = new Date();
  date.setHours(12, 0, 0, 0);

  const day = date.getDay();
  const daysUntilMonday = day === 1 ? 7 : (8 - day) % 7;

  date.setDate(date.getDate() + daysUntilMonday);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function addDays(dateString: string, days: number) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + days);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatDate(dateString: string) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function MarketingManagerPage() {
  const [weekStart, setWeekStart] = useState(getNextMonday);
  const [campaignDetail, setCampaignDetail] = useState("");
  const [platforms, setPlatforms] = useState([
    "Instagram",
    "Facebook",
  ]);

  const [campaignPosts, setCampaignPosts] = useState<CampaignPost[]>([]);
  const [generated, setGenerated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function togglePlatform(platform: string) {
    setPlatforms((previous) =>
      previous.includes(platform)
        ? previous.filter((item) => item !== platform)
        : [...previous, platform]
    );
  }

  function generateWeeklyPlan() {
    setMessage("");
    setError("");

    if (!weekStart) {
      setError("Please select the Monday starting your campaign week.");
      return;
    }

    if (platforms.length === 0) {
      setError("Please select at least one social media platform.");
      return;
    }

    const postingDays = [1, 3, 5];

    const generatedPosts = topics.map((item, index) => {
      const date = addDays(weekStart, postingDays[index]);

      const extraDetails = campaignDetail.trim()
        ? `\n\nCampaign details: ${campaignDetail.trim()}`
        : "";

      return {
        topic: item.topic,
        title: item.title,
        caption: `${item.caption}${extraDetails}`,
        date,
      };
    });

    setCampaignPosts(generatedPosts);
    setGenerated(true);
    setMessage("Your weekly marketing plan is ready to review.");
  }

  async function saveWeeklyPlan() {
    if (campaignPosts.length !== 3) {
      setError("Please generate your weekly plan first.");
      return;
    }

    if (platforms.length === 0) {
      setError("Please select at least one platform.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    const records = campaignPosts.map((post) => ({
      title: post.title,
      caption: post.caption,
      platform: platforms,
      content_type: "post",
      status: "pending_approval",
      scheduled_at: new Date(`${post.date}T10:00:00`).toISOString(),
      design_data: {
        template: "royal",
        format: "square",
        headline: post.title,
        subtitle: "Thoughtfully planned. Beautifully celebrated.",
        brand: "EventBliss",
      },
    }));

    const { error: saveError } = await supabase
      .from("marketing_posts")
      .insert(records);

    setSaving(false);

    if (saveError) {
      setError(`Could not save your campaign: ${saveError.message}`);
      return;
    }

    setMessage(
      "Success! All 3 posts have been saved as Pending Approval. Review them in your Approval Centre."
    );

    setCampaignPosts([]);
    setGenerated(false);
    setCampaignDetail("");
  }

  return (
    <main className="min-h-screen bg-[#F7F5FA] px-4 py-6 text-gray-800 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C39C49]">
              EventBliss Company
            </p>

            <h1 className="mt-2 font-serif text-3xl font-bold text-[#2C2053] sm:text-4xl">
              AI Marketing Manager
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Plan your weekly social media campaigns.
            </p>
          </div>

          <a href="/" className={secondaryButton}>
            ← Back to Dashboard
          </a>
        </div>

        {/* INTRODUCTION */}

        <section className="rounded-2xl bg-[#2C2053] p-6 text-white shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C39C49]">
            Weekly Campaign Planner
          </p>

          <h2 className="mt-3 font-serif text-2xl font-semibold sm:text-3xl">
            Stay visible. Stay connected. Grow beautifully.
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">
            Prepare three social media posts every week for EventBliss.
            Review the captions, customize your campaign details and
            send everything to your approval workflow.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { day: "Tuesday", purpose: "Inspiration" },
              { day: "Thursday", purpose: "Helpful content" },
              { day: "Saturday", purpose: "Brand promotion" },
            ].map((item) => (
              <div
                key={item.day}
                className="rounded-xl border border-white/15 bg-white/10 p-4"
              >
                <p className="font-semibold text-[#E7D4A5]">
                  {item.day}
                </p>
                <p className="mt-1 text-xs text-white/70">
                  {item.purpose}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* MESSAGES */}

        {message && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* CAMPAIGN SETTINGS */}

        <section className="mt-7 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-[#2C2053]">
            1. Campaign Settings
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Choose your campaign week and the platforms you want to target.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-gray-700">
                Week starting Monday
              </span>

              <input
                type="date"
                className={fieldClass}
                value={weekStart}
                onChange={(event) => {
                  setWeekStart(event.target.value);
                  setGenerated(false);
                  setCampaignPosts([]);
                }}
              />
            </label>

            <div>
              <p className="mb-3 text-sm font-medium text-gray-700">
                Social media platforms
              </p>

              <div className="flex flex-wrap gap-3">
                {["Instagram", "Facebook"].map((platform) => (
                  <label
                    key={platform}
                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={platforms.includes(platform)}
                      onChange={() => togglePlatform(platform)}
                      className="accent-[#2C2053]"
                    />

                    {platform}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <label className="mt-6 block space-y-2">
            <span className="text-sm font-medium text-gray-700">
              Campaign details or special offers (optional)
            </span>

            <textarea
              className={fieldClass}
              rows={4}
              value={campaignDetail}
              onChange={(event) => setCampaignDetail(event.target.value)}
              placeholder="Example: Promote wedding planning packages, mention a seasonal offer, or highlight an upcoming community event."
            />
          </label>

          <button
            type="button"
            className={`${primaryButton} mt-6`}
            onClick={generateWeeklyPlan}
          >
            ✧ Generate Weekly Marketing Plan
          </button>
        </section>

        {/* GENERATED PLAN */}

        {generated && (
          <section className="mt-7 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-[#2C2053]">
                  2. Your Weekly Campaign
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Review and edit your posts before saving them.
                </p>
              </div>

              <span className="rounded-full bg-[#FBF9F3] px-4 py-2 text-xs font-semibold text-[#2C2053]">
                3 posts prepared
              </span>
            </div>

            <div className="mt-6 space-y-5">
              {campaignPosts.map((post, index) => (
                <article
                  key={`${post.topic}-${index}`}
                  className="rounded-2xl border border-gray-200 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#C39C49]">
                        Post {index + 1} · {post.topic}
                      </p>

                      <p className="mt-2 font-semibold text-[#2C2053]">
                        {formatDate(post.date)}
                      </p>
                    </div>

                    <span className="rounded-full bg-[#F7F5FA] px-3 py-1 text-xs text-[#2C2053]">
                      10:00 AM
                    </span>
                  </div>

                  <label className="mt-5 block space-y-2">
                    <span className="text-sm font-medium text-gray-700">
                      Post headline
                    </span>

                    <input
                      className={fieldClass}
                      value={post.title}
                      onChange={(event) =>
                        setCampaignPosts((previous) =>
                          previous.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, title: event.target.value }
                              : item
                          )
                        )
                      }
                    />
                  </label>

                  <label className="mt-4 block space-y-2">
                    <span className="text-sm font-medium text-gray-700">
                      Social media caption
                    </span>

                    <textarea
                      className={fieldClass}
                      rows={9}
                      value={post.caption}
                      onChange={(event) =>
                        setCampaignPosts((previous) =>
                          previous.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, caption: event.target.value }
                              : item
                          )
                        )
                      }
                    />
                  </label>

                  <div className="mt-4 rounded-xl border border-[#C39C49]/30 bg-[#FBF9F3] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#2C2053]">
                      EventBliss Graphic Style
                    </p>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#2C2053] text-xl text-[#C39C49]">
                        ✦
                      </div>

                      <div>
                        <p className="font-serif font-semibold text-[#2C2053]">
                          Royal Elegance
                        </p>

                        <p className="text-xs text-gray-500">
                          Royal purple · Luxury gold
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-7 rounded-xl border border-[#C39C49]/30 bg-[#FBF9F3] p-5">
              <h3 className="font-semibold text-[#2C2053]">
                3. Save for Your Approval
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Saving this campaign creates three posts in your existing
                marketing database. They will be marked as Pending Approval
                and appear in your Approval Centre. Nothing will be published
                automatically.
              </p>

              <button
                type="button"
                className={`${primaryButton} mt-5 w-full sm:w-auto`}
                disabled={saving}
                onClick={saveWeeklyPlan}
              >
                {saving ? "Saving Campaign..." : "Save All 3 Posts for Approval"}
              </button>
            </div>
          </section>
        )}

        {/* WORKFLOW */}

        <section className="mt-7 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-[#2C2053]">
            Your EventBliss Marketing Workflow
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {[
              {
                number: "01",
                title: "Prepare",
                description: "Generate and customize your weekly content.",
              },
              {
                number: "02",
                title: "Approve",
                description: "Review posts in your existing Approval Centre.",
              },
              {
                number: "03",
                title: "Publish",
                description: "Download graphics and publish manually.",
              },
            ].map((step) => (
              <div
                key={step.number}
                className="rounded-xl border border-gray-100 p-5"
              >
                <p className="font-serif text-2xl text-[#C39C49]">
                  {step.number}
                </p>

                <h3 className="mt-3 font-semibold text-[#2C2053]">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <p className="mt-8 text-center text-xs text-gray-400">
          EventBliss AI HQ · Private Company Workspace
        </p>
      </div>
    </main>
  );
}