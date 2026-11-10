import type { KeyboardCoordinateGetter } from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { BOARD_COLUMNS, type BoardColumn } from "@/lib/growth-center/workspace-model";

/** Horizontal keys select columns, including empty ones; vertical keys sort cards. */
export function createKanbanKeyboardCoordinates() {
  let currentColumn: BoardColumn | null = null;
  const coordinateGetter: KeyboardCoordinateGetter = (event, args) => {
    if (event.code !== "ArrowLeft" && event.code !== "ArrowRight") return sortableKeyboardCoordinates(event, args);
    const activeRect = args.context.collisionRect;
    if (!activeRect) return;
    event.preventDefault();
    const overColumn = args.context.over?.data.current?.column;
    const activeColumn = args.context.active?.data.current?.column;
    const from = currentColumn ?? overColumn ?? activeColumn;
    const index = BOARD_COLUMNS.findIndex((column) => column === from);
    if (index < 0) return;
    const nextColumn = BOARD_COLUMNS[index + (event.code === "ArrowRight" ? 1 : -1)];
    if (!nextColumn) return;
    const target = args.context.droppableContainers.get(`column-${nextColumn}`);
    if (!target || target.disabled || !target.node.current) return;
    const targetRect = target.node.current.getBoundingClientRect();
    if (targetRect.width <= 0 || targetRect.height <= 0) return;
    currentColumn = nextColumn;
    // Center the complete active rectangle in the column, rather than aiming at
    // a sortable card which may not exist, be scrolled out, or belong elsewhere.
    return {
      x: targetRect.left + (targetRect.width - activeRect.width) / 2,
      y: targetRect.top + (targetRect.height - activeRect.height) / 2,
    };
  };
  return { coordinateGetter, reset: (column: BoardColumn | null) => { currentColumn = column; } };
}
