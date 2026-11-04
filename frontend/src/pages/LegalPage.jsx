import { PageShell } from "../components/SiteNav";

const CONTENT = {
  privacy: {
    title: "Privacy Policy",
    sections: [
      ["What we collect", "Children can play without an account. Progress, stars and settings are stored on this device. If a parent signs in with Google, we store the parent's name and email and a copy of the child progress so it can be restored on another device."],
      ["What we never collect", "We do not collect children's names beyond the nickname a parent types, photos, location, contacts or voice recordings. Voice listening (optional) runs in the browser for about 6 seconds and nothing is saved or uploaded by HappyKids."],
      ["Advertising", "There is no advertising, no public chat and no public profiles anywhere in HappyKids."],
      ["Your choices", "Parents can reset progress, delete child profiles, turn off speech and microphone features, and sign out at any time from the Parents area."],
      ["Contact", "Questions? Use the contact form on the About page."],
    ],
  },
  terms: {
    title: "Terms of Use",
    sections: [
      ["Using HappyKids", "HappyKids is an educational play space for children aged about 4–7, used with the supervision of a parent, guardian or educator."],
      ["Grown-up responsibility", "Parent features are protected by an adult check. Grown-ups decide which profiles exist and whether optional features like the microphone are switched on."],
      ["Content", "All characters, artwork and activities belong to HappyKids. Drawings children make stay on their device unless a grown-up saves them."],
      ["Changes", "We may add new learning worlds and activities over time. We will update these terms if anything important changes."],
    ],
  },
};

export default function LegalPage({ kind }) {
  const c = CONTENT[kind];
  return (
    <PageShell testId={`${kind}-page`}>
      <article className="toy-card mx-auto max-w-3xl p-6 sm:p-10">
        <h1 className="font-fredoka text-4xl font-bold sm:text-5xl">{c.title}</h1>
        {c.sections.map(([h, p]) => (
          <section key={h} className="mt-6"><h2 className="font-fredoka text-2xl font-bold">{h}</h2><p className="mt-1 text-lg font-semibold">{p}</p></section>
        ))}
      </article>
    </PageShell>
  );
}
