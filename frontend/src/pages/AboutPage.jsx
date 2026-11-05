import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { BookOpen, Heart, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { PageShell } from "../components/SiteNav";
import { ToyButton } from "../components/ToyButton";
import { supabase } from "../lib/supabase";

const ContactForm = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle");
  const submit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    const { error } = await supabase.from("contact_messages").insert({ name: form.name.trim(), email: form.email.trim(), message: form.message.trim() });
    setStatus(error ? "error" : "sent");
    if (!error) setForm({ name: "", email: "", message: "" });
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

const VISION_POINTS = [
  { icon: Sparkles, title: "Joy first", desc: "Learning feels like play, with praise for effort and gentle hints instead of pressure.", bg: "bg-hc-corallight" },
  { icon: BookOpen, title: "Grows with your child", desc: "From first letters in Kindergarten to algebra, coding and creative projects in Grade 8.", bg: "bg-hc-skylight" },
  { icon: ShieldCheck, title: "Safe by design", desc: "No ads, chat, public profiles or location tracking. Voices are never recorded.", bg: "bg-hc-mintlight" },
  { icon: Heart, title: "Inspired by love", desc: "Built on the belief that every child deserves the joy and confidence of learning.", bg: "bg-hc-lavlight" },
];

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
            <p className="mt-4 text-lg font-semibold">HappyKids is a character-driven learning ecosystem designed to grow with your child from Kindergarten through Grade 8. Inspired by a father's love and the belief that every child deserves the joy of learning, we blend games, stories, music, voice interaction and friendly characters so children can practise reading, numbers, science, creativity and more at their own pace.</p>
            <p className="mt-3 text-lg font-semibold">Today, our Kindergarten and Grade 1 experience is live with six learning worlds and over 20 activities. As children grow, new worlds, characters and advanced tools will join the journey — from coding and geography to financial literacy and entrepreneurship.</p>
          </div>
          <div className="flex items-end justify-center"><img src="/hk/finn.png" alt="Finn the Fox" className="w-1/2" /><img src="/hk/sunny.png" alt="Sunny the Chick" className="hc-float w-1/2" /></div>
        </section>
        <section className="mt-12 grid gap-5 md:grid-cols-2">
          {VISION_POINTS.map(({ icon: Icon, t, title, d, desc, bg }) => (
            <div key={title} className={`rounded-3xl border-[3px] border-hc-navy p-5 ${bg}`} style={{ boxShadow: "0 5px 0 #1F2547" }}>
              <Icon className="h-8 w-8" strokeWidth={2.5} /><h2 className="mt-2 font-fredoka text-2xl font-bold">{title}</h2><p className="font-semibold">{desc}</p>
            </div>
          ))}
        </section>
        <section className="mt-12 toy-card p-6 sm:p-10">
          <h2 className="font-fredoka text-4xl font-bold">Our Learning Journey</h2>
          <p className="mt-2 font-semibold">HappyKids is built in phases. Here is where we are headed.</p>
          <div className="mt-6 space-y-3">
            {[
              { phase: "Phase 1 (Now)", status: "In progress", desc: "New vision, six learning worlds, character companions and expanded Kindergarten experience.", color: "bg-hc-sunlight" },
              { phase: "Phase 2", status: "Next", desc: "Character voice integration, polished Kindergarten content, improved parent experience.", color: "bg-hc-mintlight" },
              { phase: "Phase 3", status: "Planned", desc: "Grades 1-2 pathways, adaptive learning recommendations, complete K world content.", color: "bg-hc-skylight" },
              { phase: "Phase 4", status: "Planned", desc: "Grades 3-4, coding world, geography, advanced science and interactive projects.", color: "bg-hc-tanglight" },
              { phase: "Phase 5", status: "Future", desc: "Grades 5-8, mature interface, entrepreneur tools and educator dashboard.", color: "bg-hc-lavlight" },
              { phase: "Phase 6", status: "Future", desc: "International curricula, multilingual support and scaled content management.", color: "bg-hc-corallight" },
            ].map((p) => (
              <div key={p.phase} className={`flex items-center gap-4 rounded-2xl border-[3px] border-hc-navy p-4 ${p.color}`} data-testid={`roadmap-${p.phase.split(" ")[1].toLowerCase().replace(/[()]/g, "")}`}>
                <span className="shrink-0 rounded-full border-[3px] border-hc-navy bg-white px-3 py-1 font-fredoka text-sm font-bold">{p.status}</span>
                <div><p className="font-fredoka text-lg font-bold">{p.phase}</p><p className="text-sm font-bold">{p.desc}</p></div>
              </div>
            ))}
          </div>
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
