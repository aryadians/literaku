"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import { IoMoonSharp, IoSunnySharp } from "react-icons/io5";
import { motion } from "framer-motion";

export function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative overflow-hidden"
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle dark mode"
    >
      <motion.div
        initial={false}
        animate={{
          scale: theme === "dark" ? 1 : 0,
          opacity: theme === "dark" ? 1 : 0,
          rotate: theme === "dark" ? 0 : 180,
        }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <IoMoonSharp className="w-5 h-5 text-yellow-400" />
      </motion.div>

      <motion.div
        initial={false}
        animate={{
          scale: theme === "light" ? 1 : 0,
          opacity: theme === "light" ? 1 : 0,
          rotate: theme === "light" ? 0 : -180,
        }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-center"
      >
        <IoSunnySharp className="w-5 h-5 text-orange-500" />
      </motion.div>
    </motion.button>
  );
}
