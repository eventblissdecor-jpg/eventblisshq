"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Client = { id: string; full_name: string; email: string | null; phone: string | null; company: string | null };
type EventRecord = { id: string; event_name: string; client_id: string | null; event_date: string | null; venue: string | null };
type Item = { description: string; quantity: number; unit_price: number };
type Business = { name: string; email: string; phone: string; location: string; website: string; logo_url: string; document_footer: string };
type Doc = {
  id: string; document_number: string; document_type: "quotation" | "invoice";
  client_id: string | null; event_id: string | null;
  client_snapshot: { full_name: string; email: string; phone: string; company: string };
  business_details: Business; items: Item[]; issue_date: string; due_date: string | null;
  valid_until: string | null; status: string; subtotal: number; tax_rate: number;
  tax_amount: number; total: number; amount_paid: number; notes: string | null; created_at: string;
};

const LOGO = "https://eventbliss.ca/assets/eventbliss-logo.png";
const defaultBusiness: Business = { name: "EventBliss", email: "eventblissdecor@gmail.com", phone: "", location: "Kamloops, British Columbia, Canada", website: "https://eventbliss.ca", logo_url: LOGO, document_footer: "" };
const field = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#C39C49]";
const primary = "rounded-xl bg-[#2C2053] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#40316f] disabled:opacity-50";
const secondary = "rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-[#C39C49]";
const today = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
const money = (n: number) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(Number(n || 0));
const numberFor = (type: "quotation" | "invoice") => (type === "quotation" ? "EB-Q-" : "EB-INV-") + today().replaceAll("-", "") + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] || c));

export default function DocumentsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [kind, setKind] = useState<"quotation" | "invoice">("quotation");
  const [clientId, setClientId] = useState("");
  const [eventId, setEventId] = useState("");
  const [issueDate, setIssueDate] = useState("2000-01-01");
  const [dueDate, setDueDate] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [taxRate, setTaxRate] = useState("0");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<Item[]>([{ description: "", quantity: 1, unit_price: 0 }]);
  const [business, setBusiness] = useState<Business>(defaultBusiness);

  async function load() {
    setLoading(true);
    const [c, e, d, settings] = await Promise.all([
      supabase.from("clients").select("id,full_name,email,phone,company").order("full_name"),
      supabase.from("events").select("id,event_name,client_id,event_date,venue").order("event_date", { ascending: false }),
      supabase.from("event_documents").select("*").order("created_at", { ascending: false }),
      supabase.from("workspace_settings").select("business_name,email,phone,location,website,logo_url,document_footer").eq("id", "eventbliss").maybeSingle(),
    ]);
    if (c.error) setError(c.error.message); else setClients((c.data || []) as Client[]);
    if (e.error) setError(e.error.message); else setEvents((e.data || []) as EventRecord[]);
    if (d.error) setError(d.error.message); else setDocs((d.data || []) as Doc[]);
    if (settings.error) setError(settings.error.message);
    else if (settings.data) setBusiness({
      name: settings.data.business_name || defaultBusiness.name,
      email: settings.data.email || defaultBusiness.email,
      phone: settings.data.phone || "",
      location: settings.data.location || defaultBusiness.location,
      website: settings.data.website || defaultBusiness.website,
      logo_url: settings.data.logo_url || LOGO,
      document_footer: settings.data.document_footer || "",
    });
    setLoading(false);
  }

  useEffect(() => { setIssueDate(today()); load(); }, []);

  const client = clients.find((c) => c.id === clientId);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + Math.max(0, Number(item.quantity) || 0) * Math.max(0, Number(item.unit_price) || 0), 0), [items]);
  const rate = Math.max(0, Number(taxRate) || 0);
  const tax = subtotal * rate / 100;
  const total = subtotal + tax;

  function reset() {
    setKind("quotation"); setClientId(""); setEventId(""); setIssueDate(today());
    setDueDate(""); setValidUntil(""); setTaxRate("0"); setNotes("");
    setItems([{ description: "", quantity: 1, unit_price: 0 }]);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice("");
    if (!client) { setError("Please select a client."); return; }
    if (items.length === 0 || items.some((i) => !i.description.trim() || i.quantity <= 0 || i.unit_price < 0)) {
      setError("Add at least one item with a description, positive quantity and valid price."); return;
    }
    setSaving(true);
    const payload = {
      document_number: numberFor(kind), document_type: kind, client_id: client.id, event_id: eventId || null,
      client_snapshot: { full_name: client.full_name, email: client.email || "", phone: client.phone || "", company: client.company || "" },
      business_details: business, items: items.map((i) => ({ ...i, description: i.description.trim() })),
      issue_date: issueDate, due_date: kind === "invoice" ? dueDate || null : null,
      valid_until: kind === "quotation" ? validUntil || null : null, status: "draft",
      subtotal, tax_rate: rate, tax_amount: tax, total, amount_paid: 0, notes: notes.trim() || null,
    };
    const result = await supabase.from("event_documents").insert(payload).select("*").single();
    setSaving(false);
    if (result.error) { setError(result.error.message); return; }
    setDocs((old) => [result.data as Doc, ...old]); setNotice("Your " + kind + " has been saved."); reset();
  }

  async function convertToInvoice(quote: Doc) {
    if (!window.confirm("Create an invoice from " + quote.document_number + "?")) return;
    const payload = {
      document_number: numberFor("invoice"), document_type: "invoice", client_id: quote.client_id, event_id: quote.event_id,
      client_snapshot: quote.client_snapshot, business_details: quote.business_details, items: quote.items,
      issue_date: today(), due_date: null, valid_until: null, status: "draft", subtotal: quote.subtotal,
      tax_rate: quote.tax_rate, tax_amount: quote.tax_amount, total: quote.total, amount_paid: 0, notes: quote.notes,
    };
    const created = await supabase.from("event_documents").insert(payload).select("*").single();
    if (created.error) { setError(created.error.message); return; }
    const updated = await supabase.from("event_documents").update({ status: "accepted" }).eq("id", quote.id);
    if (updated.error) setError("Invoice created, but quotation status update failed: " + updated.error.message);
    else setNotice("Invoice created from " + quote.document_number + ".");
    await load();
  }

  async function setStatus(doc: Doc, status: string) {
    const result = await supabase.from("event_documents").update({ status }).eq("id", doc.id);
    if (result.error) setError(result.error.message); else { setNotice("Document status updated."); await load(); }
  }

  async function payment(doc: Doc) {
    const balance = Number(doc.total) - Number(doc.amount_paid);
    const input = window.prompt("Payment received in CAD. Outstanding: " + money(balance), "0");
    if (input === null) return;
    const amount = Number(input);
    if (!Number.isFinite(amount) || amount <= 0 || amount > balance) { setError("Enter a payment greater than zero and no more than the outstanding balance."); return; }
    const paid = Number(doc.amount_paid) + amount;
    const result = await supabase.from("event_documents").update({ amount_paid: paid, status: paid >= Number(doc.total) ? "paid" : "partially_paid" }).eq("id", doc.id);
    if (result.error) setError(result.error.message); else { setNotice("Payment recorded."); await load(); }
  }

  function printDoc(doc: Doc) {
    const event = events.find((e) => e.id === doc.event_id);
    const businessInfo = doc.business_details || defaultBusiness;
    const rows = (doc.items || []).map((item) =>
      "<tr><td>" + escapeHtml(item.description) + "</td><td class='right'>" + item.quantity + "</td><td class='right'>" + money(item.unit_price) + "</td><td class='right'>" + money(item.quantity * item.unit_price) + "</td></tr>"
    ).join("");
    const html = "<!doctype html><html><head><meta charset='utf-8'><title>" + escapeHtml(doc.document_number) + "</title><style>" +
      "body{font-family:Arial,sans-serif;color:#302b38;margin:36px}header{display:flex;justify-content:space-between;border-bottom:4px solid #C39C49;padding-bottom:20px}img{width:190px;height:115px;object-fit:contain;object-position:left}h1{color:#2C2053;text-transform:uppercase}small,p{line-height:1.5;color:#555}.cols{display:flex;justify-content:space-between;margin:28px 0}table{width:100%;border-collapse:collapse;margin-top:20px}th{background:#2C2053;color:white;text-align:left;padding:12px}td{padding:12px;border-bottom:1px solid #ddd}.right{text-align:right}.totals{margin:24px 0 0 auto;width:280px}.totals div{display:flex;justify-content:space-between;padding:6px}.grand{border-top:2px solid #C39C49;color:#2C2053;font-weight:bold;font-size:19px}.notes{border:1px solid #ddd;padding:14px;margin-top:30px;white-space:pre-wrap}.footer{text-align:center;border-top:1px solid #C39C49;margin-top:55px;padding-top:18px;color:#555;font-size:12px}@media print{body{margin:15mm}}</style></head><body>" +
      "<header><div><img src='" + escapeHtml(businessInfo.logo_url || LOGO) + "'><p><b>" + escapeHtml(businessInfo.name) + "</b><br>" + escapeHtml(businessInfo.location) + "<br>" + escapeHtml(businessInfo.email) + "<br>" + escapeHtml(businessInfo.phone) + "<br>" + escapeHtml(businessInfo.website) + "</p></div>" +
      "<div style='text-align:right'><h1>" + doc.document_type + "</h1><b>" + escapeHtml(doc.document_number) + "</b><p>Issue date: " + doc.issue_date + (doc.due_date ? "<br>Due date: " + doc.due_date : "") + (doc.valid_until ? "<br>Valid until: " + doc.valid_until : "") + "</p></div></header>" +
      "<div class='cols'><div><small>PREPARED FOR</small><p><b>" + escapeHtml(doc.client_snapshot.full_name) + "</b><br>" + escapeHtml(doc.client_snapshot.company || "") + "<br>" + escapeHtml(doc.client_snapshot.email || "") + "<br>" + escapeHtml(doc.client_snapshot.phone || "") + "</p></div><div><small>EVENT DETAILS</small><p><b>" + escapeHtml(event?.event_name || "Event services") + "</b><br>" + escapeHtml(event?.event_date || "") + "<br>" + escapeHtml(event?.venue || "") + "</p></div></div>" +
      "<table><thead><tr><th>Description</th><th class='right'>Qty</th><th class='right'>Unit price</th><th class='right'>Amount</th></tr></thead><tbody>" + rows + "</tbody></table>" +
      "<div class='totals'><div><span>Subtotal</span><b>" + money(Number(doc.subtotal)) + "</b></div><div><span>Tax (" + Number(doc.tax_rate).toFixed(2) + "%)</span><b>" + money(Number(doc.tax_amount)) + "</b></div><div class='grand'><span>Total CAD</span><b>" + money(Number(doc.total)) + "</b></div>" +
      (doc.document_type === "invoice" ? "<div><span>Paid</span><b>" + money(Number(doc.amount_paid)) + "</b></div><div><span>Balance due</span><b>" + money(Math.max(0, Number(doc.total) - Number(doc.amount_paid))) + "</b></div>" : "") + "</div>" +
      (doc.notes ? "<div class='notes'><b>Notes & payment instructions</b><br>" + escapeHtml(doc.notes) + "</div>" : "") +
      "<div class='footer'>" + (businessInfo.document_footer ? escapeHtml(businessInfo.document_footer) + "<br>" : "Thank you for considering EventBliss. We look forward to making your event beautiful.<br>") + "<b>eventbliss.ca · Kamloops, British Columbia</b></div>" +
      "<script>window.onload=function(){window.print();}</script></body></html>";
    const popup = window.open("", "_blank", "width=900,height=700");
    if (!popup) { setError("Your browser blocked the print window. Allow pop-ups for this site and try again."); return; }
    popup.document.open(); popup.document.write(html); popup.document.close();
  }

  const quotes = docs.filter((d) => d.document_type === "quotation");
  const invoices = docs.filter((d) => d.document_type === "invoice");

  return (
    <div className="min-h-screen bg-[#F7F5FA] text-gray-800">
      <header className="border-b border-[#C39C49]/30 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-3"><img src={LOGO} alt="EventBliss logo" className="h-14 w-20 object-contain" /><div><p className="font-semibold text-[#2C2053]">Quotation & Invoice Manager</p><p className="text-xs text-gray-500">EventBliss AI · Purple & Gold</p></div></div>
          <Link href="/" className={secondary}>← Back to Dashboard</Link>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-7">
        <div className="mb-7 rounded-2xl bg-[#2C2053] p-6 text-white"><p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#DCC28B]">EventBliss · Kamloops, BC</p><h1 className="mt-2 text-2xl font-semibold">Quotations & Invoices</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">Create professional branded documents, save them securely and print or save as PDF for emailing to clients.</p></div>
        {notice && <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</div>}
        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-gray-500">All documents</p><p className="mt-2 text-3xl font-semibold text-[#2C2053]">{docs.length}</p></div>
          <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-gray-500">Quotations</p><p className="mt-2 text-3xl font-semibold text-[#2C2053]">{quotes.length}</p></div>
          <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-gray-500">Invoices</p><p className="mt-2 text-3xl font-semibold text-[#2C2053]">{invoices.length}</p></div>
        </div>
        <div className="mt-7 grid items-start gap-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
          <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-[#2C2053]">Create a document</h2><p className="mt-1 text-sm text-gray-500">Select a client, add services and review your totals.</p>
            <form onSubmit={save} className="mt-5 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium">Document type<select className={field + " mt-1"} value={kind} onChange={(e) => setKind(e.target.value as "quotation" | "invoice")}><option value="quotation">Quotation</option><option value="invoice">Invoice</option></select></label>
                <label className="text-sm font-medium">Client<select className={field + " mt-1"} value={clientId} onChange={(e) => setClientId(e.target.value)} required><option value="">Select a client</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}</select></label>
              </div>
              {client && <div className="rounded-xl bg-[#FBF9F3] p-3 text-sm"><b className="text-[#2C2053]">{client.full_name}</b><p className="text-gray-600">{client.email || "No email saved"}{client.phone ? " · " + client.phone : ""}</p></div>}
              <label className="block text-sm font-medium">Related event (optional)<select className={field + " mt-1"} value={eventId} onChange={(e) => setEventId(e.target.value)}><option value="">No event selected</option>{events.filter((e) => !clientId || e.client_id === clientId).map((e) => <option key={e.id} value={e.id}>{e.event_name}</option>)}</select></label>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="text-sm font-medium">Issue date<input className={field + " mt-1"} type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required /></label>
                {kind === "quotation" ? <label className="text-sm font-medium sm:col-span-2">Valid until<input className={field + " mt-1"} type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} /></label> : <label className="text-sm font-medium sm:col-span-2">Payment due date<input className={field + " mt-1"} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></label>}
              </div>
              <div><div className="mb-2 flex items-center justify-between"><h3 className="font-semibold text-[#2C2053]">Services & items</h3><button type="button" className={secondary} onClick={() => setItems((old) => [...old, { description: "", quantity: 1, unit_price: 0 }])}>+ Add item</button></div>
                <div className="space-y-3">{items.map((item, index) => <div key={index} className="grid gap-2 rounded-xl border border-gray-100 p-3 sm:grid-cols-[minmax(0,1fr)_75px_115px_32px]">
                  <input className={field} placeholder="Service description" value={item.description} onChange={(e) => setItems((old) => old.map((x, i) => i === index ? { ...x, description: e.target.value } : x))} required />
                  <input className={field} type="number" min="1" step="1" aria-label="Quantity" value={item.quantity} onChange={(e) => setItems((old) => old.map((x, i) => i === index ? { ...x, quantity: Number(e.target.value) } : x))} required />
                  <input className={field} type="number" min="0" step="0.01" aria-label="Unit price" value={item.unit_price} onChange={(e) => setItems((old) => old.map((x, i) => i === index ? { ...x, unit_price: Number(e.target.value) } : x))} required />
                  <button type="button" aria-label="Remove item" disabled={items.length === 1} className="rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600" onClick={() => setItems((old) => old.filter((_, i) => i !== index))}>×</button>
                </div>)}</div>
              </div>
              <label className="block text-sm font-medium">Tax rate (%) — configurable<input className={field + " mt-1"} type="number" min="0" max="100" step="0.01" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} /><span className="mt-1 block text-xs font-normal text-gray-500">Default is 0%. Select the applicable rate; no tax status is assumed.</span></label>
              <label className="block text-sm font-medium">Notes / payment instructions<textarea className={field + " mt-1"} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add terms, payment instructions or a personal message..." /></label>
              <div className="rounded-xl bg-[#FBF9F3] p-4 text-sm"><div className="flex justify-between py-1"><span>Subtotal</span><span>{money(subtotal)}</span></div><div className="flex justify-between py-1"><span>Tax ({rate.toFixed(2)}%)</span><span>{money(tax)}</span></div><div className="mt-2 flex justify-between border-t border-[#C39C49]/40 pt-3 text-lg font-bold text-[#2C2053]"><span>Total CAD</span><span>{money(total)}</span></div></div>
              <div className="flex flex-wrap gap-2"><button className={primary} type="submit" disabled={saving}>{saving ? "Saving..." : "Save " + kind}</button><button className={secondary} type="button" onClick={reset}>Clear form</button></div>
            </form>
          </section>
          <aside className="space-y-5">
            <section className="rounded-2xl bg-white p-5 shadow-sm"><h2 className="text-lg font-semibold text-[#2C2053]">Business details on documents</h2><p className="mt-1 text-sm text-gray-500">These are saved with each new document. Phone and street address are blank until provided.</p><div className="mt-4 space-y-3">
              <label className="block text-xs font-semibold text-gray-600">Business name<input className={field + " mt-1"} value={business.name} onChange={(e) => setBusiness({ ...business, name: e.target.value })} /></label>
              <label className="block text-xs font-semibold text-gray-600">Email<input className={field + " mt-1"} type="email" value={business.email} onChange={(e) => setBusiness({ ...business, email: e.target.value })} /></label>
              <label className="block text-xs font-semibold text-gray-600">Phone<input className={field + " mt-1"} value={business.phone} onChange={(e) => setBusiness({ ...business, phone: e.target.value })} placeholder="Add business phone" /></label>
              <label className="block text-xs font-semibold text-gray-600">Business location<input className={field + " mt-1"} value={business.location} onChange={(e) => setBusiness({ ...business, location: e.target.value })} /></label>
              <label className="block text-xs font-semibold text-gray-600">Website<input className={field + " mt-1"} value={business.website} onChange={(e) => setBusiness({ ...business, website: e.target.value })} /></label>
            </div><div className="mt-4 flex items-center gap-3 rounded-xl bg-[#2C2053] p-3 text-white"><img src={business.logo_url} alt="EventBliss logo" className="h-16 w-24 rounded bg-white object-contain p-1" /><div><p className="font-semibold">Official EventBliss logo</p><p className="text-xs text-white/70">From eventbliss.ca</p></div></div></section>
            <section className="rounded-2xl bg-white p-5 shadow-sm"><h2 className="text-lg font-semibold text-[#2C2053]">Saved documents</h2><p className="mt-1 text-sm text-gray-500">Print or save as PDF, update status, convert quotations and record invoice payments.</p>
              {loading ? <p className="mt-4 text-sm text-gray-400">Loading...</p> : <div className="mt-4 space-y-3">{docs.map((doc) => <div key={doc.id} className="rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-[#2C2053]">{doc.document_number}</p><p className="mt-1 text-xs capitalize text-gray-500">{doc.document_type} · {doc.client_snapshot?.full_name || "Client"}</p><p className="mt-2 text-lg font-bold text-[#2C2053]">{money(Number(doc.total))}</p></div><span className="rounded-full bg-[#FBF9F3] px-2.5 py-1 text-xs font-semibold capitalize text-[#6B5526]">{doc.status.replaceAll("_", " ")}</span></div>
                <div className="mt-3 flex flex-wrap gap-2"><button className={secondary} onClick={() => printDoc(doc)}>Print / Save PDF</button>{doc.document_type === "quotation" && doc.status !== "accepted" && <button className={primary} onClick={() => convertToInvoice(doc)}>Convert to invoice</button>}{doc.document_type === "invoice" && Number(doc.amount_paid) < Number(doc.total) && <button className={secondary} onClick={() => payment(doc)}>Record payment</button>}
                  <select className="rounded-xl border border-gray-200 px-2 py-2 text-xs" aria-label="Document status" value={doc.status} onChange={(e) => setStatus(doc, e.target.value)}>{(doc.document_type === "quotation" ? ["draft", "sent", "accepted", "rejected"] : ["draft", "sent", "partially_paid", "paid", "overdue"]).map((s) => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}</select>
                </div>{doc.document_type === "invoice" && <p className="mt-2 text-xs text-gray-500">Paid: {money(Number(doc.amount_paid))} · Balance: {money(Math.max(0, Number(doc.total) - Number(doc.amount_paid)))}</p>}
              </div>)}{docs.length === 0 && <p className="rounded-xl bg-[#FBF9F3] p-4 text-sm text-gray-500">No documents saved yet. Create your first quotation or invoice.</p>}</div>}
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
