import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Flag } from "lucide-react";
import { ToyButton } from "./ToyButton";

export const NextButton = ({ show, isLast, onClick }) => (
  <AnimatePresence>
    {show && (
      <motion.div initial={{ scale: 0.6, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 16, delay: 0.3 }} className="flex justify-center">
        <ToyButton color="mint" onClick={onClick} data-testid={isLast ? "finish-button" : "next-button"} className="min-h-[72px] px-10 text-2xl sm:text-3xl">
          {isLast ? (<>FINISH <Flag className="h-7 w-7" strokeWidth={3} /></>) : (<>NEXT <ArrowRight className="h-7 w-7" strokeWidth={3} /></>)}
        </ToyButton>
      </motion.div>
    )}
  </AnimatePresence>
);
