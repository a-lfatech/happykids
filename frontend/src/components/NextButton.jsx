import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Flag } from "lucide-react";
import { ToyButton } from "./ToyButton";

export const NextButton = ({ show, isLast, onClick }) => (
  <>
    <div className="h-16" aria-hidden="true" />
    {createPortal(
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.3 }}
            className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center bg-gradient-to-t from-[#FFF6E3] via-[#FFF6E3]/85 to-transparent px-4 pt-8"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
          >
            <ToyButton color="mint" onClick={onClick} data-testid={isLast ? "finish-button" : "next-button"} className="pointer-events-auto min-h-[64px] px-10 text-2xl sm:min-h-[72px] sm:text-3xl">
              {isLast ? (<>FINISH <Flag className="h-7 w-7" strokeWidth={3} /></>) : (<>NEXT <ArrowRight className="h-7 w-7" strokeWidth={3} /></>)}
            </ToyButton>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body,
    )}
  </>
);
