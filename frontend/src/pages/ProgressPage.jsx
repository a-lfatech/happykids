import { useNavigate } from "react-router-dom";
import { Award, Lock, Printer, Star } from "lucide-react";
import { useAppState } from "../context/AppState";
import { PageShell } from "../components/SiteNav";
import { CHARACTERS } from "../components/Characters";
import { ToyButton } from "../components/ToyButton";
import { AVATAR_UNLOCKS, WORLDS, activitiesOf, activityById, allBadges, solvedCount } from "../data/worlds";

export default function ProgressPage() {
  const navigate = useNavigate();
  const { state, profile, pdata, updateProfile, setActive } = useAppState();
  const badges = allBadges(pdata);

  return (
    <PageShell testId="progress-page">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center gap-4">
          <img src={CHARACTERS[profile.avatar].img} alt="" className="h-24 w-24 rounded-full border-[3px] border-hc-navy bg-hc-sunlight object-contain p-1" />
          <div className="flex-1">
            <h1 className="font-fredoka text-4xl font-bold sm:text-5xl" data-testid="progress-title">{profile.name}'s progress</h1>
            <p className="flex items-center gap-2 font-fredoka text-xl font-semibold"><Star className="h-6 w-6 fill-hc-sun" /> <span data-testid="progress-stars">{pdata.totalStars}</span> stars collected</p>
          </div>
          {state.profiles.length > 1 && (
            <div className="flex gap-2">
              {state.profiles.map((p) => (
                <button key={p.id} type="button" onClick={() => setActive(p.id)} aria-label={`Show ${p.name}`} data-testid={`progress-profile-${p.id}`} className={`toy-btn h-16 w-16 p-1 ${p.id === profile.id ? "bg-hc-sun" : "bg-white"}`}>
                  <img src={CHARACTERS[p.avatar].img} alt="" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="world-progress">
          {WORLDS.map((w) => {
            const acts = activitiesOf(w.id);
            const done = acts.reduce((a, x) => a + solvedCount(pdata, x.id), 0);
            const total = acts.reduce((a, x) => a + x.total, 0);
            return (
              <div key={w.id} className={`rounded-3xl border-[3px] border-hc-navy p-4 ${w.card}`} data-testid={`world-progress-${w.id}`}>
                <img src={w.icon} alt="" className="h-14 w-14 object-contain" />
                <p className="mt-1 font-fredoka text-lg font-bold">{w.title}</p>
                <p className="text-sm font-bold">{done} of {total} solved</p>
                <div className="mt-2 h-3 overflow-hidden rounded-full border-2 border-hc-navy bg-white"><div className="h-full bg-hc-mint" style={{ width: `${(done / total) * 100}%` }} /></div>
              </div>
            );
          })}
        </section>

        <section className="mt-10">
          <h2 className="flex items-center gap-2 font-fredoka text-3xl font-bold"><Award className="h-7 w-7" /> Badges & certificates</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {badges.map((b) => (
              <div key={b.id} className={`rounded-3xl border-[3px] border-hc-navy p-4 ${b.earned ? "bg-hc-sunlight" : "bg-white opacity-70"}`} data-testid={`badge-${b.id}`} data-earned={b.earned}>
                <div className="flex items-center gap-3">
                  <span className={`grid h-14 w-14 place-items-center rounded-full border-[3px] border-hc-navy ${b.earned ? "bg-hc-sun" : "bg-hc-cream"}`}>{b.earned ? <Award className="h-7 w-7" strokeWidth={2.5} /> : <Lock className="h-6 w-6" />}</span>
                  <div><p className="font-fredoka text-lg font-bold leading-tight">{b.name}</p><p className="text-xs font-bold">{b.earned ? "Earned!" : b.need}</p></div>
                </div>
                {b.earned && <ToyButton color="white" className="mt-3 w-full text-sm" onClick={() => navigate(`/certificate/${b.id}`)} data-testid={`certificate-${b.id}`}><Printer className="h-4 w-4" /> Certificate</ToyButton>}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-fredoka text-3xl font-bold">Character friends</h2>
          <p className="font-bold">Collect stars to unlock new friends. Tap a friend to make them your buddy!</p>
          <div className="mt-5 grid grid-cols-3 gap-4 sm:grid-cols-6" data-testid="character-rewards">
            {Object.entries(CHARACTERS).map(([id, c]) => {
              const need = AVATAR_UNLOCKS[id];
              const open = pdata.totalStars >= need;
              return (
                <button key={id} type="button" disabled={!open} onClick={() => updateProfile(profile.id, { avatar: id })} data-testid={`avatar-${id}`} data-unlocked={open}
                  className={`toy-btn flex h-auto flex-col items-center p-3 text-sm ${profile.avatar === id ? "bg-hc-sun" : "bg-white"}`}>
                  <img src={c.img} alt="" className={`h-20 w-20 object-contain ${open ? "" : "grayscale"}`} />
                  {c.name.split(" ")[0]}
                  {!open && <span className="flex items-center gap-1 text-xs"><Lock className="h-3 w-3" /> {need} stars</span>}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-fredoka text-3xl font-bold">Recently played</h2>
          <ul className="mt-3 space-y-2" data-testid="progress-recent">
            {(pdata.recent || []).length === 0 && <li className="font-bold opacity-70">No games finished yet.</li>}
            {(pdata.recent || []).map((r) => activityById(r.id) && (
              <li key={r.id} className="flex items-center justify-between rounded-2xl border-[3px] border-hc-navy bg-white p-3 font-bold">
                <span>{activityById(r.id).title}</span><span className="text-sm opacity-70">{new Date(r.at).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageShell>
  );
}
