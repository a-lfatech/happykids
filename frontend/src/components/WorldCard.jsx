import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const WorldCard = ({ w, i, onClick }) => (
  <motion.button
    type="button"
    initial={{ y: 30, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    viewport={{ once: true }}
    transition={{ delay: i * 0.08 }}
    whileHover={{ y: -6, rotate: i % 2 ? 1 : -1 }}
    onClick={onClick}
    data-testid={`world-card-${w.id}`}
    className={`toy-focus flex flex-col items-center rounded-[1.75rem] border-[3px] border-hc-navy p-5 text-center ${w.card}`}
    style={{ boxShadow: "0 6px 0 #1F2547" }}
  >
    <span className="self-start rounded-full border-[3px] border-hc-navy bg-white px-2.5 font-fredoka text-sm font-bold">{w.num}</span>
    <img src={w.icon} alt="" className="h-24 w-24 object-contain sm:h-28 sm:w-28" />
    <h3 className="mt-2 font-fredoka text-2xl font-bold leading-tight">{w.title}</h3>
    <p className="font-fredoka text-base font-semibold opacity-80">{w.subject}</p>
    <p className="mt-2 flex-1 text-sm font-bold">{w.blurb}</p>
    <span className={`toy-btn mt-4 inline-flex w-full items-center justify-center gap-2 ${w.strong}`}>Explore <ArrowRight className="h-5 w-5" strokeWidth={3} /></span>
  </motion.button>
);
