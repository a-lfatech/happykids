import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export const Modal = ({ open, onClose, children, testId }) =>
  createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 overflow-y-auto bg-hc-navy/40 p-3 backdrop-blur-sm sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="flex min-h-full items-center justify-center">
            <motion.div
              role="dialog"
              aria-modal="true"
              data-testid={testId}
              className="toy-card relative w-full max-w-md p-5 pt-8 sm:p-8"
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={onClose}
                className="toy-focus absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full border-[3px] border-hc-navy bg-white transition-transform hover:scale-110"
                style={{ boxShadow: "0 3px 0 #1F2547" }}
                aria-label="Close"
                data-testid={testId ? `${testId}-close` : "modal-close"}
              >
                <X className="h-5 w-5" strokeWidth={3} />
              </button>
              {children}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
