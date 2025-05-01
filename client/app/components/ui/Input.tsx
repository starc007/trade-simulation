import { motion, HTMLMotionProps } from "framer-motion";
import { twMerge } from "tailwind-merge";

interface InputProps extends HTMLMotionProps<"input"> {
  label?: string;
  error?: string;
}

export const Input = ({
  children,
  className,
  label,
  error,
  ...props
}: InputProps) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <motion.input
        className={twMerge(
          "w-full rounded-xl border border-border/50 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary duration-200",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      />
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-600 text-sm"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};
