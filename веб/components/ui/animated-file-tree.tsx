"use client";

/**
 * C-59 — TreeView for `/schedule` rail (21st animated file-tree pattern).
 * MCP 21st unavailable this wave → MagicUI/21st TreeView shape, Dark Luxury tokens.
 * Import `cn` from `@/lib/cn`. `framer-motion`, not `motion/react`.
 */

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronRight, FileText, Folder, FolderOpen } from "lucide-react";
import { cn } from "@/lib/cn";

const SPRING = { type: "spring" as const, damping: 25, stiffness: 300 };
const INSTANT = { duration: 0 };

type TreeViewContextValue = {
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
};

const TreeViewContext = createContext<TreeViewContextValue | null>(null);

function useTreeView() {
  return useContext(TreeViewContext);
}

type TreeViewProps = {
  children: ReactNode;
  className?: string;
  selectedId?: string | null;
  onSelectedIdChange?: (id: string | null) => void;
};

export function TreeView({
  children,
  className,
  selectedId: selectedIdProp,
  onSelectedIdChange,
}: TreeViewProps) {
  const [uncontrolled, setUncontrolled] = useState<string | null>(null);
  const selectedId = selectedIdProp ?? uncontrolled;
  const setSelectedId = useCallback(
    (id: string | null) => {
      onSelectedIdChange?.(id);
      if (selectedIdProp === undefined) setUncontrolled(id);
    },
    [onSelectedIdChange, selectedIdProp],
  );

  return (
    <TreeViewContext.Provider value={{ selectedId, setSelectedId }}>
      <div
        data-testid="animated-file-tree"
        className={cn("flex flex-col gap-0.5", className)}
        role="tree"
      >
        {children}
      </div>
    </TreeViewContext.Provider>
  );
}

type FolderProps = {
  value: string;
  label: ReactNode;
  children?: ReactNode;
  defaultOpen?: boolean;
  className?: string;
};

export function TreeFolder({
  value,
  label,
  children,
  defaultOpen = false,
  className,
}: FolderProps) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div role="treeitem" aria-expanded={open} data-folder-id={value} className={className}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-1.5 rounded-md px-1.5 py-1.5 text-left",
          "text-sm text-[var(--text-primary)]",
          "hover:bg-[color-mix(in_srgb,var(--bg-hover)_80%,transparent)]",
        )}
      >
        <motion.span
          className="inline-flex text-[var(--text-muted)]"
          animate={{ rotate: open ? 90 : 0 }}
          transition={reduceMotion ? INSTANT : SPRING}
        >
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
        </motion.span>
        {open ? (
          <FolderOpen className="h-3.5 w-3.5 shrink-0 text-[var(--accent-gold)]" />
        ) : (
          <Folder className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
        )}
        <span className="min-w-0 flex-1 whitespace-normal break-words text-wrap">
          {label}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            role="group"
            initial={
              reduceMotion ? false : { opacity: 0, scale: 0.98 }
            }
            animate={{ opacity: 1, scale: 1 }}
            exit={
              reduceMotion
                ? undefined
                : { opacity: 0, scale: 0.98 }
            }
            transition={reduceMotion ? INSTANT : SPRING}
            className="overflow-hidden border-l border-[var(--border-glass)] pl-3 ml-3"
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

type TreeItemProps = {
  value: string;
  children: ReactNode;
  className?: string;
  testId?: string;
  dataPostId?: string;
  dataModuleId?: string;
  onSelect?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
};

export function TreeItem({
  value,
  children,
  className,
  testId,
  dataPostId,
  dataModuleId,
  onSelect,
  draggable,
  onDragStart,
}: TreeItemProps) {
  const ctx = useTreeView();
  const selected = ctx?.selectedId === value;
  const reduceMotion = useReducedMotion();

  // Native <button>: framer-motion's onDragStart is pan/gesture, not HTML5 DnD.
  return (
    <button
      type="button"
      role="treeitem"
      aria-selected={selected}
      data-testid={testId}
      data-post-id={dataPostId}
      data-module-id={dataModuleId}
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={() => {
        ctx?.setSelectedId(value);
        onSelect?.();
      }}
      className={cn(
        "flex w-full items-start gap-1.5 rounded-md px-1.5 py-1.5 text-left transition-transform",
        !reduceMotion && "active:scale-[0.98]",
        selected
          ? "bg-[color-mix(in_srgb,var(--accent-gold)_12%,transparent)] text-[var(--accent-gold)]"
          : "text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
        className,
      )}
    >
      <FileText
        className={cn(
          "mt-0.5 h-3.5 w-3.5 shrink-0",
          selected ? "text-[var(--accent-gold)]" : "text-[var(--text-muted)]",
        )}
      />
      <span className="min-w-0 flex-1">{children}</span>
    </button>
  );
}
