import { motion } from "framer-motion";
import { Sparkles, Star } from "lucide-react";

const NAVY = "#1F2547";
const PINK = "#FF9BB8";
const stroke = { stroke: NAVY, strokeWidth: 3.5, strokeLinecap: "round", strokeLinejoin: "round" };

const Eyes = ({ l, r, y, size = 5.5, closed }) =>
  closed ? (
    <g fill="none" {...stroke}>
      <path d={`M${l - 6} ${y + 1} Q${l} ${y - 7} ${l + 6} ${y + 1}`} />
      <path d={`M${r - 6} ${y + 1} Q${r} ${y - 7} ${r + 6} ${y + 1}`} />
    </g>
  ) : (
    <g className="hc-blink">
      <circle cx={l} cy={y} r={size} fill={NAVY} />
      <circle cx={r} cy={y} r={size} fill={NAVY} />
      <circle cx={l + size * 0.35} cy={y - size * 0.4} r={size * 0.38} fill="#fff" />
      <circle cx={r + size * 0.35} cy={y - size * 0.4} r={size * 0.38} fill="#fff" />
    </g>
  );

const Brows = ({ l, r, y, mood }) => {
  if (mood === "sad") return (<g fill="none" {...stroke} strokeWidth="3"><path d={`M${l - 6} ${y} L${l + 5} ${y - 4}`} /><path d={`M${r + 6} ${y} L${r - 5} ${y - 4}`} /></g>);
  if (mood === "thinking") return (<g fill="none" {...stroke} strokeWidth="3"><path d={`M${l - 6} ${y - 1} Q${l} ${y - 6} ${l + 6} ${y - 1}`} /><path d={`M${r - 6} ${y - 6} L${r + 6} ${y - 3}`} /></g>);
  return null;
};

const Mouth = ({ x, y, w, mood }) => {
  if (mood === "celebrate") return (
    <g>
      <path d={`M${x - w} ${y} Q${x} ${y + w * 1.7} ${x + w} ${y} Z`} fill="#8A2C44" {...stroke} />
      <path d={`M${x - w * 0.45} ${y + w * 0.8} Q${x} ${y + w * 0.4} ${x + w * 0.45} ${y + w * 0.8}`} fill="#FF8FA3" />
    </g>
  );
  if (mood === "talking") return <ellipse cx={x} cy={y + 3} rx={w * 0.45} ry={w * 0.42} fill="#8A2C44" {...stroke} />;
  if (mood === "sad") return <path d={`M${x - w * 0.6} ${y + 5} Q${x} ${y - 1} ${x + w * 0.6} ${y + 5}`} fill="none" {...stroke} />;
  if (mood === "thinking") return <path d={`M${x - w * 0.5} ${y + 3} Q${x} ${y + 1} ${x + w * 0.6} ${y}`} fill="none" {...stroke} />;
  return <path d={`M${x - w} ${y} Q${x} ${y + w} ${x + w} ${y}`} fill="none" {...stroke} />;
};

const LILAC = "#C9B6FF";
export const Hoppy = ({ mood = "happy" }) => (
  <svg viewBox="0 0 120 150" className="w-full h-auto overflow-visible" aria-hidden="true">
    <g {...stroke}>
      <ellipse cx="60" cy="134" rx="30" ry="14" fill={LILAC} />
      <g transform="rotate(-10 42 52)">
        <ellipse cx="42" cy="38" rx="12" ry="32" fill={LILAC} />
        <ellipse cx="42" cy="41" rx="5.5" ry="21" fill="#FFB8D2" stroke="none" />
      </g>
      <g transform="rotate(18 80 52)">
        <ellipse cx="80" cy="38" rx="12" ry="32" fill={LILAC} />
        <ellipse cx="80" cy="41" rx="5.5" ry="21" fill="#FFB8D2" stroke="none" />
      </g>
      <ellipse cx="60" cy="92" rx="40" ry="35" fill={LILAC} />
    </g>
    <ellipse cx="60" cy="105" rx="17" ry="12" fill="#F5F0FF" />
    <path d="M53 58 Q57 50 60 58 Q63 50 67 58" fill="none" {...stroke} strokeWidth="3" />
    <circle cx="35" cy="100" r="6.5" fill={PINK} opacity="0.8" />
    <circle cx="85" cy="100" r="6.5" fill={PINK} opacity="0.8" />
    <Brows l={46} r={74} y={75} mood={mood} />
    <Eyes l={46} r={74} y={87} closed={mood === "celebrate"} />
    <path d="M55 97 Q60 93 65 97 Q60 102 55 97Z" fill="#FF7A9A" stroke={NAVY} strokeWidth="2.5" />
    <Mouth x={60} y={105} w={7} mood={mood} />
  </svg>
);

const FROG = "#7ED67A";
export const Froggy = ({ mood = "happy" }) => (
  <svg viewBox="0 0 150 130" className="w-full h-auto overflow-visible" aria-hidden="true">
    <g {...stroke}>
      <ellipse cx="38" cy="118" rx="18" ry="8" fill="#5DBE5A" />
      <ellipse cx="112" cy="118" rx="18" ry="8" fill="#5DBE5A" />
      <ellipse cx="75" cy="80" rx="58" ry="40" fill={FROG} />
    </g>
    <ellipse cx="75" cy="97" rx="34" ry="19" fill="#D6F5BE" />
    <circle cx="28" cy="72" r="4" fill="#5DBE5A" />
    <circle cx="123" cy="74" r="3" fill="#5DBE5A" />
    <g {...stroke}>
      <circle cx="46" cy="46" r="21" fill={FROG} />
      <circle cx="104" cy="46" r="21" fill={FROG} />
      <circle cx="46" cy="44" r="13" fill="#fff" />
      <circle cx="104" cy="44" r="13" fill="#fff" />
    </g>
    <Brows l={46} r={104} y={22} mood={mood} />
    <Eyes l={47} r={105} y={45} size={6.5} closed={mood === "celebrate"} />
    <circle cx="40" cy="84" r="7" fill={PINK} opacity="0.8" />
    <circle cx="110" cy="84" r="7" fill={PINK} opacity="0.8" />
    <circle cx="69" cy="68" r="2" fill={NAVY} />
    <circle cx="81" cy="68" r="2" fill={NAVY} />
    <Mouth x={75} y={79} w={19} mood={mood} />
  </svg>
);

const CHICK = "#FFD43B";
export const Sunny = ({ mood = "happy" }) => {
  const open = mood === "celebrate" || mood === "talking";
  return (
    <svg viewBox="0 0 120 135" className="w-full h-auto overflow-visible" aria-hidden="true">
      <g stroke="#F0812B" strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M48 116 L44 128 M48 116 L50 129 M48 116 L55 127" />
        <path d="M72 116 L66 127 M72 116 L71 129 M72 116 L77 128" />
      </g>
      <g {...stroke}>
        <path d="M54 30 Q47 12 57 7 Q58 18 63 9 Q71 15 65 30 Z" fill={CHICK} />
        <ellipse cx="18" cy="80" rx="11" ry="19" transform="rotate(25 18 80)" fill="#FF7F91" />
        <ellipse cx="102" cy="80" rx="11" ry="19" transform="rotate(-25 102 80)" fill="#FF7F91" />
        <circle cx="60" cy="74" r="46" fill={CHICK} />
      </g>
      <ellipse cx="60" cy="94" rx="26" ry="19" fill="#FFF0A8" />
      <circle cx="35" cy="84" r="6.5" fill={PINK} opacity="0.85" />
      <circle cx="85" cy="84" r="6.5" fill={PINK} opacity="0.85" />
      <Brows l={46} r={74} y={52} mood={mood} />
      <Eyes l={46} r={74} y={64} closed={mood === "celebrate"} />
      {open ? (
        <g {...stroke} strokeWidth="3" fill="#FF9A3C">
          <path d="M50 75 L70 75 L60 83 Z" />
          <path d="M52 86 L68 86 L60 93 Z" />
        </g>
      ) : (
        <path d={mood === "sad" ? "M52 79 L68 79 L60 88 Z" : "M50 75 L70 75 L60 88 Z"} fill="#FF9A3C" {...stroke} strokeWidth="3" />
      )}
    </svg>
  );
};

const MAP = { hoppy: Hoppy, froggy: Froggy, sunny: Sunny };
const MOTION = {
  happy: { animate: { y: [0, -6, 0] }, transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" } },
  talking: { animate: { scale: [1, 1.04, 1] }, transition: { duration: 0.6, repeat: Infinity } },
  celebrate: { animate: { y: [0, -26, 0, -14, 0], rotate: [0, -5, 5, -2, 0] }, transition: { duration: 1.1, repeat: Infinity, repeatDelay: 0.4 } },
  thinking: { animate: { rotate: [0, -6, -6, 0] }, transition: { duration: 2.6, repeat: Infinity } },
  sad: { animate: { x: [0, -5, 5, -3, 0], y: [0, 3, 3, 0] }, transition: { duration: 0.7 } },
};

export const Character = ({ name, mood = "happy", className = "", testId }) => {
  const Svg = MAP[name];
  const m = MOTION[mood] || MOTION.happy;
  return (
    <div className={`relative ${className}`} data-testid={testId} data-mood={mood}>
      <motion.div key={mood} animate={m.animate} transition={m.transition} style={{ transformOrigin: "50% 100%" }}>
        <Svg mood={mood} />
      </motion.div>
      {mood === "thinking" && (
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-1 grid h-8 w-8 place-items-center rounded-full border-[3px] border-hc-navy bg-white font-fredoka text-lg font-bold">?</motion.span>
      )}
      {mood === "celebrate" && (
        <>
          <Sparkles className="absolute -top-3 -left-2 h-7 w-7 text-hc-sun hc-float" strokeWidth={2.5} />
          <Star className="absolute -top-1 -right-2 h-6 w-6 fill-hc-sun text-hc-navy hc-float" strokeWidth={2} />
        </>
      )}
    </div>
  );
};
