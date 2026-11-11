"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { GripVertical } from "lucide-react";
import { DndContext, DragOverlay, KeyboardSensor, MouseSensor, TouchSensor, closestCenter, pointerWithin, useDroppable, useSensor, useSensors, type CollisionDetection } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BOARD_COLUMNS, type BoardColumn, type WorkspaceCard } from "@/lib/growth-center/workspace-model";
import type { ContentEntry } from "@/lib/growth-center/model";
import { createKanbanKeyboardCoordinates } from "./kanban-keyboard";
import styles from "./workspace.module.css";

export const COLUMN_LABELS: Record<BoardColumn, string> = { task: "Задача", shooting: "Съёмка", development: "Монтаж/Разработка", approval: "Согласование", release: "Выпуск" };
type PlanMetadata = Pick<ContentEntry, "product"> & { plannedDate: string | null; shootingDate?: string | null };
type BoardProps = {
  cards: WorkspaceCard[];
  planById: Record<string, PlanMetadata>;
  stageId: string;
  canWrite: boolean;
  busy: boolean;
  onOpen: (id: string) => void;
  onMove: (id: string, column: BoardColumn, beforeId: string | null) => void;
};

/** Prefer the card under the pointer, then its column; keyboard uses rectangle distance. */
const collisions: CollisionDetection = (args) => {
  const underPointer = pointerWithin(args).filter((entry) => entry.id !== args.active.id);
  const cards = underPointer.filter((entry) => !String(entry.id).startsWith("column-"));
  return cards.length ? cards : underPointer.length ? underPointer : closestCenter(args);
};

function BoardCard({ card, plan, canWrite, busy, onOpen, onMove }: {
  card: WorkspaceCard;
  plan?: PlanMetadata;
} & Pick<BoardProps, "canWrite" | "busy" | "onOpen" | "onMove">) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: card.id, data: { column: card.column, cardId: card.id }, disabled: !canWrite || busy });
  return <article ref={setNodeRef} className={styles.card} data-testid="growth-content-card" data-card-id={card.id} data-column={card.column} data-dragging={isDragging || undefined} style={{ transform: CSS.Transform.toString(transform), transition }}>
    <div className={styles.cardTop}>
      <span><button type="button" ref={setActivatorNodeRef} className={styles.dragHandle} data-testid={`growth-drag-${card.id}`} {...attributes} {...listeners} aria-label={`Перенести ${card.id}`} disabled={!canWrite || busy}><GripVertical size={17} aria-hidden="true" /></button>{card.format}</span>
    </div>
    <button type="button" className={styles.cardTitle} data-testid={`growth-open-${card.id}`} onClick={() => onOpen(card.id)}>{card.title}</button>
    <p className={styles.cardMeta}>{card.id}<br />{card.channels.join(" · ")}</p>
    <p className={styles.cardMeta} data-testid="growth-card-plan-meta">План: {plan?.plannedDate ? plan.plannedDate.split("-").reverse().join(".") : "дата не указана"}<br />{plan?.product || "Продукт не указан"}</p>
    {plan?.shootingDate && <p className={styles.cardMeta} data-testid="growth-card-shooting">Съёмка: {plan.shootingDate.split("-").reverse().join(".")}</p>}
    <span className={card.origin.evidence === "verified" ? styles.verified : styles.needsResearch}>{card.origin.evidence === "verified" ? "Источник проверен" : "Нужна разведка"}</span>
    {card.publication && <a href={card.publication.url} className={styles.publication} target="_blank" rel="noreferrer">Опубликовано ↗</a>}
    <label className={styles.moveLabel}>Переместить в…<select data-testid={`growth-move-${card.id}`} aria-label={`Переместить ${card.id}`} value={card.column} disabled={!canWrite || busy} onChange={(event) => onMove(card.id, event.target.value as BoardColumn, null)}>{BOARD_COLUMNS.map((id) => <option value={id} key={id}>{COLUMN_LABELS[id]}</option>)}</select></label>
  </article>;
}

function BoardColumnView({ column, cards, planById, canWrite, busy, onOpen, onMove }: { column: BoardColumn } & Pick<BoardProps, "cards" | "planById" | "canWrite" | "busy" | "onOpen" | "onMove">) {
  const { setNodeRef, isOver } = useDroppable({ id: `column-${column}`, data: { column }, disabled: !canWrite || busy });
  return <section ref={setNodeRef} className={styles.column} data-testid={`growth-column-${column}`} data-drag-over={isOver || undefined} data-drop-disabled={!canWrite || busy} aria-label={COLUMN_LABELS[column]}>
    <h3>{COLUMN_LABELS[column]}<span>{cards.length}</span></h3>
    <div className={styles.columnBody} data-testid={`growth-column-scroll-${column}`} tabIndex={0} role="region" aria-label={`${COLUMN_LABELS[column]}: карточки`}>
      <SortableContext id={`column-${column}`} items={cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
        {cards.map((card) => <BoardCard key={card.id} card={card} plan={planById[card.id]} canWrite={canWrite} busy={busy} onOpen={onOpen} onMove={onMove} />)}
      </SortableContext>
      {cards.length === 0 && <div className={styles.emptyColumn}>Нет карточек</div>}
    </div>
  </section>;
}

export function WorkspaceBoard({ cards, planById, stageId, canWrite, busy, onOpen, onMove }: BoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [keyboardTarget, setKeyboardTarget] = useState<BoardColumn | null>(null);
  const keyboard = useMemo(() => createKanbanKeyboardCoordinates(setKeyboardTarget), []);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: keyboard.coordinateGetter, scrollBehavior: "auto" }),
  );
  const activeCard = cards.find((card) => card.id === activeId);
  return <DndContext id="growth-workspace-kanban" sensors={sensors} collisionDetection={collisions} onDragStart={(event) => { setActiveId(String(event.active.id)); keyboard.reset(cards.find((card) => card.id === String(event.active.id))?.column ?? null); }} onDragCancel={() => { setActiveId(null); keyboard.reset(null); }} onDragEnd={(event) => {
    setActiveId(null);
    keyboard.reset(null);
    if (!canWrite || busy || !event.over) return;
    const id = String(event.active.id);
    const targetId = String(event.over.id);
    if (targetId === id) return;
    const targetCard = cards.find((card) => card.id === targetId);
    const column = targetCard?.column || BOARD_COLUMNS.find((item) => targetId === `column-${item}`);
    if (column && cards.some((card) => card.id === id)) onMove(id, column, targetCard?.id ?? null);
  }} accessibility={{ screenReaderInstructions: { draggable: "Чтобы перенести карточку, нажми пробел на ручке переноса, выбери место стрелками и нажми пробел снова. Escape отменяет перенос. Также можно выбрать колонку в списке «Переместить в»." }, announcements: {
    onDragStart: ({ active }) => `Выбрана карточка ${active.id}.`,
    onDragOver: ({ over }) => over ? "Место переноса выбрано." : "Выбери колонку или карточку на доске.",
    onDragEnd: ({ over }) => over ? "Место выбрано. Ожидаем подтверждения сохранения." : "Перенос отменён.",
    onDragCancel: () => "Перенос отменён.",
  } }}>
    <div className={styles.boardScroll} data-testid="growth-kanban" data-stage-id={stageId} data-keyboard-target={keyboardTarget || undefined} tabIndex={0} role="region" aria-label="Доска контента, прокрутка по горизонтали">
      <div className={styles.board}>{BOARD_COLUMNS.map((column) => <BoardColumnView key={column} column={column} cards={cards.filter((card) => card.column === column)} planById={planById} canWrite={canWrite} busy={busy} onOpen={onOpen} onMove={onMove} />)}</div>
    </div>
    {activeCard && createPortal(<DragOverlay dropAnimation={null}><div className={styles.dragPreview}><small>{activeCard.format}</small><strong>{activeCard.title}</strong></div></DragOverlay>, document.body)}
  </DndContext>;
}
