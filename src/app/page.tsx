
"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

type Client = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  notes: string | null;
};

type EventRecord = {
  id: string;
  client_id: string | null;
  event_name: string;
  event_type: string | null;
  event_date: string | null;
  venue: string | null;
  guest_count: number | null;
  budget: number | null;
  status: string;
  notes: string | null;
};

type DesignData = {
  template: string;
  format: "square" | "story";
  headline: string;
  subtitle: string;
  brand: string;
};

type MarketingPost = {
  id: string;
  title: string;
  caption: string;
  platform: string[];
  content_type: string;
  status: string;
  scheduled_at?: string | null;
  design_data?: DesignData | null;
};

type ApprovalRecord = {
  id: string;
  title: string;
  description: string | null;
  item_type: string;
  status: string;
  marketing_post_id: string | null;
  created_at: string;
};

type OperationsAlert = {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  action: string;
};

type WorkspaceSettings = {
  id: string;
  workspace_name: string;
  business_name: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  logo_url: string;
  primary_color: string;
  accent_color: string;
  document_footer: string;
};

const defaultWorkspaceSettings: WorkspaceSettings = {
  id: "eventbliss",
  workspace_name: "EventBliss AI",
  business_name: "EventBliss",
  email: "eventblissdecor@gmail.com",
  phone: "",
  location: "Kamloops, British Columbia, Canada",
  website: "https://eventbliss.ca",
  logo_url: "https://eventbliss.ca/assets/eventbliss-logo.png",
  primary_color: "#2C2053",
  accent_color: "#C39C49",
  document_footer: "",
};

const navigation = [
  { name: "Overview", icon: "⌂" },
  { name: "AI Operations Director", icon: "✧" },
  { name: "Clients & Events", icon: "♡" },
  { name: "Marketing Studio", icon: "✎" },
  { name: "Content Calendar", icon: "▦" },
  { name: "Approval Centre", icon: "✓" },
  { name: "Publishing Queue", icon: "↗" },
  { name: "Quotations & Invoices", icon: "▤" },
  { name: "Settings", icon: "⚙" },
];

const emptyClient = {
  full_name: "",
  email: "",
  phone: "",
  company: "",
  notes: "",
};

const emptyEvent = {
  client_id: "",
  event_name: "",
  event_type: "",
  event_date: "",
  venue: "",
  guest_count: "",
  budget: "",
  status: "planning",
  notes: "",
};

const emptyPost = {
  title: "",
  caption: "",
  content_type: "post",
  status: "draft",
  platform: ["Instagram", "Facebook"],
  scheduled_at: "",
};

const defaultDesign: DesignData = {
  template: "royal",
  format: "square",
  headline: "Celebrate beautifully",
  subtitle: "Thoughtfully planned. Beautifully celebrated.",
  brand: "EventBliss",
};

const templates = [
  { id: "royal", name: "Royal Elegance" },
  { id: "minimal", name: "Minimal Luxury" },
  { id: "celebration", name: "Golden Celebration" },
  { id: "modern", name: "Modern Royal" },
];

const contentTemplates = [
  {
    name: "Wedding",
    title: "Your dream wedding deserves thoughtful planning",
    caption:
      "Every love story deserves a beautiful celebration. From the first idea to the final details, EventBliss helps bring your wedding vision to life.\n\nLet us help you create a day filled with meaningful moments, thoughtful details and unforgettable memories.\n\nContact EventBliss to start planning your celebration.\n\n#EventBliss #WeddingPlanning #KamloopsWeddings #WeddingInspiration",
  },
  {
    name: "Corporate",
    title: "Make your next corporate event memorable",
    caption:
      "A successful event brings people together and creates lasting impressions.\n\nEventBliss helps organize polished corporate gatherings, business celebrations and professional events with thoughtful planning and attention to detail.\n\nLet's make your next event exceptional.\n\n#EventBliss #CorporateEvents #KamloopsEvents #EventPlanning",
  },
  {
    name: "Celebration",
    title: "Celebrate life's special moments",
    caption:
      "Birthdays, anniversaries, milestones and special occasions deserve to be celebrated beautifully.\n\nLet EventBliss help you bring your ideas together with thoughtful coordination and beautiful details.\n\nYour celebration. Your vision. Our passion.\n\n#EventBliss #PrivateCelebrations #KamloopsEvents #CelebrateBeautifully",
  },
  {
    name: "Décor",
    title: "Details that make a celebration unforgettable",
    caption:
      "Beautiful décor sets the atmosphere and makes every celebration feel special.\n\nFrom elegant styling to carefully selected details, EventBliss brings your event vision together.\n\nLet's create something beautiful.\n\n#EventBliss #EventDecor #EventStyling #Kamloops",
  },
  {
    name: "Planning Tips",
    title: "Start planning before the big day",
    caption:
      "Planning an event? Start with a vision!\n\nHere are three simple steps:\n\n1. Decide what you're celebrating.\n2. Set your budget and estimate your guest count.\n3. Choose a style, theme or atmosphere you love.\n\nNeed help bringing everything together? EventBliss is here to help.\n\n#EventBliss #EventPlanningTips #KamloopsEvents",
  },
  {
    name: "Seasonal",
    title: "Make this season worth celebrating",
    caption:
      "Every season brings new reasons to gather, celebrate and create memories.\n\nWhether you're planning an intimate gathering or a larger celebration, EventBliss can help make your occasion special.\n\nContact us to start planning.\n\n#EventBliss #SeasonalCelebrations #KamloopsEvents",
  },
  {
    name: "Community",
    title: "Bringing people together through celebrations",
    caption:
      "Community events create connections, memories and moments that bring people together.\n\nEventBliss is passionate about helping create meaningful gatherings and special experiences.\n\nLet's celebrate our community.\n\n#EventBliss #CommunityEvents #KamloopsBC",
  },
  {
    name: "Testimonial",
    title: "Every celebration tells a story",
    caption:
      "Behind every beautiful event is a story worth celebrating.\n\nAt EventBliss, we believe thoughtful planning and attention to detail make every occasion meaningful.\n\nThank you for letting us be part of your special moments.\n\n#EventBliss #EventPlanning #BeautifulCelebrations",
  },
];

const fieldClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#C39C49]";

const primaryButton =
  "rounded-xl bg-[#2C2053] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#40316f] disabled:opacity-50";

const secondaryButton =
  "rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-[#C39C49]";

function toLocalDateTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );
  return localDate.toISOString().slice(0, 16);
}

function formatDateTime(value?: string | null) {
  if (!value) return "No date scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function sameLocalDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export default function DashboardPage() {
  const [activePage, setActivePage] = useState("Overview");

  const [clients, setClients] = useState<Client[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [posts, setPosts] = useState<MarketingPost[]>([]);
  const [approvalRecords, setApprovalRecords] = useState<ApprovalRecord[]>([]);
  const [workspaceSettings, setWorkspaceSettings] = useState<WorkspaceSettings>(defaultWorkspaceSettings);
  const [settingsLoading, setSettingsLoading] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [clientForm, setClientForm] = useState(emptyClient);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);

  const [eventForm, setEventForm] = useState(emptyEvent);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const [postForm, setPostForm] = useState(emptyPost);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  const [designForm, setDesignForm] = useState<DesignData>(defaultDesign);
  const [generatorTopic, setGeneratorTopic] = useState("Wedding");
  const [generatorDetail, setGeneratorDetail] = useState("");
  const [designOpen, setDesignOpen] = useState(true);

  const [currentTime, setCurrentTime] = useState<Date>(
  () => new Date(2000, 0, 1)
);

const [calendarMonth, setCalendarMonth] = useState<Date>(
  () => new Date(2000, 0, 1)
);

useEffect(() => {
  const now = new Date();

  setCurrentTime(now);

  setCalendarMonth(
    new Date(now.getFullYear(), now.getMonth(), 1)
  );
}, []);

useEffect(() => {
  const now = new Date();

  setCalendarMonth(
    new Date(now.getFullYear(), now.getMonth(), 1)
  );
}, []);

const designRef = useRef<HTMLDivElement>(null);

function notify(text: string) {
  setMessage(text);
  setError("");
  }

  function reportError(text: string) {
    setError(text);
    setMessage("");
  }

  async function loadAllData() {
    setLoading(true);

    const [clientsResult, eventsResult, postsResult, approvalsResult] =
      await Promise.all([
        supabase.from("clients").select("*").order("created_at", { ascending: false }),
        supabase.from("events").select("*").order("created_at", { ascending: false }),
        supabase.from("marketing_posts").select("*").order("created_at", { ascending: false }),
        supabase.from("approvals").select("*").order("created_at", { ascending: false }),
      ]);

    if (clientsResult.error) reportError(clientsResult.error.message);
    else setClients((clientsResult.data ?? []) as Client[]);

    if (eventsResult.error) reportError(eventsResult.error.message);
    else setEvents((eventsResult.data ?? []) as EventRecord[]);

    if (postsResult.error) reportError(postsResult.error.message);
    else setPosts((postsResult.data ?? []) as MarketingPost[]);

    if (approvalsResult.error) reportError(approvalsResult.error.message);
    else setApprovalRecords((approvalsResult.data ?? []) as ApprovalRecord[]);

    setLoading(false);
  }

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadWorkspaceSettings() {
    setSettingsLoading(true);
    const { data, error: settingsError } = await supabase
      .from("workspace_settings")
      .select("*")
      .eq("id", "eventbliss")
      .maybeSingle();

    if (settingsError) {
      reportError(settingsError.message);
    } else if (data) {
      setWorkspaceSettings({
        ...defaultWorkspaceSettings,
        ...data,
        workspace_name:
          data.workspace_name === "EventBliss AI HQ"
            ? "EventBliss AI"
            : data.workspace_name,
        email: data.email ?? "",
        phone: data.phone ?? "",
        document_footer: data.document_footer ?? "",
      });
    }
    setSettingsLoading(false);
  }

  useEffect(() => {
    loadWorkspaceSettings();
  }, []);

  async function saveWorkspaceSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const values = {
      id: "eventbliss",
      workspace_name: workspaceSettings.workspace_name.trim(),
      business_name: workspaceSettings.business_name.trim(),
      email: workspaceSettings.email.trim() || null,
      phone: workspaceSettings.phone.trim() || null,
      location: workspaceSettings.location.trim() || null,
      website: workspaceSettings.website.trim() || null,
      logo_url: workspaceSettings.logo_url.trim() || null,
      primary_color: workspaceSettings.primary_color,
      accent_color: workspaceSettings.accent_color,
      document_footer: workspaceSettings.document_footer.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { error: saveError } = await supabase
      .from("workspace_settings")
      .upsert(values, { onConflict: "id" });

    setSaving(false);

    if (saveError) {
      reportError(saveError.message);
      return;
    }

    notify("Workspace settings saved successfully.");
    await loadWorkspaceSettings();
  }

  // CLIENT MANAGEMENT

  async function saveClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const values = {
      full_name: clientForm.full_name.trim(),
      email: clientForm.email.trim() || null,
      phone: clientForm.phone.trim() || null,
      company: clientForm.company.trim() || null,
      notes: clientForm.notes.trim() || null,
    };

    const result = editingClientId
      ? await supabase.from("clients").update(values).eq("id", editingClientId)
      : await supabase.from("clients").insert(values);

    setSaving(false);

    if (result.error) {
      reportError(result.error.message);
      return;
    }

    notify(editingClientId ? "Client updated." : "Client added.");
    setClientForm(emptyClient);
    setEditingClientId(null);
    await loadAllData();
  }

  function editClient(client: Client) {
    setClientForm({
      full_name: client.full_name,
      email: client.email ?? "",
      phone: client.phone ?? "",
      company: client.company ?? "",
      notes: client.notes ?? "",
    });
    setEditingClientId(client.id);
  }

  async function deleteClient(id: string) {
    if (!window.confirm("Delete this client?")) return;

    const { error: deleteError } = await supabase
      .from("clients")
      .delete()
      .eq("id", id);

    if (deleteError) reportError(deleteError.message);
    else {
      notify("Client deleted.");
      await loadAllData();
    }
  }

  // EVENT MANAGEMENT

  async function saveEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const values = {
      client_id: eventForm.client_id || null,
      event_name: eventForm.event_name.trim(),
      event_type: eventForm.event_type || null,
      event_date: eventForm.event_date || null,
      venue: eventForm.venue.trim() || null,
      guest_count: eventForm.guest_count ? Number(eventForm.guest_count) : null,
      budget: eventForm.budget ? Number(eventForm.budget) : null,
      status: eventForm.status,
      notes: eventForm.notes.trim() || null,
    };

    const result = editingEventId
      ? await supabase.from("events").update(values).eq("id", editingEventId)
      : await supabase.from("events").insert(values);

    setSaving(false);

    if (result.error) {
      reportError(result.error.message);
      return;
    }

    notify(editingEventId ? "Event updated." : "Event added.");
    setEventForm(emptyEvent);
    setEditingEventId(null);
    await loadAllData();
  }

  function editEvent(record: EventRecord) {
    setEventForm({
      client_id: record.client_id ?? "",
      event_name: record.event_name,
      event_type: record.event_type ?? "",
      event_date: record.event_date ?? "",
      venue: record.venue ?? "",
      guest_count: record.guest_count?.toString() ?? "",
      budget: record.budget?.toString() ?? "",
      status: record.status,
      notes: record.notes ?? "",
    });
    setEditingEventId(record.id);
  }

  async function deleteEvent(id: string) {
    if (!window.confirm("Delete this event?")) return;

    const { error: deleteError } = await supabase
      .from("events")
      .delete()
      .eq("id", id);

    if (deleteError) reportError(deleteError.message);
    else {
      notify("Event deleted.");
      await loadAllData();
    }
  }

  // MARKETING CONTENT GENERATOR

  function generateContent() {
    const template =
      contentTemplates.find((item) => item.name === generatorTopic) ??
      contentTemplates[0];

    const detail = generatorDetail.trim();
    const caption = detail
      ? `${template.caption}\n\nAdditional details: ${detail}`
      : template.caption;

    setPostForm((previous) => ({
      ...previous,
      title: template.title,
      caption,
      content_type: "post",
      status: "draft",
    }));

    setDesignForm((previous) => ({
      ...previous,
      headline: template.title,
      subtitle: "Thoughtfully planned. Beautifully celebrated.",
    }));

    setDesignOpen(true);
    notify("Your marketing content is ready to edit.");
  }

  // MARKETING POST MANAGEMENT

  async function saveMarketingPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!postForm.title.trim()) {
      reportError("Please enter a post title.");
      return;
    }

    setSaving(true);

    const finalDesign = {
      ...designForm,
      headline: designForm.headline.trim() || postForm.title,
    };

    const values = {
      title: postForm.title.trim(),
      caption: postForm.caption.trim(),
      content_type: postForm.content_type,
      status: postForm.status,
      platform: postForm.platform,
      design_data: finalDesign,
      scheduled_at: postForm.scheduled_at
        ? new Date(postForm.scheduled_at).toISOString()
        : null,
    };

    const result = editingPostId
      ? await supabase
          .from("marketing_posts")
          .update(values)
          .eq("id", editingPostId)
      : await supabase.from("marketing_posts").insert(values);

    setSaving(false);

    if (result.error) {
      reportError(result.error.message);
      return;
    }

    notify(editingPostId ? "Marketing post updated." : "Marketing post saved.");

    setPostForm(emptyPost);
    setDesignForm(defaultDesign);
    setEditingPostId(null);
    await loadAllData();
  }

  function editPost(post: MarketingPost) {
    setPostForm({
      title: post.title,
      caption: post.caption ?? "",
      content_type: post.content_type ?? "post",
      status:
        post.status === "pending_approval" ? "pending_approval" : "draft",
      platform: post.platform ?? ["Instagram", "Facebook"],
      scheduled_at: toLocalDateTime(post.scheduled_at),
    });

    setDesignForm({
      ...defaultDesign,
      ...(post.design_data ?? {}),
    });

    setEditingPostId(post.id);
    setDesignOpen(true);
    setActivePage("Marketing Studio");
    setMessage("");
    setError("");
  }

  async function deletePost(id: string) {
    if (!window.confirm("Delete this marketing post?")) return;

    const { error: deleteError } = await supabase
      .from("marketing_posts")
      .delete()
      .eq("id", id);

    if (deleteError) reportError(deleteError.message);
    else {
      notify("Marketing post deleted.");
      await loadAllData();
    }
  }

  async function downloadDesign() {
    if (!designRef.current) {
      reportError("The design preview is not ready.");
      return;
    }

    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(designRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });

      const link = document.createElement("a");
      const filename = (designForm.headline || "eventbliss-design")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      link.download = `${filename || "eventbliss-design"}.png`;
      link.href = dataUrl;
      link.click();

      notify("Your design PNG has been downloaded.");
    } catch {
      reportError("Could not export the design. Please try again.");
    }
  }

  // PUBLISHING QUEUE ACTIONS

  async function copyPostCaption(post: MarketingPost) {
    try {
      await navigator.clipboard.writeText(post.caption || "");
      notify("Caption copied. You can paste it into Instagram or Facebook.");
    } catch {
      reportError("Could not copy the caption. Please try again.");
    }
  }

  async function downloadPostGraphic(post: MarketingPost) {
    const design: DesignData = {
      ...defaultDesign,
      ...(post.design_data ?? {}),
    };

    const container = document.createElement("div");
    const story = design.format === "story";

    Object.assign(container.style, {
      position: "fixed",
      left: "-10000px",
      top: "0",
      width: story ? "540px" : "1080px",
      height: story ? "960px" : "1080px",
      padding: "70px",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      color: "white",
      fontFamily: "Georgia, serif",
      background:
        design.template === "minimal"
          ? "linear-gradient(145deg, #2C2053, #21183f)"
          : design.template === "celebration"
            ? "radial-gradient(circle at center, #5a447d, #2C2053)"
            : design.template === "modern"
              ? "linear-gradient(135deg, #33245d, #1d1637)"
              : "radial-gradient(circle at top, #55427e, #2C2053 65%)",
    });

    const frame = document.createElement("div");
    Object.assign(frame.style, {
      width: "100%",
      height: "100%",
      border: "3px solid #C39C49",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "55px",
      boxSizing: "border-box",
    });

    const brand = document.createElement("p");
    brand.textContent = design.brand || "EventBliss";
    Object.assign(brand.style, {
      color: "#DCC28B",
      fontSize: "30px",
      letterSpacing: "12px",
      textTransform: "uppercase",
    });

    const line = document.createElement("div");
    Object.assign(line.style, {
      width: "130px",
      height: "3px",
      background: "#C39C49",
      margin: "30px 0",
    });

    const headline = document.createElement("h1");
    headline.textContent = design.headline || post.title;
    Object.assign(headline.style, {
      color: "#E7D4A5",
      fontSize: "65px",
      lineHeight: "1.2",
      fontWeight: "normal",
      margin: "0",
    });

    const subtitle = document.createElement("p");
    subtitle.textContent = design.subtitle || "";
    Object.assign(subtitle.style, {
      fontFamily: "Arial, sans-serif",
      fontSize: "28px",
      lineHeight: "1.6",
      marginTop: "45px",
    });

    const decoration = document.createElement("p");
    decoration.textContent = "✦     ✧     ✦";
    Object.assign(decoration.style, {
      color: "#C39C49",
      fontSize: "38px",
      margin: "45px 0",
    });

    const footer = document.createElement("p");
    footer.textContent = "Thoughtfully planned. Beautifully celebrated.";
    Object.assign(footer.style, {
      color: "#DCC28B",
      fontSize: "24px",
      fontStyle: "italic",
    });

    frame.append(brand, line, headline, subtitle, decoration, footer);
    container.appendChild(frame);
    document.body.appendChild(container);

    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(container, {
        pixelRatio: 2,
        cacheBust: true,
      });

      const link = document.createElement("a");
      const filename = post.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");

      link.download = `${filename || "eventbliss-post"}.png`;
      link.href = dataUrl;
      link.click();

      notify("Post graphic downloaded successfully.");
    } catch {
      reportError("Could not download the graphic. Please try again.");
    } finally {
      document.body.removeChild(container);
    }
  }

  async function markPostAsPublished(post: MarketingPost) {
    const confirmed = window.confirm(
      `Have you manually published "${post.title}" on its selected social media platform(s)?`
    );

    if (!confirmed) return;

    const { error: updateError } = await supabase
      .from("marketing_posts")
      .update({ status: "published" })
      .eq("id", post.id);

    if (updateError) {
      reportError(updateError.message);
      return;
    }

    notify("Post marked as published.");
    await loadAllData();
  }

  // APPROVAL CENTRE

  async function reviewMarketingPost(
    post: MarketingPost,
    decision: "approved" | "rejected"
  ) {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      reportError("Please sign in before reviewing an approval.");
      return;
    }

    const approvalValues = {
      title: post.title,
      description: post.caption,
      item_type: "marketing_post",
      marketing_post_id: post.id,
      status: decision,
      reviewed_by: userData.user.id,
      reviewed_at: new Date().toISOString(),
    };

    const { error: approvalError } = await supabase
      .from("approvals")
      .insert(approvalValues);

    if (approvalError) {
      reportError(approvalError.message);
      return;
    }

    const nextStatus =
      decision === "rejected"
        ? "rejected"
        : post.scheduled_at
          ? "scheduled"
          : "approved";

    const { error: postError } = await supabase
      .from("marketing_posts")
      .update({ status: nextStatus })
      .eq("id", post.id);

    if (postError) {
      reportError(postError.message);
      return;
    }

    notify(
      decision === "approved"
        ? post.scheduled_at
          ? "Post approved and added to the scheduled queue."
          : "Post approved."
        : "Post rejected."
    );

    await loadAllData();
  }

  // CALENDAR DATA

  const scheduledPosts = posts
    .filter((post) => Boolean(post.scheduled_at))
    .sort(
      (a, b) =>
        new Date(a.scheduled_at!).getTime() -
        new Date(b.scheduled_at!).getTime()
    );

  const unscheduledPosts = posts.filter((post) => !post.scheduled_at);

  const calendarStart = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth(),
    1
  );

  const calendarOffset = calendarStart.getDay();

  const calendarDays = Array.from({ length: 42 }, (_, index) =>
    new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      index - calendarOffset + 1
    )
  );

  const monthName = calendarMonth.toLocaleDateString("en-CA", {
    month: "long",
    year: "numeric",
  });

  function postsForDay(day: Date) {
    return scheduledPosts.filter((post) => {
      if (!post.scheduled_at) return false;
      return sameLocalDay(new Date(post.scheduled_at), day);
    });
  }

  function changeMonth(direction: number) {
    setCalendarMonth(
      new Date(
        calendarMonth.getFullYear(),
        calendarMonth.getMonth() + direction,
        1
      )
    );
  }

  const pendingPosts = posts.filter(
    (post) => post.status === "pending_approval"
  );

  const approvedPosts = posts.filter(
    (post) => post.status === "approved"
  );

  const queuePosts = posts.filter(
    (post) => post.status === "scheduled" || post.status === "approved"
  );

  const scheduledQueuePosts = queuePosts.filter(
    (post) => post.status === "scheduled"
  );

  const readyQueuePosts = queuePosts.filter(
    (post) => post.status === "approved"
  );

  const publishedPosts = posts.filter(
    (post) => post.status === "published"
  );

  // AI OPERATIONS DIRECTOR - AUTOMATED BUSINESS INSIGHTS

  const today = new Date(
  currentTime.getFullYear(),
  currentTime.getMonth(),
  currentTime.getDate()
);
  today.setHours(0, 0, 0, 0);

  const next30Days = new Date(today);
  next30Days.setDate(today.getDate() + 30);

  const upcomingEvents = events
    .filter((record) => {
      if (!record.event_date) return false;

      if (
        record.status === "completed" ||
        record.status === "cancelled"
      ) {
        return false;
      }

      const eventDate = new Date(`${record.event_date}T00:00:00`);

      return eventDate >= today && eventDate <= next30Days;
    })
    .sort(
      (a, b) =>
        new Date(`${a.event_date}T00:00:00`).getTime() -
        new Date(`${b.event_date}T00:00:00`).getTime()
    );

  const missingEventDetails = events.filter(
    (record) =>
      record.status !== "completed" &&
      record.status !== "cancelled" &&
      (!record.event_date || !record.venue || !record.client_id)
  );

  const overdueEvents = events.filter((record) => {
    if (!record.event_date) return false;

    if (
      record.status === "completed" ||
      record.status === "cancelled"
    ) {
      return false;
    }

    return new Date(`${record.event_date}T00:00:00`) < today;
  });

  const postsAwaitingApproval = posts.filter(
    (post) => post.status === "pending_approval"
  );

  const approvedUnscheduledPosts = posts.filter(
    (post) => post.status === "approved" && !post.scheduled_at
  );

  const overdueScheduledPosts = posts.filter((post) => {
    if (!post.scheduled_at) return false;

    return (
      post.status === "scheduled" &&
      new Date(post.scheduled_at).getTime() < currentTime.getTime()
    );
  });

  const missingClientDetails = clients.filter(
    (client) => !client.email && !client.phone
  );

  const operationsAlerts: OperationsAlert[] = [
    ...overdueEvents.map((record) => ({
      id: `overdue-${record.id}`,
      title: `Past event date: ${record.event_name}`,
      description:
        "This event date has passed but the event is not marked completed or cancelled.",
      priority: "high" as const,
      action: "Clients & Events",
    })),

    ...missingEventDetails.map((record) => ({
      id: `missing-${record.id}`,
      title: `Incomplete booking: ${record.event_name}`,
      description: [
        !record.event_date ? "Missing event date" : "",
        !record.venue ? "Missing venue" : "",
        !record.client_id ? "No client linked" : "",
      ]
        .filter(Boolean)
        .join(" · "),
      priority: "medium" as const,
      action: "Clients & Events",
    })),

    ...postsAwaitingApproval.map((post) => ({
      id: `approval-${post.id}`,
      title: `Approval needed: ${post.title}`,
      description: "This marketing post is waiting for your review.",
      priority: "medium" as const,
      action: "Approval Centre",
    })),

    ...approvedUnscheduledPosts.map((post) => ({
      id: `schedule-${post.id}`,
      title: `Schedule marketing post: ${post.title}`,
      description: "This post is approved but does not have a publishing date.",
      priority: "medium" as const,
      action: "Content Calendar",
    })),

    ...overdueScheduledPosts.map((post) => ({
      id: `late-post-${post.id}`,
      title: `Check publishing status: ${post.title}`,
      description:
        "Its scheduled time has passed. Confirm whether it was published.",
      priority: "high" as const,
      action: "Publishing Queue",
    })),

    ...missingClientDetails.map((client) => ({
      id: `client-${client.id}`,
      title: `Missing contact details: ${client.full_name}`,
      description:
        "This client has no email address or phone number recorded.",
      priority: "low" as const,
      action: "Clients & Events",
    })),
  ];

  const recommendedActions = [
    ...(overdueEvents.length > 0
      ? [
          {
            title: "Review past-due events",
            description: `${overdueEvents.length} event(s) have passed their date and need a status review.`,
            page: "Clients & Events",
          },
        ]
      : []),

    ...(missingEventDetails.length > 0
      ? [
          {
            title: "Complete event booking details",
            description: `${missingEventDetails.length} event(s) are missing important booking information.`,
            page: "Clients & Events",
          },
        ]
      : []),

    ...(postsAwaitingApproval.length > 0
      ? [
          {
            title: "Review marketing content",
            description: `${postsAwaitingApproval.length} post(s) are waiting for your approval.`,
            page: "Approval Centre",
          },
        ]
      : []),

    ...(approvedUnscheduledPosts.length > 0
      ? [
          {
            title: "Plan your approved content",
            description: `${approvedUnscheduledPosts.length} approved post(s) need a publishing date.`,
            page: "Content Calendar",
          },
        ]
      : []),

    ...(overdueScheduledPosts.length > 0
      ? [
          {
            title: "Confirm scheduled publishing",
            description: `${overdueScheduledPosts.length} scheduled post(s) have passed their planned time.`,
            page: "Publishing Queue",
          },
        ]
      : []),

    ...(upcomingEvents.length > 0
      ? [
          {
            title: "Prepare upcoming events",
            description: `${upcomingEvents.length} event(s) are scheduled within the next 30 days.`,
            page: "Clients & Events",
          },
        ]
      : []),
  ];

  if (recommendedActions.length === 0) {
    recommendedActions.push({
      title: "Keep building your business",
      description:
        "Your current records have no outstanding alerts. Continue adding bookings and preparing marketing content.",
      page: "Overview",
    });
  }

  const highPriorityAlerts = operationsAlerts.filter(
    (alert) => alert.priority === "high"
  ).length;

  const operationsStatus =
    highPriorityAlerts > 0
      ? "Attention required"
      : operationsAlerts.length > 0
        ? "Some tasks need attention"
        : "Looking good";

  // REUSABLE FORM FIELDS

  const input = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    placeholder = "",
    type = "text"
  ) => (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        className={fieldClass}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );

  const textarea = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    placeholder = "",
    rows = 4
  ) => (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <textarea
        className={fieldClass}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );

  function SectionHeading({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) {
    return (
      <div className="mb-7">
        <h2 className="text-2xl font-bold text-[#2C2053]">{title}</h2>
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      </div>
    );
  }

  function StatCard({
    title,
    value,
    icon,
  }: {
    title: string;
    value: number;
    icon: string;
  }) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{title}</p>
          <span className="text-2xl text-[#C39C49]">{icon}</span>
        </div>
        <p className="mt-4 text-3xl font-bold text-[#2C2053]">{value}</p>
      </div>
    );
  }

  function DesignPreview({
    compact = false,
    design = designForm,
  }: {
    compact?: boolean;
    design?: DesignData;
  }) {
    const story = design.format === "story";

    const templateStyle: Record<string, string> = {
      royal: "radial-gradient(circle at top, #55427e, #2C2053 65%)",
      minimal: "linear-gradient(145deg, #2C2053, #21183f)",
      celebration: "radial-gradient(circle at center, #5a447d, #2C2053)",
      modern: "linear-gradient(135deg, #33245d, #1d1637)",
    };

    return (
      <div
        ref={compact ? undefined : designRef}
        className="relative flex w-full flex-col items-center justify-center overflow-hidden border border-[#C39C49]/70 text-center text-white"
        style={{
          aspectRatio: story ? "9 / 16" : "1 / 1",
          maxWidth: compact ? "180px" : story ? "320px" : "520px",
          minHeight: compact ? "auto" : story ? "520px" : "auto",
          background: templateStyle[design.template] ?? templateStyle.royal,
          padding: compact ? "14px" : "9%",
        }}
      >
        <div
          className="pointer-events-none absolute inset-3 border border-[#C39C49]/60"
          style={{ inset: compact ? "6px" : "18px" }}
        />

        <div className="pointer-events-none absolute left-1/2 top-6 h-16 w-16 -translate-x-1/2 rounded-full border border-[#C39C49]/30" />

        <div className="pointer-events-none absolute left-1/2 top-10 h-8 w-8 -translate-x-1/2 rotate-45 border border-[#C39C49]/50" />

        <div className="relative z-10 flex w-full flex-col items-center">
          <p
            className="font-serif uppercase tracking-[0.3em] text-[#DCC28B]"
            style={{ fontSize: compact ? "7px" : "12px" }}
          >
            {design.brand || "EventBliss"}
          </p>

          <div
            className="my-3 h-px bg-[#C39C49]"
            style={{ width: compact ? "28px" : "65px" }}
          />

          <p
            className="font-serif leading-tight text-[#E7D4A5]"
            style={{
              fontSize: compact ? "12px" : story ? "34px" : "42px",
            }}
          >
            {design.headline || "Celebrate beautifully"}
          </p>

          <p
            className="mt-4 max-w-[90%] font-light leading-relaxed text-white/90"
            style={{ fontSize: compact ? "7px" : "15px" }}
          >
            {design.subtitle}
          </p>

          <div
            className="my-5 flex items-center gap-3 text-[#C39C49]"
            style={{ fontSize: compact ? "9px" : "17px" }}
          >
            <span>✦</span>
            <span>✧</span>
            <span>✦</span>
          </div>

          <p
            className="font-serif italic text-[#DCC28B]"
            style={{ fontSize: compact ? "7px" : "13px" }}
          >
            Thoughtfully planned. Beautifully celebrated.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5FA] text-gray-800">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col bg-[#2C2053] px-5 py-7 text-white md:flex">
          <div className="mb-10 flex items-center gap-3">
            <img
              src={workspaceSettings.logo_url || defaultWorkspaceSettings.logo_url}
              alt="EventBliss logo"
              className="h-12 w-12 rounded-lg bg-white object-contain p-1"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-wide">
                EventBliss AI
              </h1>
              <p className="mt-1 text-xs tracking-[0.2em] text-[#C39C49]">
                BUSINESS HUB
              </p>
            </div>
          </div>

          <nav className="space-y-2">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  if (item.name === "Quotations & Invoices") {
                    window.location.href = "/documents";
                    return;
                  }
                  setActivePage(item.name);
                  setMessage("");
                  setError("");
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                  activePage === item.name
                    ? "bg-[#C39C49] font-semibold text-[#2C2053]"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-xl border border-white/15 bg-white/5 p-4">
            <p className="text-sm font-semibold">EventBliss AI</p>
            <p className="mt-1 text-xs text-white/60">
              Your private event management workspace.
            </p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-7 lg:p-10">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <img
                  src={workspaceSettings.logo_url || defaultWorkspaceSettings.logo_url}
                  alt="EventBliss logo"
                  className="h-7 w-7 rounded bg-white object-contain p-0.5"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C39C49]">
                  EventBliss AI
                </p>
              </div>
              <h1 className="mt-1 text-2xl font-bold text-[#2C2053]">
                {activePage}
              </h1>
            </div>

            <div className="flex flex-wrap gap-2 md:hidden">
              <select
                className={fieldClass}
                value={activePage}
                onChange={(event) => {
                  if (event.target.value === "Quotations & Invoices") {
                    window.location.href = "/documents";
                    return;
                  }
                  setActivePage(event.target.value);
                }}
              >
                {navigation.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden rounded-full border border-[#C39C49]/40 bg-white px-4 py-2 text-xs font-medium text-[#2C2053] sm:block">
              Private Company Dashboard
            </div>
          </div>

          {message && (
            <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl bg-white p-10 text-center text-gray-500">
              Loading your EventBliss workspace...
            </div>
          ) : (
            <>
              {/* OVERVIEW */}

              {activePage === "Overview" && (
                <>
                  <SectionHeading
                    title="Welcome to EventBliss HQ"
                    description="Your company operations, clients, events and marketing workspace."
                  />

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard title="Total Clients" value={clients.length} icon="♡" />
                    <StatCard title="Total Events" value={events.length} icon="✧" />
                    <StatCard title="Marketing Posts" value={posts.length} icon="✎" />
                    <StatCard title="Pending Approvals" value={pendingPosts.length} icon="✓" />
                  </div>

                  <div className="mt-7 grid gap-6 lg:grid-cols-2">
                    <section className="rounded-2xl bg-white p-6 shadow-sm">
                      <h3 className="font-semibold text-[#2C2053]">Recent Events</h3>
                      <div className="mt-4 space-y-3">
                        {events.slice(0, 5).map((record) => (
                          <div key={record.id} className="flex justify-between gap-3 border-b border-gray-100 pb-3">
                            <div>
                              <p className="font-medium">{record.event_name}</p>
                              <p className="text-xs text-gray-500">{record.event_date || "Date not set"}</p>
                            </div>
                            <span className="text-xs capitalize text-[#C39C49]">{record.status}</span>
                          </div>
                        ))}
                        {events.length === 0 && <p className="text-sm text-gray-400">No events added yet.</p>}
                      </div>
                    </section>

                    <section className="rounded-2xl bg-white p-6 shadow-sm">
                      <h3 className="font-semibold text-[#2C2053]">Marketing Activity</h3>
                      <div className="mt-4 space-y-3">
                        {posts.slice(0, 5).map((post) => (
                          <div key={post.id} className="border-b border-gray-100 pb-3">
                            <p className="font-medium">{post.title}</p>
                            <p className="mt-1 text-xs capitalize text-gray-500">{post.status.replaceAll("_", " ")}</p>
                          </div>
                        ))}
                        {posts.length === 0 && <p className="text-sm text-gray-400">No marketing posts yet.</p>}
                      </div>
                    </section>
                  </div>
                </>
              )}

              {/* CLIENTS & EVENTS */}

              {activePage === "Clients & Events" && (
                <>
                  <SectionHeading
                    title="Clients & Events"
                    description="Manage your customer contact records and event planning records."
                  />

                  <div className="grid gap-7 xl:grid-cols-2">
                    <section className="rounded-2xl bg-white p-6 shadow-sm">
                      <h3 className="mb-5 font-semibold text-[#2C2053]">
                        {editingClientId ? "Edit Client" : "Add New Client"}
                      </h3>

                      <form onSubmit={saveClient} className="space-y-4">
                        {input("Full name", clientForm.full_name, (v) => setClientForm({ ...clientForm, full_name: v }), "Client name")}
                        {input("Email", clientForm.email, (v) => setClientForm({ ...clientForm, email: v }), "Email address", "email")}
                        {input("Phone", clientForm.phone, (v) => setClientForm({ ...clientForm, phone: v }), "Phone number")}
                        {input("Company", clientForm.company, (v) => setClientForm({ ...clientForm, company: v }), "Company name")}
                        {textarea("Notes", clientForm.notes, (v) => setClientForm({ ...clientForm, notes: v }), "Additional information", 3)}

                        <div className="flex flex-wrap gap-2">
                          <button className={primaryButton} disabled={saving}>
                            {saving ? "Saving..." : editingClientId ? "Update Client" : "Save Client"}
                          </button>
                          {editingClientId && (
                            <button type="button" className={secondaryButton} onClick={() => { setEditingClientId(null); setClientForm(emptyClient); }}>
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>

                      <div className="mt-8 border-t border-gray-100 pt-5">
                        <h4 className="mb-4 font-semibold text-[#2C2053]">Client Records</h4>
                        <div className="space-y-3">
                          {clients.map((client) => (
                            <div key={client.id} className="rounded-xl border border-gray-100 p-4">
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <p className="font-semibold">{client.full_name}</p>
                                  <p className="text-sm text-gray-500">{client.email || client.phone || "No contact details"}</p>
                                  {client.company && <p className="text-xs text-gray-400">{client.company}</p>}
                                </div>
                                <div className="flex gap-2">
                                  <button className={secondaryButton} onClick={() => editClient(client)}>Edit</button>
                                  <button className="rounded-xl border border-red-100 px-3 py-2 text-xs text-red-600" onClick={() => deleteClient(client.id)}>Delete</button>
                                </div>
                              </div>
                            </div>
                          ))}
                          {clients.length === 0 && <p className="text-sm text-gray-400">No clients yet.</p>}
                        </div>
                      </div>
                    </section>

                    <section className="rounded-2xl bg-white p-6 shadow-sm">
                      <h3 className="mb-5 font-semibold text-[#2C2053]">
                        {editingEventId ? "Edit Event" : "Add New Event"}
                      </h3>

                      <form onSubmit={saveEvent} className="space-y-4">
                        {input("Event name", eventForm.event_name, (v) => setEventForm({ ...eventForm, event_name: v }), "Event name")}

                        <label className="block space-y-2">
                          <span className="text-sm font-medium text-gray-700">Client</span>
                          <select className={fieldClass} value={eventForm.client_id} onChange={(e) => setEventForm({ ...eventForm, client_id: e.target.value })}>
                            <option value="">No client selected</option>
                            {clients.map((client) => <option key={client.id} value={client.id}>{client.full_name}</option>)}
                          </select>
                        </label>

                        <label className="block space-y-2">
                          <span className="text-sm font-medium text-gray-700">Event type</span>
                          <select className={fieldClass} value={eventForm.event_type} onChange={(e) => setEventForm({ ...eventForm, event_type: e.target.value })}>
                            <option value="">Select type</option>
                            {["Wedding", "Corporate Event", "Private Celebration", "Community Event", "Décor & Styling", "Other"].map((v) => <option key={v}>{v}</option>)}
                          </select>
                        </label>

                        {input("Event date", eventForm.event_date, (v) => setEventForm({ ...eventForm, event_date: v }), "", "date")}
                        {input("Venue", eventForm.venue, (v) => setEventForm({ ...eventForm, venue: v }), "Venue")}
                        {input("Guest count", eventForm.guest_count, (v) => setEventForm({ ...eventForm, guest_count: v }), "Number of guests", "number")}
                        {input("Budget", eventForm.budget, (v) => setEventForm({ ...eventForm, budget: v }), "Budget", "number")}

                        <label className="block space-y-2">
                          <span className="text-sm font-medium text-gray-700">Status</span>
                          <select className={fieldClass} value={eventForm.status} onChange={(e) => setEventForm({ ...eventForm, status: e.target.value })}>
                            {["planning", "confirmed", "in_progress", "completed", "cancelled"].map((v) => <option key={v} value={v}>{v.replaceAll("_", " ")}</option>)}
                          </select>
                        </label>

                        {textarea("Notes", eventForm.notes, (v) => setEventForm({ ...eventForm, notes: v }), "Event notes", 3)}

                        <div className="flex flex-wrap gap-2">
                          <button className={primaryButton} disabled={saving}>
                            {saving ? "Saving..." : editingEventId ? "Update Event" : "Save Event"}
                          </button>
                          {editingEventId && (
                            <button type="button" className={secondaryButton} onClick={() => { setEditingEventId(null); setEventForm(emptyEvent); }}>
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>

                      <div className="mt-8 border-t border-gray-100 pt-5">
                        <h4 className="mb-4 font-semibold text-[#2C2053]">Event Records</h4>
                        <div className="space-y-3">
                          {events.map((record) => (
                            <div key={record.id} className="rounded-xl border border-gray-100 p-4">
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <p className="font-semibold">{record.event_name}</p>
                                  <p className="text-sm text-gray-500">{record.event_date || "Date not set"} · {record.venue || "Venue not set"}</p>
                                  <p className="mt-1 text-xs capitalize text-[#C39C49]">{record.status.replaceAll("_", " ")}</p>
                                </div>
                                <div className="flex gap-2">
                                  <button className={secondaryButton} onClick={() => editEvent(record)}>Edit</button>
                                  <button className="rounded-xl border border-red-100 px-3 py-2 text-xs text-red-600" onClick={() => deleteEvent(record.id)}>Delete</button>
                                </div>
                              </div>
                            </div>
                          ))}
                          {events.length === 0 && <p className="text-sm text-gray-400">No events yet.</p>}
                        </div>
                      </div>
                    </section>
                  </div>
                </>
              )}

              {/* MARKETING STUDIO */}

              {activePage === "Marketing Studio" && (
                <>
                  <SectionHeading
                    title="Marketing Studio"
                    description="Create social media content and design branded graphics for EventBliss."
                  />

                  <div className="grid gap-7 xl:grid-cols-2">
                    <section className="space-y-6">
                      <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <h3 className="font-semibold text-[#2C2053]">Content Generator</h3>
                        <p className="mt-1 text-sm text-gray-500">Start with a ready-made EventBliss marketing idea.</p>

                        <div className="mt-5 space-y-4">
                          <label className="block space-y-2">
                            <span className="text-sm font-medium">Content topic</span>
                            <select className={fieldClass} value={generatorTopic} onChange={(e) => setGeneratorTopic(e.target.value)}>
                              {contentTemplates.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
                            </select>
                          </label>

                          {textarea("Additional details (optional)", generatorDetail, setGeneratorDetail, "Add an offer, event detail or campaign idea", 3)}

                          <button type="button" className={primaryButton} onClick={generateContent}>
                            Generate Marketing Content
                          </button>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-[#2C2053]">Create Marketing Post</h3>
                            <p className="mt-1 text-sm text-gray-500">Edit your content before saving it.</p>
                          </div>
                          {editingPostId && <span className="text-xs font-semibold text-[#C39C49]">Editing post</span>}
                        </div>

                        <form onSubmit={saveMarketingPost} className="space-y-4">
                          {input("Post title", postForm.title, (v) => {
                            setPostForm({ ...postForm, title: v });
                            setDesignForm({ ...designForm, headline: v });
                          }, "Post headline")}

                          {textarea("Caption", postForm.caption, (v) => setPostForm({ ...postForm, caption: v }), "Write your social media caption", 7)}

                          <label className="block space-y-2">
                            <span className="text-sm font-medium">Content format</span>
                            <select className={fieldClass} value={postForm.content_type} onChange={(e) => setPostForm({ ...postForm, content_type: e.target.value })}>
                              {["post", "story", "reel", "carousel"].map((v) => <option key={v} value={v}>{v}</option>)}
                            </select>
                          </label>

                          <div>
                            <p className="mb-2 text-sm font-medium">Platforms</p>
                            <div className="flex flex-wrap gap-4">
                              {["Instagram", "Facebook"].map((platform) => (
                                <label key={platform} className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={postForm.platform.includes(platform)}
                                    onChange={(e) => setPostForm({
                                      ...postForm,
                                      platform: e.target.checked
                                        ? [...postForm.platform, platform]
                                        : postForm.platform.filter((item) => item !== platform),
                                    })}
                                  />
                                  {platform}
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-xl border border-[#C39C49]/30 bg-[#FBF9F3] p-4">
                            <h4 className="font-semibold text-[#2C2053]">Schedule this content</h4>
                            <p className="mt-1 text-xs leading-5 text-gray-500">
                              Choose when you want this post to appear on your calendar. It will not be published automatically.
                            </p>
                            <label className="mt-3 block space-y-2">
                              <span className="text-sm font-medium text-gray-700">Date and time</span>
                              <input
                                className={fieldClass}
                                type="datetime-local"
                                value={postForm.scheduled_at}
                                onChange={(e) => setPostForm({ ...postForm, scheduled_at: e.target.value })}
                              />
                            </label>
                            {postForm.scheduled_at && (
                              <button
                                type="button"
                                className="mt-2 text-xs font-medium text-red-600"
                                onClick={() => setPostForm({ ...postForm, scheduled_at: "" })}
                              >
                                Clear scheduled date
                              </button>
                            )}
                          </div>

                          <label className="block space-y-2">
                            <span className="text-sm font-medium">Post status</span>
                            <select className={fieldClass} value={postForm.status} onChange={(e) => setPostForm({ ...postForm, status: e.target.value })}>
                              <option value="draft">Draft</option>
                              <option value="pending_approval">Pending approval</option>
                            </select>
                          </label>

                          <div className="border-t border-gray-100 pt-5">
                            <button
                              type="button"
                              className="flex w-full items-center justify-between text-left font-semibold text-[#2C2053]"
                              onClick={() => setDesignOpen(!designOpen)}
                            >
                              <span>✧ Graphic Design Studio</span>
                              <span>{designOpen ? "−" : "+"}</span>
                            </button>

                            {designOpen && (
                              <div className="mt-5 space-y-4">
                                <p className="text-sm text-gray-500">Choose a branded template and customize your graphic.</p>

                                <label className="block space-y-2">
                                  <span className="text-sm font-medium">Design template</span>
                                  <select className={fieldClass} value={designForm.template} onChange={(e) => setDesignForm({ ...designForm, template: e.target.value })}>
                                    {templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
                                  </select>
                                </label>

                                <label className="block space-y-2">
                                  <span className="text-sm font-medium">Image size</span>
                                  <select className={fieldClass} value={designForm.format} onChange={(e) => setDesignForm({ ...designForm, format: e.target.value as "square" | "story" })}>
                                    <option value="square">Square — Instagram / Facebook post</option>
                                    <option value="story">Portrait — Story format</option>
                                  </select>
                                </label>

                                {input("Graphic headline", designForm.headline, (v) => setDesignForm({ ...designForm, headline: v }), "Your headline")}
                                {textarea("Graphic subtitle", designForm.subtitle, (v) => setDesignForm({ ...designForm, subtitle: v }), "Supporting text", 2)}
                                {input("Brand name", designForm.brand, (v) => setDesignForm({ ...designForm, brand: v }), "EventBliss")}

                                <div className="rounded-xl bg-[#F7F5FA] p-4">
                                  <p className="mb-3 text-sm font-semibold text-[#2C2053]">Live Graphic Preview</p>
                                  <div className="flex justify-center">
                                    <DesignPreview />
                                  </div>
                                  <button type="button" className={`${primaryButton} mt-4 w-full`} onClick={downloadDesign}>
                                    Download Graphic as PNG
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-5">
                            <button className={primaryButton} disabled={saving}>
                              {saving ? "Saving..." : editingPostId ? "Update Marketing Post" : "Save Marketing Post"}
                            </button>
                            {editingPostId && (
                              <button type="button" className={secondaryButton} onClick={() => {
                                setEditingPostId(null);
                                setPostForm(emptyPost);
                                setDesignForm(defaultDesign);
                              }}>
                                Cancel
                              </button>
                            )}
                          </div>
                        </form>
                      </div>
                    </section>

                    <section className="rounded-2xl bg-white p-6 shadow-sm">
                      <h3 className="mb-5 font-semibold text-[#2C2053]">Marketing Library</h3>

                      <div className="space-y-4">
                        {posts.map((post) => {
                          const savedDesign = {
                            ...defaultDesign,
                            ...(post.design_data ?? {}),
                          };

                          return (
                            <div key={post.id} className="rounded-xl border border-gray-100 p-4">
                              <div className="flex gap-4">
                                <div className="w-28 shrink-0">
                                  <DesignPreview compact={true} design={savedDesign} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-[#2C2053]">{post.title}</p>
                                  <p className="mt-1 line-clamp-3 whitespace-pre-line text-xs text-gray-500">{post.caption}</p>
                                  <p className="mt-2 text-xs capitalize text-[#C39C49]">{post.status.replaceAll("_", " ")}</p>
                                  {post.scheduled_at && (
                                    <p className="mt-1 text-xs text-gray-500">{formatDateTime(post.scheduled_at)}</p>
                                  )}
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    <button className={secondaryButton} onClick={() => editPost(post)}>Edit</button>
                                    <button className="rounded-xl border border-red-100 px-3 py-2 text-xs text-red-600" onClick={() => deletePost(post.id)}>Delete</button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {posts.length === 0 && (
                          <p className="text-sm text-gray-400">Your saved marketing posts will appear here.</p>
                        )}
                      </div>
                    </section>
                  </div>
                </>
              )}

              {/* CONTENT CALENDAR */}

              {activePage === "Content Calendar" && (
                <>
                  <SectionHeading
                    title="Content Calendar"
                    description="Plan your EventBliss social media content by date and time."
                  />

                  <div className="mb-6 grid gap-4 sm:grid-cols-3">
                    <StatCard title="Scheduled Posts" value={scheduledPosts.length} icon="▦" />
                    <StatCard title="Awaiting Approval" value={pendingPosts.length} icon="✓" />
                    <StatCard title="Unscheduled Posts" value={unscheduledPosts.length} icon="✎" />
                  </div>

                  <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-[#2C2053]">{monthName}</h3>
                        <p className="mt-1 text-xs text-gray-500">Select a post to edit or change its schedule.</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button className={secondaryButton} onClick={() => setCalendarMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}>Today</button>
                        <button className={secondaryButton} onClick={() => changeMonth(-1)}>← Previous</button>
                        <button className={secondaryButton} onClick={() => changeMonth(1)}>Next →</button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 border-l border-t border-gray-200">
                      {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
                        <div key={day} className="border-b border-r border-gray-200 bg-[#F7F5FA] px-1 py-3 text-center text-[10px] font-semibold text-[#2C2053] sm:text-xs">
                          <span className="hidden sm:inline">{day}</span>
                          <span className="sm:hidden">{day.slice(0, 3)}</span>
                        </div>
                      ))}

                      {calendarDays.map((day, index) => {
                        const dayPosts = postsForDay(day);
                        const inCurrentMonth = day.getMonth() === calendarMonth.getMonth();

                        return (
                          <div
                            key={`${day.toISOString()}-${index}`}
                            className={`min-h-24 border-b border-r border-gray-200 p-1 sm:min-h-32 sm:p-2 ${inCurrentMonth ? "bg-white" : "bg-gray-50"}`}
                          >
                            <div className={`mb-1 text-xs font-semibold ${inCurrentMonth ? "text-[#2C2053]" : "text-gray-300"}`}>
                              {day.getDate()}
                            </div>

                            <div className="space-y-1">
                              {dayPosts.slice(0, 3).map((post) => (
                                <button
                                  key={post.id}
                                  type="button"
                                  onClick={() => editPost(post)}
                                  title={`${post.title} — ${formatDateTime(post.scheduled_at)}`}
                                  className={`block w-full truncate rounded-md px-1 py-1 text-left text-[9px] leading-tight sm:text-[10px] ${post.status === "pending_approval" ? "bg-amber-100 text-amber-800" : post.status === "scheduled" ? "bg-[#2C2053] text-white" : post.status === "approved" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}
                                >
                                  {new Date(post.scheduled_at!).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}{" "}
                                  {post.title}
                                </button>
                              ))}

                              {dayPosts.length > 3 && (
                                <p className="px-1 text-[9px] text-gray-500">+{dayPosts.length - 3} more</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-4 text-xs text-gray-600">
                      <span className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-amber-200" />Awaiting approval</span>
                      <span className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-[#2C2053]" />Scheduled</span>
                      <span className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-green-200" />Approved</span>
                    </div>
                  </section>

                  <section className="mt-7 rounded-2xl bg-white p-6 shadow-sm">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-[#2C2053]">Scheduled Content</h3>
                        <p className="mt-1 text-xs text-gray-500">All posts with a selected date and time.</p>
                      </div>
                      <button
                        className={primaryButton}
                        onClick={() => {
                          setPostForm(emptyPost);
                          setDesignForm(defaultDesign);
                          setEditingPostId(null);
                          setActivePage("Marketing Studio");
                        }}
                      >
                        + Create Post
                      </button>
                    </div>

                    <div className="space-y-3">
                      {scheduledPosts.map((post) => (
                        <div key={post.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 p-4">
                          <div className="min-w-0">
                            <p className="font-semibold text-[#2C2053]">{post.title}</p>
                            <p className="mt-1 text-xs text-gray-500">{formatDateTime(post.scheduled_at)}</p>
                            <p className="mt-1 text-xs text-gray-500">{post.platform.join(", ")} · {post.status.replaceAll("_", " ")}</p>
                          </div>
                          <button className={secondaryButton} onClick={() => editPost(post)}>Edit / Reschedule</button>
                        </div>
                      ))}
                      {scheduledPosts.length === 0 && <p className="text-sm text-gray-400">No posts have dates yet. Add a date and time in Marketing Studio to see them here.</p>}
                    </div>
                  </section>

                  <section className="mt-7 rounded-2xl bg-white p-6 shadow-sm">
                    <h3 className="mb-2 font-semibold text-[#2C2053]">Posts Without a Schedule</h3>
                    <p className="mb-4 text-xs text-gray-500">These posts do not have a date and time assigned yet.</p>

                    <div className="space-y-3">
                      {unscheduledPosts.map((post) => (
                        <div key={post.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
                          <div>
                            <p className="font-medium text-[#2C2053]">{post.title}</p>
                            <p className="mt-1 text-xs capitalize text-gray-500">{post.status.replaceAll("_", " ")}</p>
                          </div>
                          <button className={secondaryButton} onClick={() => editPost(post)}>Plan This Post</button>
                        </div>
                      ))}
                      {unscheduledPosts.length === 0 && <p className="text-sm text-gray-400">All your saved posts have a scheduled date.</p>}
                    </div>
                  </section>
                </>
              )}

              {/* APPROVAL CENTRE */}

              {activePage === "Approval Centre" && (
                <>
                  <SectionHeading
                    title="Approval Centre"
                    description="Review marketing content before it moves forward."
                  />

                  <section className="rounded-2xl bg-white p-6 shadow-sm">
                    <h3 className="mb-5 font-semibold text-[#2C2053]">Posts Awaiting Approval</h3>

                    <div className="space-y-4">
                      {pendingPosts.map((post) => (
                        <div key={post.id} className="rounded-xl border border-gray-100 p-5">
                          <h4 className="font-semibold text-[#2C2053]">{post.title}</h4>
                          <p className="mt-2 whitespace-pre-line text-sm text-gray-600">{post.caption}</p>
                          <p className="mt-3 text-xs text-gray-400">{post.platform.join(", ")}</p>
                          {post.scheduled_at && <p className="mt-2 text-xs font-medium text-[#C39C49]">Planned for: {formatDateTime(post.scheduled_at)}</p>}
                          <div className="mt-4 flex flex-wrap gap-2">
                            <button className={primaryButton} onClick={() => reviewMarketingPost(post, "approved")}>Approve</button>
                            <button className="rounded-xl border border-red-200 px-4 py-2 text-sm text-red-600" onClick={() => reviewMarketingPost(post, "rejected")}>Reject</button>
                            <button className={secondaryButton} onClick={() => editPost(post)}>Edit Post</button>
                          </div>
                        </div>
                      ))}
                      {pendingPosts.length === 0 && <p className="text-sm text-gray-400">There are no posts awaiting approval.</p>}
                    </div>
                  </section>

                  <section className="mt-7 rounded-2xl bg-white p-6 shadow-sm">
                    <h3 className="mb-4 font-semibold text-[#2C2053]">Approval History</h3>
                    <div className="space-y-3">
                      {approvalRecords.map((record) => (
                        <div key={record.id} className="flex flex-wrap justify-between gap-3 border-b border-gray-100 pb-3">
                          <div>
                            <p className="font-medium">{record.title}</p>
                            <p className="text-xs text-gray-400">{new Date(record.created_at).toLocaleDateString()}</p>
                          </div>
                          <span className="text-xs capitalize text-[#C39C49]">{record.status}</span>
                        </div>
                      ))}
                      {approvalRecords.length === 0 && <p className="text-sm text-gray-400">No approval history yet.</p>}
                    </div>
                  </section>
                </>
              )}

              {/* AI OPERATIONS DIRECTOR */}

              {activePage === "AI Operations Director" && (
                <>
                  <SectionHeading
                    title="AI Operations Director"
                    description="Your EventBliss business command centre. Monitor operations, identify issues and take action."
                  />

                  {/* DAILY BUSINESS SUMMARY */}

                  <section className="rounded-2xl bg-[#2C2053] p-6 text-white shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C39C49]">
                          EventBliss Daily Intelligence
                        </p>

                        <h3 className="mt-2 text-2xl font-bold">
                          Good {
  currentTime.getHours() < 12
    ? "morning"
    : currentTime.getHours() < 17
      ? "afternoon"
      : "evening"
}!
                        </h3>

                        <p className="mt-2 text-sm text-white/70">
                          Here is what is happening across your business.
                        </p>
                      </div>

                      <div className="rounded-xl border border-[#C39C49]/50 bg-white/5 px-5 py-3">
                        <p className="text-xs text-white/60">Operations status</p>
                        <p className="mt-1 font-semibold text-[#E7D4A5]">
                          {operationsStatus}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      {[
                        {
                          label: "Upcoming Events",
                          value: upcomingEvents.length,
                          icon: "✧",
                        },
                        {
                          label: "Business Alerts",
                          value: operationsAlerts.length,
                          icon: "⚑",
                        },
                        {
                          label: "Pending Approvals",
                          value: postsAwaitingApproval.length,
                          icon: "✓",
                        },
                        {
                          label: "Recommended Actions",
                          value: recommendedActions.length,
                          icon: "→",
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="rounded-xl border border-white/10 bg-white/10 p-4"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-white/70">
                              {item.label}
                            </p>
                            <span className="text-xl text-[#C39C49]">
                              {item.icon}
                            </span>
                          </div>

                          <p className="mt-3 text-3xl font-bold">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* BUSINESS HEALTH */}

                  <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard title="Total Clients" value={clients.length} icon="♡" />

                    <StatCard
                      title="Active Events"
                      value={events.filter(
                        (record) =>
                          record.status !== "completed" &&
                          record.status !== "cancelled"
                      ).length}
                      icon="✧"
                    />

                    <StatCard title="Marketing Posts" value={posts.length} icon="✎" />

                    <StatCard title="Published Posts" value={publishedPosts.length} icon="↗" />
                  </div>

                  {/* RECOMMENDED ACTIONS */}

                  <section className="mt-7 rounded-2xl bg-white p-6 shadow-sm">
                    <div className="mb-5">
                      <h3 className="text-lg font-semibold text-[#2C2053]">
                        ✧ Recommended Actions
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Suggested next steps based on your current business records.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {recommendedActions.map((action, index) => (
                        <div
                          key={`${action.title}-${index}`}
                          className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-100 p-4"
                        >
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F7F5FA] font-semibold text-[#C39C49]">
                              {index + 1}
                            </div>

                            <div>
                              <p className="font-semibold text-[#2C2053]">
                                {action.title}
                              </p>

                              <p className="mt-1 text-sm text-gray-500">
                                {action.description}
                              </p>
                            </div>
                          </div>

                          <button
                            className={secondaryButton}
                            onClick={() => {
                              setActivePage(action.page);
                              setMessage("");
                              setError("");
                            }}
                          >
                            Take Action →
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* BUSINESS ALERTS */}

                  <section className="mt-7 rounded-2xl bg-white p-6 shadow-sm">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-[#2C2053]">
                          Business Alerts
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          Issues and incomplete records that may need your attention.
                        </p>
                      </div>

                      <span className="rounded-full bg-[#F7F5FA] px-3 py-1 text-xs font-semibold text-[#2C2053]">
                        {operationsAlerts.length} alerts
                      </span>
                    </div>

                    <div className="space-y-3">
                      {operationsAlerts.map((alert) => (
                        <div
                          key={alert.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 p-4"
                        >
                          <div className="flex min-w-0 items-start gap-3">
                            <span
                              className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                                alert.priority === "high"
                                  ? "bg-red-500"
                                  : alert.priority === "medium"
                                    ? "bg-amber-400"
                                    : "bg-gray-400"
                              }`}
                            />

                            <div>
                              <p className="font-semibold text-[#2C2053]">
                                {alert.title}
                              </p>

                              <p className="mt-1 text-sm text-gray-500">
                                {alert.description}
                              </p>

                              <p className="mt-2 text-xs font-semibold uppercase text-gray-400">
                                {alert.priority} priority
                              </p>
                            </div>
                          </div>

                          <button
                            className={secondaryButton}
                            onClick={() => {
                              setActivePage(alert.action);
                              setMessage("");
                              setError("");
                            }}
                          >
                            Review →
                          </button>
                        </div>
                      ))}

                      {operationsAlerts.length === 0 && (
                        <div className="rounded-xl bg-[#FBF9F3] p-6 text-center">
                          <p className="text-lg font-semibold text-[#2C2053]">
                            ✧ All clear!
                          </p>

                          <p className="mt-2 text-sm text-gray-500">
                            No outstanding business alerts were found in your current records.
                          </p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* UPCOMING EVENTS */}

                  <section className="mt-7 rounded-2xl bg-white p-6 shadow-sm">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-[#2C2053]">
                          Upcoming Events
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          Events scheduled over the next 30 days.
                        </p>
                      </div>

                      <button
                        className={secondaryButton}
                        onClick={() => setActivePage("Clients & Events")}
                      >
                        Manage Events →
                      </button>
                    </div>

                    <div className="space-y-3">
                      {upcomingEvents.map((record) => {
                        const client = clients.find(
                          (item) => item.id === record.client_id
                        );

                        return (
                          <div
                            key={record.id}
                            className="rounded-xl border border-gray-100 p-4"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-[#2C2053]">
                                  {record.event_name}
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                  {new Date(
                                    `${record.event_date}T00:00:00`
                                  ).toLocaleDateString([], {
                                    dateStyle: "long",
                                  })}
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                  {record.venue || "Venue not set"}
                                  {" · "}
                                  {client?.full_name || "No client linked"}
                                </p>
                              </div>

                              <span className="rounded-full bg-[#F7F5FA] px-3 py-1 text-xs font-semibold capitalize text-[#2C2053]">
                                {record.status.replaceAll("_", " ")}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {upcomingEvents.length === 0 && (
                        <p className="rounded-xl bg-[#F7F5FA] p-5 text-center text-sm text-gray-500">
                          No upcoming events within the next 30 days.
                        </p>
                      )}
                    </div>
                  </section>

                  {/* MARKETING OPERATIONS */}

                  <section className="mt-7 rounded-2xl bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-[#2C2053]">
                      Marketing Operations
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Your current social media content workflow.
                    </p>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      {[
                        {
                          title: "Drafts",
                          value: posts.filter((post) => post.status === "draft").length,
                        },
                        {
                          title: "Awaiting Approval",
                          value: pendingPosts.length,
                        },
                        {
                          title: "Ready to Publish",
                          value: approvedPosts.length,
                        },
                        {
                          title: "Published",
                          value: publishedPosts.length,
                        },
                      ].map((item) => (
                        <div
                          key={item.title}
                          className="rounded-xl border border-gray-100 p-4"
                        >
                          <p className="text-sm text-gray-500">
                            {item.title}
                          </p>

                          <p className="mt-2 text-2xl font-bold text-[#2C2053]">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <button
                        className={primaryButton}
                        onClick={() => setActivePage("Marketing Studio")}
                      >
                        Create Marketing Content
                      </button>

                      <button
                        className={secondaryButton}
                        onClick={() => setActivePage("Approval Centre")}
                      >
                        Review Approvals
                      </button>

                      <button
                        className={secondaryButton}
                        onClick={() => setActivePage("Publishing Queue")}
                      >
                        Open Publishing Queue
                      </button>
                    </div>
                  </section>

                  {/* HOW THE DIRECTOR WORKS */}

                  <section className="mt-7 rounded-2xl border border-[#C39C49]/30 bg-[#FBF9F3] p-5">
                    <h3 className="font-semibold text-[#2C2053]">
                      About your AI Operations Director
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      This first version automatically reviews your EventBliss
                      database and identifies operational issues, upcoming events
                      and marketing tasks using business rules. It does not yet
                      connect to an external AI model. Recommendations are
                      suggestions only. You remain in control of all business
                      decisions, approvals and publishing actions.
                    </p>
                  </section>
                </>
              )}

              {/* PUBLISHING QUEUE */}

              {activePage === "Publishing Queue" && (
                <>
                  <SectionHeading
                    title="Publishing Queue"
                    description="Manage approved EventBliss content before and after publishing."
                  />

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard title="Scheduled Posts" value={scheduledQueuePosts.length} icon="▦" />
                    <StatCard title="Ready to Publish" value={readyQueuePosts.length} icon="✓" />
                    <StatCard title="Published Posts" value={publishedPosts.length} icon="↗" />
                    <StatCard title="Awaiting Approval" value={pendingPosts.length} icon="✧" />
                  </div>

                  {/* SCHEDULED POSTS */}

                  <section className="mt-7 rounded-2xl bg-white p-6 shadow-sm">
                    <div className="mb-5">
                      <h3 className="font-semibold text-[#2C2053]">Scheduled Posts</h3>
                      <p className="mt-1 text-xs text-gray-500">Approved posts with a planned publishing date.</p>
                    </div>

                    <div className="space-y-4">
                      {scheduledQueuePosts
                        .slice()
                        .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())
                        .map((post) => (
                          <div key={post.id} className="rounded-xl border border-gray-100 p-5">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div className="min-w-0">
                                <h4 className="font-semibold text-[#2C2053]">{post.title}</h4>
                                <p className="mt-2 text-sm text-gray-500">{post.platform.join(", ")}</p>
                                <p className="mt-2 text-sm font-medium text-[#C39C49]">{formatDateTime(post.scheduled_at)}</p>
                                <span className="mt-3 inline-block rounded-full bg-[#F7F5FA] px-3 py-1 text-xs font-medium capitalize text-[#2C2053]">{post.status.replaceAll("_", " ")}</span>
                              </div>

                              <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                                <button className={secondaryButton} onClick={() => copyPostCaption(post)}>Copy Caption</button>
                                <button className={secondaryButton} onClick={() => downloadPostGraphic(post)}>Download Graphic</button>
                                <button className={secondaryButton} onClick={() => editPost(post)}>Edit / Reschedule</button>
                                <button className={primaryButton} onClick={() => markPostAsPublished(post)}>Mark as Published</button>
                              </div>
                            </div>

                            <details className="mt-4 border-t border-gray-100 pt-3">
                              <summary className="cursor-pointer text-sm font-medium text-[#2C2053]">View Caption</summary>
                              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-600">{post.caption}</p>
                            </details>
                          </div>
                        ))}

                      {scheduledQueuePosts.length === 0 && <p className="text-sm text-gray-400">No approved scheduled posts yet.</p>}
                    </div>
                  </section>

                  {/* READY TO PUBLISH */}

                  <section className="mt-7 rounded-2xl bg-white p-6 shadow-sm">
                    <div className="mb-5">
                      <h3 className="font-semibold text-[#2C2053]">Ready to Publish</h3>
                      <p className="mt-1 text-xs text-gray-500">Approved posts that do not have a scheduled date.</p>
                    </div>

                    <div className="space-y-4">
                      {readyQueuePosts.map((post) => (
                        <div key={post.id} className="rounded-xl border border-gray-100 p-5">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="min-w-0">
                              <h4 className="font-semibold text-[#2C2053]">{post.title}</h4>
                              <p className="mt-2 text-sm text-gray-500">{post.platform.join(", ")}</p>
                              <span className="mt-3 inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">Approved — ready to publish</span>
                            </div>

                            <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                              <button className={secondaryButton} onClick={() => copyPostCaption(post)}>Copy Caption</button>
                              <button className={secondaryButton} onClick={() => downloadPostGraphic(post)}>Download Graphic</button>
                              <button className={secondaryButton} onClick={() => editPost(post)}>Edit</button>
                              <button className={primaryButton} onClick={() => markPostAsPublished(post)}>Mark as Published</button>
                            </div>
                          </div>

                          <details className="mt-4 border-t border-gray-100 pt-3">
                            <summary className="cursor-pointer text-sm font-medium text-[#2C2053]">View Caption</summary>
                            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-600">{post.caption}</p>
                          </details>
                        </div>
                      ))}

                      {readyQueuePosts.length === 0 && <p className="text-sm text-gray-400">No approved posts waiting to be published.</p>}
                    </div>
                  </section>

                  {/* PUBLISHED POSTS */}

                  <section className="mt-7 rounded-2xl bg-white p-6 shadow-sm">
                    <div className="mb-5">
                      <h3 className="font-semibold text-[#2C2053]">Published Posts</h3>
                      <p className="mt-1 text-xs text-gray-500">Your history of posts manually marked as published.</p>
                    </div>

                    <div className="space-y-4">
                      {publishedPosts.map((post) => (
                        <div key={post.id} className="rounded-xl border border-gray-100 p-5">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                              <h4 className="font-semibold text-[#2C2053]">{post.title}</h4>
                              <p className="mt-2 text-sm text-gray-500">{post.platform.join(", ")}</p>
                              <span className="mt-3 inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">Published</span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <button className={secondaryButton} onClick={() => copyPostCaption(post)}>Copy Caption</button>
                              <button className={secondaryButton} onClick={() => downloadPostGraphic(post)}>Download Graphic</button>
                            </div>
                          </div>

                          <details className="mt-4 border-t border-gray-100 pt-3">
                            <summary className="cursor-pointer text-sm font-medium text-[#2C2053]">View Caption</summary>
                            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-600">{post.caption}</p>
                          </details>
                        </div>
                      ))}

                      {publishedPosts.length === 0 && <p className="text-sm text-gray-400">Your published post history will appear here.</p>}
                    </div>
                  </section>

                  <div className="mt-7 rounded-xl border border-[#C39C49]/30 bg-[#FBF9F3] p-5">
                    <h3 className="font-semibold text-[#2C2053]">Important publishing information</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      EventBliss AI HQ currently prepares and organizes your content.
                      You must manually publish posts through Instagram or Facebook.
                      Use Copy Caption and Download Graphic to prepare each post.
                      Mark as Published only after you have actually published it.
                      Automatic social media publishing is not connected yet.
                    </p>
                  </div>
                </>
              )}

              {/* SETTINGS */}

              {activePage === "Settings" && (
                <>
                  <SectionHeading
                    title="Settings"
                    description="Manage the identity and business information for your private EventBliss AI HQ workspace."
                  />

                  {settingsLoading ? (
                    <div className="rounded-2xl bg-white p-8 text-sm text-gray-500 shadow-sm">Loading workspace settings…</div>
                  ) : (
                    <form onSubmit={saveWorkspaceSettings} className="space-y-6">
                      <section className="rounded-2xl bg-white p-6 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-[#2C2053]">Workspace identity</h3>
                            <p className="mt-1 text-sm text-gray-500">The name and identity displayed inside your private dashboard.</p>
                          </div>
                          <span className="rounded-full bg-[#F7F5FA] px-3 py-1 text-xs font-semibold text-[#2C2053]">Private workspace</span>
                        </div>
                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                          <label className="block text-sm font-medium text-gray-700">Workspace name
                            <input required className={fieldClass + " mt-2"} value={workspaceSettings.workspace_name} onChange={(e) => setWorkspaceSettings((p) => ({ ...p, workspace_name: e.target.value }))} />
                          </label>
                          <label className="block text-sm font-medium text-gray-700">Business name
                            <input required className={fieldClass + " mt-2"} value={workspaceSettings.business_name} onChange={(e) => setWorkspaceSettings((p) => ({ ...p, business_name: e.target.value }))} />
                          </label>
                        </div>
                      </section>

                      <section className="rounded-2xl bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-[#2C2053]">Business contact information</h3>
                        <p className="mt-1 text-sm text-gray-500">These details can be used in your business documents and workspace.</p>
                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                          <label className="block text-sm font-medium text-gray-700">Business email
                            <input type="email" className={fieldClass + " mt-2"} value={workspaceSettings.email} onChange={(e) => setWorkspaceSettings((p) => ({ ...p, email: e.target.value }))} placeholder="hello@example.com" />
                          </label>
                          <label className="block text-sm font-medium text-gray-700">Business phone
                            <input type="tel" className={fieldClass + " mt-2"} value={workspaceSettings.phone} onChange={(e) => setWorkspaceSettings((p) => ({ ...p, phone: e.target.value }))} placeholder="Enter business phone" />
                          </label>
                          <label className="block text-sm font-medium text-gray-700 md:col-span-2">Business location
                            <input className={fieldClass + " mt-2"} value={workspaceSettings.location} onChange={(e) => setWorkspaceSettings((p) => ({ ...p, location: e.target.value }))} />
                          </label>
                          <label className="block text-sm font-medium text-gray-700 md:col-span-2">Website
                            <input type="url" className={fieldClass + " mt-2"} value={workspaceSettings.website} onChange={(e) => setWorkspaceSettings((p) => ({ ...p, website: e.target.value }))} />
                          </label>
                        </div>
                      </section>

                      <section className="rounded-2xl bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-[#2C2053]">Logo and brand identity</h3>
                        <p className="mt-1 text-sm text-gray-500">Use your EventBliss logo URL and the official brand colours.</p>
                        <div className="mt-5 flex flex-wrap items-center gap-5 rounded-xl border border-gray-100 p-4">
                          <div className="flex h-24 w-40 items-center justify-center rounded-lg bg-[#FBF9F3] p-3">
                            {workspaceSettings.logo_url ? <img src={workspaceSettings.logo_url} alt="EventBliss logo preview" className="max-h-full max-w-full object-contain" /> : <span className="text-sm text-gray-400">Logo preview</span>}
                          </div>
                          <div className="min-w-0 flex-1">
                            <label className="block text-sm font-medium text-gray-700">Logo image URL
                              <input type="url" className={fieldClass + " mt-2"} value={workspaceSettings.logo_url} onChange={(e) => setWorkspaceSettings((p) => ({ ...p, logo_url: e.target.value }))} />
                            </label>
                          </div>
                        </div>
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                          <label className="block text-sm font-medium text-gray-700">Royal purple
                            <div className="mt-2 flex items-center gap-3">
                              <input type="color" className="h-11 w-16 cursor-pointer rounded-lg border border-gray-200 bg-white p-1" value={workspaceSettings.primary_color} onChange={(e) => setWorkspaceSettings((p) => ({ ...p, primary_color: e.target.value }))} />
                              <input className={fieldClass} value={workspaceSettings.primary_color} onChange={(e) => setWorkspaceSettings((p) => ({ ...p, primary_color: e.target.value }))} pattern="^#[0-9A-Fa-f]{6}$" />
                            </div>
                          </label>
                          <label className="block text-sm font-medium text-gray-700">Luxury gold
                            <div className="mt-2 flex items-center gap-3">
                              <input type="color" className="h-11 w-16 cursor-pointer rounded-lg border border-gray-200 bg-white p-1" value={workspaceSettings.accent_color} onChange={(e) => setWorkspaceSettings((p) => ({ ...p, accent_color: e.target.value }))} />
                              <input className={fieldClass} value={workspaceSettings.accent_color} onChange={(e) => setWorkspaceSettings((p) => ({ ...p, accent_color: e.target.value }))} pattern="^#[0-9A-Fa-f]{6}$" />
                            </div>
                          </label>
                        </div>
                        <div className="mt-5 flex flex-wrap gap-3">
                          <div className="rounded-xl border border-gray-100 p-3"><div className="h-10 w-20 rounded-lg" style={{ backgroundColor: workspaceSettings.primary_color }} /><p className="mt-2 text-xs text-gray-500">Purple · {workspaceSettings.primary_color}</p></div>
                          <div className="rounded-xl border border-gray-100 p-3"><div className="h-10 w-20 rounded-lg" style={{ backgroundColor: workspaceSettings.accent_color }} /><p className="mt-2 text-xs text-gray-500">Gold · {workspaceSettings.accent_color}</p></div>
                        </div>
                      </section>

                      <section className="rounded-2xl bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-[#2C2053]">Quotation and invoice footer</h3>
                        <p className="mt-1 text-sm text-gray-500">Optional text to include on future client documents. This does not send documents automatically.</p>
                        <textarea rows={3} className={fieldClass + " mt-4"} value={workspaceSettings.document_footer} onChange={(e) => setWorkspaceSettings((p) => ({ ...p, document_footer: e.target.value }))} placeholder="Thank you for choosing EventBliss." />
                      </section>

                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <p className="text-xs text-gray-500">Changes are saved securely to your Supabase workspace.</p>
                        <button type="submit" disabled={saving} className={primaryButton}>{saving ? "Saving settings…" : "Save Workspace Settings"}</button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
