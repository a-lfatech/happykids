import { useEffect, useState } from "react";
import { getLearner } from "../lib/mastery";
import { supabase } from "../lib/supabase";

export default function ReadingInsights() {
  const [families, setFamilies] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const learner = getLearner();
    if (!learner) { setFamilies([]); return; }
    let live = true;
    supabase.rpc('hk_reading_catalog', { p_token: learner.token }).then(({ data, error }) => {
      if (!live) return;
      if (error || !Array.isArray(data)) setError(true); else setFamilies(data);
    }).catch(() => { if (live) setError(true); });
    return () => { live = false; };
  }, []);
  return <section className="toy-card p-6"><h2 className="font-fredoka text-2xl font-bold">Word-family reading progress</h2><p className="my-2 text-sm font-bold">Current learning-map learner · independent picture matching is not a pronunciation assessment. Sample content, not curriculum-validated.</p>
    {error ? <p role="alert">Reading progress could not be loaded. Reopen this page to retry.</p> : !families ? <p>Loading reading progress…</p> : !families.length ? <p>Start the new reading game to see progress here.</p> : <div className="grid gap-4 sm:grid-cols-2">{families.map(f => <div key={f.id} className="rounded-2xl border-2 border-hc-navy bg-hc-skylight p-4"><h3 className="font-fredoka text-xl font-bold">-{f.content.rime} · {f.status}</h3><p>{f.built} built · {f.read} independent reading matches</p><p>{f.independent} independent successes · {f.assisted} supported attempts</p><p>{f.best}/{f.target} mastery stars · {f.explored} exploration sessions</p>{f.assisted > 0 && f.status !== 'mastered' && <p className="mt-2 font-bold">Try revisiting {f.content.concept.toLowerCase()} together.</p>}{f.last_practised && <p className="mt-2 text-xs">Last practice: {new Date(f.last_practised).toLocaleDateString()}</p>}</div>)}</div>}
  </section>;
}
