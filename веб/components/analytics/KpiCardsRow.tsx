"use client";

import { motion, useReducedMotion } from "framer-motion";
import { KpiCard } from "@/components/analytics/KpiCard";
import type { TopKpiMetric } from "@/types/analytics";

type KpiCardsRowProps = {
  kpis: TopKpiMetric[];
};

export function KpiCardsRow({ kpis }: KpiCardsRowProps) {
  const reduceMotion = useReducedMotion();

  const rowVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.07,
        delayChildren: reduceMotion ? 0 : 0.06,
      },
    },
  };

  return (
    <motion.div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      variants={rowVariants}
      initial="hidden"
      animate="show"
    >
      {kpis.map((kpi) => (
        <KpiCard key={kpi.id} kpi={kpi} />
      ))}
    </motion.div>
  );
}
