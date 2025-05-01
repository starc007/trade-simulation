import { motion } from "framer-motion";

interface Tab {
  label: string;
  value: string;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onTabChange: (value: string) => void;
  className?: string;
}

export const Tabs = ({
  tabs,
  active,
  onTabChange,
  className = "",
}: TabsProps) => {
  return (
    <div className={`flex relative ${className}`}>
      {/* Background Pill */}
      <motion.div
        className="absolute h-full bg-primary rounded-lg"
        initial={false}
        animate={{
          width: `${100 / tabs.length}%`,
          x: `${tabs.findIndex((tab) => tab.value === active) * 100}%`,
        }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
      />

      {/* Tabs */}
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={`px-5 py-2 text-sm font-medium relative flex-1 ${
            active === tab.value
              ? "text-background"
              : "text-primary/60 hover:text-primary"
          }`}
          style={{
            WebkitTapHighlightColor: "transparent",
          }}
          onClick={() => onTabChange(tab.value)}
        >
          <span className="relative z-10 whitespace-nowrap">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};
