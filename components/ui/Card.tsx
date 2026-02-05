"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({
  children,
  className,
  hover = true,
  onClick,
}: CardProps) {
  return (
    <motion.div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden",
        hover && "hover:shadow-card-hover cursor-pointer",
        className,
      )}
      whileHover={hover ? { y: -4 } : {}}
      transition={{ duration: 0.2 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div
      className={cn(
        "p-6 border-b border-gray-100 dark:border-gray-700",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div
      className={cn(
        "p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50",
        className,
      )}
    >
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;
