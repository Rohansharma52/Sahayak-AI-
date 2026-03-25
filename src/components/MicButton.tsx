import { Mic } from "lucide-react";
import { motion } from "framer-motion";

interface MicButtonProps {
  isListening?: boolean;
  onClick: () => void;
  size?: "lg" | "xl";
}

const MicButton = ({ isListening = false, onClick, size = "xl" }: MicButtonProps) => {
  const sizeClasses = size === "xl" ? "w-24 h-24" : "w-16 h-16";
  const iconSize = size === "xl" ? 36 : 24;

  return (
    <div className="relative flex items-center justify-center">
      {isListening && (
        <>
          <span className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring" style={{ width: size === "xl" ? 96 : 64, height: size === "xl" ? 96 : 64 }} />
          <span className="absolute inset-0 rounded-full bg-primary/10 animate-pulse-ring" style={{ animationDelay: "0.5s", width: size === "xl" ? 96 : 64, height: size === "xl" ? 96 : 64 }} />
        </>
      )}
      <motion.button
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.05 }}
        onClick={onClick}
        className={`${sizeClasses} rounded-full bg-gradient-hero flex items-center justify-center shadow-elevated text-primary-foreground relative z-10 cursor-pointer`}
      >
        <Mic size={iconSize} />
      </motion.button>
    </div>
  );
};

export default MicButton;
