export function WordPicture({ word, picture, className = "" }) {
  if (!["an", "in", "on"].includes(word)) return <span className={className} aria-hidden="true">{picture}</span>;
  return <svg viewBox="0 0 180 120" className={`word-scene ${className}`} role="img" aria-label={word === "an" ? "An apple" : word === "in" ? "A ball inside a box" : "A ball on top of a table"}>
    <rect x="2" y="2" width="176" height="116" rx="18" fill="#eef9ff" />
    {word === "an" ? <>
      <path d="M90 36 Q65 23 56 49 Q42 78 72 99 Q86 105 91 98 Q105 106 121 89 Q144 65 120 42 Q105 30 90 36" fill="#f46562" stroke="#1f2547" strokeWidth="3" />
      <path d="M90 36 L93 20 M94 25 Q107 12 122 21 Q112 35 94 25" fill="#52bd86" stroke="#1f2547" strokeWidth="3" />
      <text x="14" y="24" fontSize="16" fill="#1f2547">an apple</text>
    </> : <>
      {word === "on" && <><rect x="30" y="74" width="120" height="12" rx="4" fill="#ffbb58" stroke="#1f2547" strokeWidth="3" /><path d="M44 86V109M136 86V109" stroke="#1f2547" strokeWidth="6" /></>}
      {word === "in" && <rect x="36" y="48" width="108" height="58" rx="6" fill="#ffd38c" stroke="#1f2547" strokeWidth="3" />}
      <circle cx="90" cy={word === "on" ? 53 : 64} r="20" fill="#59b7ef" stroke="#1f2547" strokeWidth="3" />
      <path d={word === "on" ? "M73 44Q91 58 107 44" : "M73 55Q91 69 107 55"} fill="none" stroke="white" strokeWidth="5" />
      {word === "in" && <><path d="M36 79H144V106H36Z" fill="#ffbb58" stroke="#1f2547" strokeWidth="3" /><path d="M36 49L18 68L36 79M144 49L162 68L144 79" fill="#ffdf9f" stroke="#1f2547" strokeWidth="3" /></>}
      <text x="90" y="25" textAnchor="middle" fontSize="16" fill="#1f2547">{word === "in" ? "in the box" : "on the table"}</text>
    </>}
  </svg>;
}
