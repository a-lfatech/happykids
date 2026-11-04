const COLORS = {
  sun: "bg-hc-sun",
  sky: "bg-hc-sky",
  mint: "bg-hc-mint",
  tang: "bg-hc-tang",
  lav: "bg-hc-lav",
  coral: "bg-hc-coral",
  white: "bg-white",
};

export const ToyButton = ({ color = "sun", className = "", children, ...props }) => (
  <button type="button" className={`toy-btn inline-flex items-center justify-center gap-2 px-5 ${COLORS[color]} ${className}`} {...props}>
    {children}
  </button>
);
