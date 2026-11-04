import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Award, Printer } from "lucide-react";
import { useAppState } from "../context/AppState";
import { ToyButton } from "../components/ToyButton";
import { allBadges } from "../data/worlds";

export default function CertificatePage() {
  const { badgeId } = useParams();
  const navigate = useNavigate();
  const { profile, pdata } = useAppState();
  const badge = allBadges(pdata).find((b) => b.id === badgeId && b.earned);
  if (!badge) return <Navigate to="/progress" replace />;
  return (
    <main className="hc-bg min-h-screen p-4 sm:p-10" data-testid="certificate-page">
      <div className="mx-auto mb-6 flex max-w-4xl justify-between print:hidden">
        <ToyButton color="white" onClick={() => navigate("/progress")} data-testid="certificate-back"><ArrowLeft className="h-5 w-5" /> Back</ToyButton>
        <ToyButton color="sun" onClick={() => window.print()} data-testid="certificate-print"><Printer className="h-5 w-5" /> Print</ToyButton>
      </div>
      <section className="mx-auto max-w-4xl rounded-[2rem] border-[6px] border-double border-hc-navy bg-white p-8 text-center sm:p-14">
        <img src="/hk/logo.png" alt="HappyKids" className="mx-auto w-56" />
        <p className="mt-4 font-fredoka text-2xl font-semibold">Certificate of Achievement</p>
        <p className="mt-6 text-lg font-bold">This certificate is proudly given to</p>
        <h1 className="mt-2 font-fredoka text-5xl font-bold sm:text-6xl" data-testid="certificate-name">{profile.name}</h1>
        <p className="mt-6 text-lg font-bold">for becoming a</p>
        <p className="mt-2 inline-flex items-center gap-3 rounded-full border-[3px] border-hc-navy bg-hc-sun px-6 py-2 font-fredoka text-3xl font-bold" data-testid="certificate-badge"><Award className="h-8 w-8" /> {badge.name}</p>
        <div className="mt-8 flex items-end justify-center gap-2">
          {["finn", "ellie", "hoppy", "froggy", "sunny"].map((c) => <img key={c} src={`/hk/${c}.png`} alt="" className="w-16 sm:w-24" />)}
        </div>
        <p className="mt-6 font-bold">{new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })} · Little minds. Big possibilities.</p>
      </section>
    </main>
  );
}
