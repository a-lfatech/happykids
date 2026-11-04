import { useState } from "react";
import { BookOpen, Clock, Cloud, CloudOff, LogIn, LogOut, Plus, Target, ThumbsUp, Trash2, Trophy, UserRound } from "lucide-react";
import { useAppState } from "../context/AppState";
import { PageShell } from "../components/SiteNav";
import { PressHold } from "../components/PressHold";
import { ToyButton } from "../components/ToyButton";
import { Modal } from "../components/Modal";
import { SettingsToggles } from "../components/SettingsToggles";
import { CHARACTERS } from "../components/Characters";
import { ACTIVITIES, WORLDS, activitiesOf, activityById } from "../data/worlds";
import { skillOf } from "../games/logic";

const Stat = ({ label, value, testId, bg }) => (
  <div className={`rounded-2xl border-[3px] border-hc-navy p-4 ${bg}`} data-testid={testId}>
    <p className="font-fredoka text-3xl font-bold sm:text-4xl">{value}</p>
    <p className="text-sm font-bold">{label}</p>
  </div>
);

const OBJECTIVES = {
  "hop-and-count": "Counting forward and backward 1–10, missing numbers, one/two more and less.",
  "read-and-shine": "Upper and lowercase letters, beginning sounds, CVC words, listening comprehension.",
  "think-and-play": "Patterns, sorting, odd one out, shapes and visual memory.",
  "create-and-explore": "Colour names, following instructions, fine motor drawing.",
  "little-discoverers": "Animal homes, senses and body, weather, sky and plant needs.",
};

const Gate = ({ onOpen }) => (
  <div className="toy-card mx-auto max-w-lg p-8 text-center" data-testid="parent-gate">
    <UserRound className="mx-auto h-12 w-12" strokeWidth={2.5} />
    <h1 className="mt-3 font-fredoka text-4xl font-bold">Grown-ups only</h1>
    <p className="mt-2 font-bold">Press and hold the button for 3 seconds to open the parent area.</p>
    <div className="mt-6 flex justify-center"><PressHold onComplete={onOpen} testId="parent-gate-btn" /></div>
  </div>
);

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
const signIn = () => { window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(window.location.origin + "/parents")}`; };

const AccountCard = () => {
  const { user, logout, cloud } = useAppState();
  return (
    <section className="toy-card p-5 sm:p-6" data-testid="account-card">
      <h2 className="flex items-center gap-2 font-fredoka text-2xl font-bold">{user ? <Cloud className="h-6 w-6" /> : <CloudOff className="h-6 w-6" />} Parent account</h2>
      {user ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-bold" data-testid="account-email">Signed in as {user.name} ({user.email})</p>
            <p className="text-sm font-bold opacity-75" data-testid="cloud-status">Progress backup: {cloud === "saved" ? "saved to your account" : cloud === "syncing" ? "saving..." : cloud === "error" ? "could not save, will retry" : "ready"}</p>
          </div>
          <ToyButton color="white" onClick={logout} data-testid="logout-button"><LogOut className="h-5 w-5" /> Sign out</ToyButton>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-md font-bold">Progress is saved on this device. Sign in to back it up and use it on other devices. Children never need an account.</p>
          <ToyButton color="sky" onClick={signIn} data-testid="google-signin-button"><LogIn className="h-5 w-5" /> Sign in with Google</ToyButton>
        </div>
      )}
    </section>
  );
};

const ProfilesCard = () => {
  const { state, profile, addProfile, updateProfile, removeProfile, setActive } = useAppState();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("froggy");
  const [level, setLevel] = useState("K");
  const add = (e) => { e.preventDefault(); if (!name.trim()) return; addProfile(name.trim().slice(0, 20), avatar, level); setName(""); };
  return (
    <section className="toy-card p-5 sm:p-6" data-testid="profiles-card">
      <h2 className="font-fredoka text-2xl font-bold">Child profiles</h2>
      <p className="text-sm font-bold opacity-75">Use a nickname only. No other personal details are needed.</p>
      <ul className="mt-4 space-y-3">
        {state.profiles.map((p) => (
          <li key={p.id} className={`flex flex-wrap items-center gap-3 rounded-2xl border-[3px] border-hc-navy p-3 ${p.id === profile.id ? "bg-hc-sunlight" : "bg-hc-cream"}`} data-testid={`profile-row-${p.id}`}>
            <img src={CHARACTERS[p.avatar].img} alt="" className="h-12 w-12 object-contain" />
            <input value={p.name} onChange={(e) => updateProfile(p.id, { name: e.target.value.slice(0, 20) })} aria-label="Profile name" className="min-w-0 flex-1 rounded-xl border-[3px] border-hc-navy bg-white px-3 py-2 font-bold" data-testid={`profile-name-${p.id}`} />
            <select value={p.level} onChange={(e) => updateProfile(p.id, { level: e.target.value })} aria-label="Learning level" className="rounded-xl border-[3px] border-hc-navy bg-white px-2 py-2 font-bold" data-testid={`profile-level-${p.id}`}>
              <option value="K">Kindergarten</option><option value="G1">Grade 1</option>
            </select>
            {p.id !== profile.id && <ToyButton color="white" className="text-sm" onClick={() => setActive(p.id)} data-testid={`profile-select-${p.id}`}>Select</ToyButton>}
            {state.profiles.length > 1 && <button type="button" onClick={() => removeProfile(p.id)} aria-label={`Delete ${p.name}`} className="toy-btn bg-hc-corallight px-3" data-testid={`profile-delete-${p.id}`}><Trash2 className="h-5 w-5" /></button>}
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border-[3px] border-dashed border-hc-navy/50 p-3" data-testid="add-profile-form">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nickname" aria-label="New nickname" className="min-w-0 flex-1 rounded-xl border-[3px] border-hc-navy bg-white px-3 py-2 font-bold" data-testid="new-profile-name" />
        <select value={avatar} onChange={(e) => setAvatar(e.target.value)} aria-label="Buddy" className="rounded-xl border-[3px] border-hc-navy bg-white px-2 py-2 font-bold" data-testid="new-profile-avatar">
          {["hoppy", "froggy", "sunny"].map((c) => <option key={c} value={c}>{CHARACTERS[c].name}</option>)}
        </select>
        <select value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Level" className="rounded-xl border-[3px] border-hc-navy bg-white px-2 py-2 font-bold" data-testid="new-profile-level">
          <option value="K">Kindergarten</option><option value="G1">Grade 1</option>
        </select>
        <ToyButton type="submit" color="mint" data-testid="add-profile-button"><Plus className="h-5 w-5" /> Add</ToyButton>
      </form>
      <p className="mt-2 text-xs font-bold opacity-70">Kindergarten shows 3 answer choices; Grade 1 shows up to 4 and unlocks every story.</p>
    </section>
  );
};

const skillFor = (id, idx) => (id === "missing-numbers" || id === "more-or-less" ? skillOf(id, idx) : activityById(id).skill);

export default function ParentDashboard() {
  const { profile, pdata, resetProgress } = useAppState();
  const [open, setOpen] = useState(sessionStorage.getItem("hc_grownup") === "1");
  const [confirm, setConfirm] = useState(false);
  const unlock = () => { sessionStorage.setItem("hc_grownup", "1"); setOpen(true); };

  if (!open) return <PageShell testId="parents-locked"><Gate onOpen={unlock} /></PageShell>;

  const rows = ACTIVITIES.map((a) => {
    const pz = Object.values(pdata.games[a.id]?.puzzles || {});
    return { a, completed: pz.reduce((s, p) => s + p.completed, 0), firstTry: pz.reduce((s, p) => s + p.firstTry, 0), plays: pdata.games[a.id]?.plays || 0 };
  });
  const completed = rows.reduce((s, r) => s + r.completed, 0);
  const first = rows.reduce((s, r) => s + r.firstTry, 0);
  const accuracy = completed ? Math.round((first / completed) * 100) : 0;
  const skills = {};
  Object.entries(pdata.games).forEach(([id, g]) => activityById(id) && Object.entries(g.puzzles || {}).forEach(([idx, p]) => {
    const k = skillFor(id, Number(idx));
    skills[k] = skills[k] || { wrongs: 0, completed: 0, first: 0 };
    skills[k].wrongs += p.wrongs; skills[k].completed += p.completed; skills[k].first += p.firstTry;
  }));
  const list = Object.entries(skills);
  const practice = list.filter(([, v]) => v.wrongs > 0).sort((a, b) => b[1].wrongs / Math.max(b[1].completed, 1) - a[1].wrongs / Math.max(a[1].completed, 1)).slice(0, 4);
  const strengths = list.filter(([, v]) => v.completed >= 2 && v.first / v.completed >= 0.7).sort((a, b) => b[1].first - a[1].first).slice(0, 4);

  return (
    <PageShell testId="parent-dashboard">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <span className="rounded-full border-[3px] border-hc-navy bg-hc-lavlight px-4 py-1.5 font-fredoka font-semibold">Parents</span>
          <h1 className="mt-4 font-fredoka text-4xl font-bold sm:text-5xl">{profile.name}'s learning</h1>
          <p className="mt-1 font-semibold opacity-80">{profile.level === "K" ? "Kindergarten" : "Grade 1"} level · switch child in the profiles list below.</p>
        </div>
        <AccountCard />
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Stars earned" value={pdata.totalStars} testId="parent-stat-stars" bg="bg-hc-sunlight" />
          <Stat label="Puzzles completed" value={completed} testId="parent-stat-completed" bg="bg-hc-mintlight" />
          <Stat label="First-try accuracy" value={`${accuracy}%`} testId="parent-stat-accuracy" bg="bg-hc-skylight" />
          <Stat label="Activities finished" value={rows.reduce((s, r) => s + r.plays, 0)} testId="parent-stat-games" bg="bg-hc-lavlight" />
        </section>
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="toy-card p-5 sm:p-6">
            <h2 className="flex items-center gap-2 font-fredoka text-2xl font-bold"><ThumbsUp className="h-6 w-6" /> Strengths</h2>
            <ul className="mt-3 space-y-2" data-testid="strengths">
              {strengths.length === 0 && <li className="rounded-2xl bg-hc-cream p-3 font-bold">Strengths appear after a few activities.</li>}
              {strengths.map(([k, v]) => <li key={k} className="flex justify-between rounded-2xl border-[3px] border-hc-navy bg-hc-mintlight p-3 font-bold"><span>{k}</span><span className="text-sm">{v.first} first-try</span></li>)}
            </ul>
            <h2 className="mt-6 flex items-center gap-2 font-fredoka text-2xl font-bold"><Target className="h-6 w-6" /> Needs more practice</h2>
            <ul className="mt-3 space-y-2" data-testid="practice-areas">
              {practice.length === 0 && <li className="rounded-2xl bg-hc-cream p-3 font-bold">Nothing flagged yet. Keep playing to see tips here!</li>}
              {practice.map(([k, v]) => <li key={k} className="flex justify-between rounded-2xl border-[3px] border-hc-navy bg-hc-corallight p-3 font-bold"><span>{k}</span><span className="text-sm">{v.wrongs} extra {v.wrongs === 1 ? "try" : "tries"}</span></li>)}
            </ul>
          </div>
          <div className="toy-card p-5 sm:p-6">
            <h2 className="flex items-center gap-2 font-fredoka text-2xl font-bold"><Clock className="h-6 w-6" /> Recent activity</h2>
            <ul className="mt-3 space-y-2" data-testid="parent-recent">
              {(pdata.recent || []).length === 0 && <li className="rounded-2xl bg-hc-cream p-3 font-bold">No finished activities yet.</li>}
              {(pdata.recent || []).filter((r) => activityById(r.id)).map((r) => <li key={r.id} className="flex justify-between rounded-2xl border-[3px] border-hc-navy bg-hc-cream p-3 font-bold"><span>{activityById(r.id).title}</span><span className="text-sm">{new Date(r.at).toLocaleString()}</span></li>)}
            </ul>
          </div>
        </section>
        <section className="toy-card p-5 sm:p-6" data-testid="learning-history">
          <h2 className="flex items-center gap-2 font-fredoka text-2xl font-bold"><Trophy className="h-6 w-6" /> Learning history by world</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {WORLDS.map((w) => (
              <div key={w.id} className={`rounded-2xl border-[3px] border-hc-navy p-4 ${w.card}`} data-testid={`parent-world-${w.id}`}>
                <p className="font-fredoka text-xl font-bold">{w.title}</p>
                <p className="mb-2 text-xs font-bold opacity-80">{OBJECTIVES[w.id]}</p>
                {activitiesOf(w.id).map((a) => { const r = rows.find((x) => x.a.id === a.id); return <p key={a.id} className="flex justify-between text-sm font-bold"><span>{a.title}</span><span>{r.completed} done · {r.firstTry} first-try · {r.plays}× finished</span></p>; })}
              </div>
            ))}
          </div>
        </section>
        <ProfilesCard />
        <section className="toy-card p-5 sm:p-6">
          <h2 className="flex items-center gap-2 font-fredoka text-2xl font-bold"><BookOpen className="h-6 w-6" /> Sound, voice & motion</h2>
          <div className="mt-4"><SettingsToggles /></div>
        </section>
        <div className="flex justify-center pb-4">
          <ToyButton color="coral" onClick={() => setConfirm(true)} data-testid="reset-progress-button" className="text-lg"><Trash2 className="h-5 w-5" /> Reset {profile.name}'s progress</ToyButton>
        </div>
      </div>
      <Modal open={confirm} onClose={() => setConfirm(false)} testId="reset-confirm-dialog">
        <h2 className="font-fredoka text-3xl font-bold">Reset {profile.name}'s progress?</h2>
        <p className="mt-2 font-bold">Stars and history for this child will be cleared. Other children and settings stay the same.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <ToyButton color="white" className="flex-1" onClick={() => setConfirm(false)} data-testid="reset-cancel-button">Cancel</ToyButton>
          <ToyButton color="coral" className="flex-1" onClick={() => { resetProgress(); setConfirm(false); }} data-testid="reset-confirm-button">Yes, reset</ToyButton>
        </div>
      </Modal>
    </PageShell>
  );
}
