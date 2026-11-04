import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Heart, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { PageShell } from "../components/SiteNav";
import { ToyButton } from "../components/ToyButton";
import { API } from "../context/AppState";

const ContactForm = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle");
  const submit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    const r = await fetch(`${API}/contact`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }).catch(() => null);
    setStatus(r?.ok ? "sent" : "error");
    if (r?.ok) setForm({ name: "", email: "", message: "" });
  };
  const input = "w-full rounded-2xl border-[3px] border-hc-navy bg-hc-cream px-4 py-3 font-bold outline-none focus:bg-white";
  return (
    <form onSubmit={submit} className="space-y-3" data-testid="contact-form">
      <input required placeholder="Your name (grown-ups only)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} data-testid="contact-name" />
      <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={input} data-testid="contact-email" />
      <textarea required rows={4} placeholder="How can we help?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={input} data-testid="contact-message" />
      <ToyButton type="submit" color="mint" className="w-full text-xl" disabled={status === "sending"} data-testid="contact-submit"><Mail className="h-5 w-5" /> {status === "sending" ? "Sending..." : "Send message"}</ToyButton>
      {status === "sent" && <p className="rounded-2xl bg-hc-mintlight p-3 font-bold" data-testid="contact-success">Thank you! We'll get back to you soon.</p>}
      {status === "error" && <p className="rounded-2xl bg-hc-corallight p-3 font-bold" data-testid="contact-error">Something went wrong. Please check the email and try again.</p>}
    </form>
  );
};

export default function AboutPage() {
  const { hash } = useLocation();
  useEffect(() => { if (hash) setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" }), 300); }, [hash]);
  return (
    <PageShell testId="about-page">
      <div className="mx-auto max-w-5xl">
        <section className="grid items-center gap-6 md:grid-cols-[1.4fr_1fr]">
          <div>
            <h1 className="font-fredoka text-5xl font-bold sm:text-6xl">About HappyKids</h1>
            <p className="mt-3 font-fredoka text-2xl font-semibold">Little minds. Big possibilities.</p>
            <p className="mt-4 text-lg font-semibold">HappyKids is a children's learning brand inspired by a father's love and the belief that every child deserves the joy of learning. We blend games, stories, sounds and friendly characters so children aged 4–7 can practise reading, numbers and discovery at their own pace.</p>
          </div>
          <div className="flex items-end justify-center"><img src="/hk/finn.png" alt="Finn the Fox" className="w-1/2" /><img src="/hk/sunny.png" alt="Sunny the Chick" className="hc-float w-1/2" /></div>
        </section>
        <section className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            { icon: Heart, t: "Joy first", d: "Learning feels like play, with praise for effort and gentle hints instead of pressure.", bg: "bg-hc-corallight" },
            { icon: Sparkles, t: "Real learning", d: "Activities follow early-years goals: counting, phonics, patterns, creativity and science.", bg: "bg-hc-skylight" },
            { icon: ShieldCheck, t: "Safe by design", d: "No ads, chat, public profiles or location tracking. Voices are never recorded.", bg: "bg-hc-mintlight" },
          ].map(({ icon: Icon, t, d, bg }) => (
            <div key={t} className={`rounded-3xl border-[3px] border-hc-navy p-5 ${bg}`} style={{ boxShadow: "0 5px 0 #1F2547" }}>
              <Icon className="h-8 w-8" strokeWidth={2.5} /><h2 className="mt-2 font-fredoka text-2xl font-bold">{t}</h2><p className="font-semibold">{d}</p>
            </div>
          ))}
        </section>
        <section id="contact" className="toy-card mt-12 scroll-mt-28 p-6 sm:p-10">
          <h2 className="font-fredoka text-4xl font-bold">Contact us</h2>
          <p className="mb-5 mt-2 font-semibold">For parents, guardians and educators. Please don't share children's personal details.</p>
          <ContactForm />
        </section>
      </div>
    </PageShell>
  );
}
