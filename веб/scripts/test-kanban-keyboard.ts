import assert from "node:assert/strict";
import type { KeyboardCoordinateGetter } from "@dnd-kit/core";
import { createKanbanKeyboardCoordinates } from "../components/growth-center/kanban-keyboard";
import { BOARD_COLUMNS } from "../lib/growth-center/workspace-model";

type Args = Parameters<KeyboardCoordinateGetter>[1];
const rect = (left: number, top = 20, width = 224, height = 520) => ({ left, top, width, height, right: left + width, bottom: top + height });
function fixture() {
  const boxes = new Map(BOARD_COLUMNS.map((column, index) => [column, rect(index * 240)]));
  const containers = new Map(BOARD_COLUMNS.map((column) => [`column-${column}`, { id: `column-${column}`, disabled: false, node: { current: { getBoundingClientRect: () => boxes.get(column)! } }, data: { current: { column } } }]));
  const droppableContainers = { get: (id: string) => containers.get(id), getEnabled: () => [...containers.values()].filter((item) => !item.disabled) };
  const args = { active: "card-1", currentCoordinates: { x: 12, y: 60 }, context: { active: { id: "card-1", data: { current: { column: "task" } } }, over: { id: "card-1", data: { current: { column: "task" } } }, collisionRect: rect(12, 60, 200, 300), droppableContainers, droppableRects: new Map([...boxes].map(([id, box]) => [`column-${id}`, box])), scrollableAncestors: [] } } as unknown as Args;
  let prevented = 0;
  const key = (code: string) => ({ code, preventDefault: () => { prevented++; } }) as KeyboardEvent;
  return { args, key, boxes, containers, prevented: () => prevented };
}
let checks = 0;
function check(name: string, run: () => void) { run(); checks++; console.log("PASS " + name); }
check("empty adjacent column uses actual column center", () => {
  const f = fixture(), keyboard = createKanbanKeyboardCoordinates(); keyboard.reset("task");
  assert.deepEqual(keyboard.coordinateGetter(f.key("ArrowRight"), f.args), { x: 252, y: 130 });
  assert.equal(f.prevented(), 1);
});
check("repeated Right traverses all five columns despite stale previous collision", () => {
  const f = fixture(), keyboard = createKanbanKeyboardCoordinates(); keyboard.reset("task");
  for (const x of [252, 492, 732, 972]) assert.deepEqual(keyboard.coordinateGetter(f.key("ArrowRight"), f.args), { x, y: 130 });
  assert.equal(keyboard.coordinateGetter(f.key("ArrowRight"), f.args), undefined);
});
check("Left traverses backwards from release and stops at task", () => {
  const f = fixture(), keyboard = createKanbanKeyboardCoordinates(); keyboard.reset("release");
  for (const x of [732, 492, 252, 12]) assert.deepEqual(keyboard.coordinateGetter(f.key("ArrowLeft"), f.args), { x, y: 130 });
  assert.equal(keyboard.coordinateGetter(f.key("ArrowLeft"), f.args), undefined);
});
check("scrolled or resized destination uses fresh DOM geometry", () => {
  const f = fixture(), keyboard = createKanbanKeyboardCoordinates(); keyboard.reset("task");
  f.boxes.set("shooting", rect(-80, 40, 244, 480));
  assert.deepEqual(keyboard.coordinateGetter(f.key("ArrowRight"), f.args), { x: -58, y: 130 });
});
check("disabled, missing and zero-size targets cannot be selected", () => {
  for (const mode of ["disabled", "missing", "zero"] as const) {
    const f = fixture(), keyboard = createKanbanKeyboardCoordinates(); keyboard.reset("task");
    if (mode === "disabled") f.containers.get("column-shooting")!.disabled = true;
    if (mode === "missing") f.containers.delete("column-shooting");
    if (mode === "zero") f.boxes.set("shooting", rect(240, 20, 0, 520));
    assert.equal(keyboard.coordinateGetter(f.key("ArrowRight"), f.args), undefined);
  }
});
check("reset removes navigation state between cancelled or different drags", () => {
  const f = fixture(), keyboard = createKanbanKeyboardCoordinates(); keyboard.reset("approval");
  keyboard.coordinateGetter(f.key("ArrowLeft"), f.args); keyboard.reset(null);
  assert.deepEqual(keyboard.coordinateGetter(f.key("ArrowRight"), f.args), { x: 252, y: 130 });
});
check("vertical keys keep the sortable handler and unrelated keys do nothing", () => {
  const f = fixture(), keyboard = createKanbanKeyboardCoordinates(); keyboard.reset("task");
  assert.equal(keyboard.coordinateGetter(f.key("ArrowDown"), f.args), undefined); assert.equal(f.prevented(), 1);
  assert.equal(keyboard.coordinateGetter(f.key("KeyA"), f.args), undefined); assert.equal(f.prevented(), 1);
});
console.log(`${checks} keyboard geometry guards passed`);
