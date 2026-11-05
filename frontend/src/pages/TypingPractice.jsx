import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, RefreshCw, Star, Volume2 } from "lucide-react";
import { Character } from "../components/Characters";
import { Confetti } from "../components/Confetti";
import { Modal } from "../components/Modal";
import { ToyButton } from "../components/ToyButton";
import { TypeBox } from "../components/typing/TypeBox";
import { TEST_PASSAGES, TYPING_LESSONS, lessonById, saveLessonResult, saveTestResult, starsFor } from "../data/typing";
import { TypingHeader } from "./TypingHub";
import { sfx, speak, stopSpeaking } from "../lib/audioManager";

export default function TypingPractice({ mode = "lesson" }) {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const lesson = mode === "lesson" ? lessonById(lessonId) : null;
  const [round, setRound] = useState(0);
  const [result, setResult] = useState(null);

  const text = useMemo(
    () => (lesson ? lesson.text : TEST_PASSAGES[Math.floor(Math.random() * TEST_PASSAGES.length)]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lesson, round],
  );

  useEffect(() => {
    if (lesson) speak(`${lesson.title}. ${lesson.tip}`);
    else speak("Speed test! Type the story as carefully as you can.");
    return stopSpeaking;
  }, [lesson]);

  if (mode === "lesson" && !lesson) return <Navigate to="/typing" replace />;

  const finish = ({ wpm, acc }) => {
    const stars = starsFor(wpm, acc);
    if (lesson) saveLessonResult(lesson.id, wpm, acc);
    const best = saveTestResult(wpm);
    setResult({ wpm, acc, stars, best });
    if (stars >= 2) sfx.fanfare(); else sfx.correct();
    speak(stars >= 2 ? `Amazing! ${wpm} words per minute and ${acc} percent correct!` : `Well done for finishing! You were ${acc} percent correct. Let's try again to get more stars.`);
  };

  const again = () => { setResult(null); setRound((r) => r + 1); };
  const nextIdx = lesson ? TYPING_LESSONS.findIndex((l) => l.id === lesson.id) + 1 : -1;
  const nextLesson = TYPING_LESSONS[nextIdx];

  return (
    <main className="hc-bg min-h-[100dvh] px-3 pb-8 pt-3 sm:px-8" data-testid="typing-practice">
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <TypingHeader
          title={lesson ? `${lesson.emoji} ${lesson.title}` : "Speed Test"}
          right={<ToyButton color="white" className="px-3" onClick={() => speak(lesson ? lesson.tip : "Type the story. Watch the glowing key to find the next letter.")} aria-label="Hear the tip"><Volume2 className="h-6 w-6" /></ToyButton>}
        />
        <div className="flex items-center gap-3">
          <Character name="finn" mood="talking" className="w-16 shrink-0 sm:w-20" />
          <p className="rounded-2xl border-[3px] border-hc-navy bg-white px-4 py-2 text-lg font-bold leading-snug">{lesson ? lesson.tip : "Type the story. Mistakes turn pink; press backspace to fix them."}</p>
        </div>
        <TypeBox key={`${text}-${round}`} text={text} focusKeys={lesson?.keys || undefined} onFinish={finish} />
      </div>

      <Modal open={!!result} onClose={again} testId="typing-result">
        {result && (
          <div className="flex flex-col items-center gap-3 text-center">
            {result.stars >= 2 && <Confetti />}
            <Character name="finn" mood={result.stars >= 2 ? "celebrate" : "happy"} className="w-24" />
            <h2 className="font-fredoka text-3xl font-bold">{result.stars >= 2 ? "Super typing!" : "You finished!"}</h2>
            <div className="flex gap-1">{[0, 1, 2].map((i) => <Star key={i} className={`h-10 w-10 ${i < result.stars ? "fill-hc-sun" : "text-hc-navy/30"}`} strokeWidth={2.5} />)}</div>
            <p className="text-lg font-bold">{result.wpm} words per minute, {result.acc}% correct</p>
            <p className="text-sm font-semibold opacity-80">Your best speed: {result.best} words per minute</p>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              <ToyButton color="white" onClick={again} data-testid="typing-again"><RefreshCw className="h-5 w-5" /> Again</ToyButton>
              {nextLesson ? (
                <ToyButton color="mint" onClick={() => { setResult(null); navigate(`/typing/lesson/${nextLesson.id}`); }} data-testid="typing-next">Next lesson <ArrowRight className="h-5 w-5" /></ToyButton>
              ) : (
                <ToyButton color="mint" onClick={() => navigate("/typing")}>All lessons <ArrowRight className="h-5 w-5" /></ToyButton>
              )}
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}
