import {
  Apple, Banana, Bed, Bird, Box, Brain, Bus, Candy, Car, Carrot, Cat, Cherry, Cloud, CloudRain, Dog, Droplets, Ear, Eye, Fish, Flower2,
  Footprints, Globe, Hand, Heart, House, IceCreamCone, Leaf, Lollipop, Moon, Pencil, Rabbit, Rainbow, Rocket, Smile, Snail, Snowflake,
  Sprout, Star, Sun, TreePine, Turtle, Umbrella, Waves, Wind,
} from "lucide-react";

export const ICONS = { Apple, Banana, Bed, Bird, Box, Brain, Bus, Candy, Car, Carrot, Cat, Cherry, Cloud, CloudRain, Dog, Droplets, Ear, Eye, Fish, Flower2, Footprints, Globe, Hand, Heart, House, IceCreamCone, Leaf, Lollipop, Moon, Pencil, Rabbit, Rainbow, Rocket, Smile, Snail, Snowflake, Sprout, Star, Sun, TreePine, Turtle, Umbrella, Waves, Wind };

const BG = { sky: "bg-hc-skylight", sun: "bg-hc-sunlight", mint: "bg-hc-mintlight", tang: "bg-hc-tanglight", lav: "bg-hc-lavlight", coral: "bg-hc-corallight" };

export const Pic = ({ icon, color = "sky", className = "h-20 w-20 sm:h-24 sm:w-24" }) => {
  const Icon = ICONS[icon];
  return (
    <span className={`grid place-items-center rounded-3xl border-[3px] border-hc-navy ${BG[color]} ${className}`}>
      <Icon className="h-3/5 w-3/5" strokeWidth={2.25} />
    </span>
  );
};

const PATHS = {
  circle: <circle cx="50" cy="50" r="40" />,
  square: <rect x="12" y="12" width="76" height="76" rx="6" />,
  triangle: <path d="M50 10 L92 88 L8 88 Z" />,
  star: <path d="M50 8 L61 38 L93 38 L67 57 L77 89 L50 70 L23 89 L33 57 L7 38 L39 38 Z" />,
  heart: <path d="M50 88 C10 62 6 36 22 22 C36 10 48 20 50 30 C52 20 64 10 78 22 C94 36 90 62 50 88 Z" />,
  diamond: <path d="M50 6 L90 50 L50 94 L10 50 Z" />,
};

export const Shape = ({ shape, fill, className = "h-16 w-16 sm:h-20 sm:w-20" }) => (
  <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
    <g fill={fill} stroke="#1F2547" strokeWidth="5" strokeLinejoin="round">{PATHS[shape]}</g>
  </svg>
);

// Renders any quiz item: text, icon picture, shape or character image.
export const Item = ({ item, big }) => {
  if (item.text != null) return <span className={`font-fredoka font-bold leading-none ${big ? "text-6xl sm:text-7xl" : "text-5xl sm:text-6xl"}`}>{item.text}</span>;
  if (item.icon) return <Pic icon={item.icon} color={item.color} />;
  if (item.shape) return <Shape shape={item.shape} fill={item.fill} />;
  if (item.img) return <img src={item.img} alt={item.label || ""} className="h-24 w-24 object-contain sm:h-28 sm:w-28" draggable="false" />;
  return null;
};
