"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { InspectBreadcrumb } from "@/components/inspect/InspectBreadcrumb";
import { MediaDeck } from "@/components/inspect/MediaDeck";
import { InspectControlPanel } from "@/components/inspect/InspectControlPanel";
import { HitlToolbar } from "@/components/inspect/HitlToolbar";
import { useInspectStore } from "@/lib/inspect-store";

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };

type InspectorShellProps = {
  draftId: string;
};

export function InspectorShell({ draftId }: InspectorShellProps) {
  const hydrateDraft = useInspectStore((s) => s.hydrateDraft);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    hydrateDraft(draftId);
  }, [draftId, hydrateDraft]);

  return (
    <motion.div
      className="flex flex-col gap-6 pb-16"
      initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={reduceMotion ? { duration: 0 } : SPRING}
    >
      <InspectBreadcrumb />

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12 lg:gap-6">
        <section className="flex flex-col gap-3 lg:col-span-7">
          <MediaDeck />
        </section>

        <aside className="flex min-w-0 flex-col gap-4 lg:col-span-5">
          <InspectControlPanel />
          <HitlToolbar />
        </aside>
      </div>
    </motion.div>
  );
}
