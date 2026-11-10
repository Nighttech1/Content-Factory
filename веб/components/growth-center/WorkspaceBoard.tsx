"use client";

import { GripVertical, RefreshCw } from "lucide-react";
import { BOARD_COLUMNS, type BoardColumn, type WorkspaceCard, type ScoutRequest } from "@/lib/growth-center/workspace-model";
import type { ContentEntry } from "@/lib/growth-center/model";
import styles from "./workspace.module.css";

export const COLUMN_LABELS: Record<BoardColumn, string> = { task: "Задача", shooting: "Съёмка", development: "Монтаж/Разработка", approval: "Согласование", release: "Выпуск" };

export function WorkspaceBoard({ cards, planById, stageId, canWrite, busy, requests, onOpen, onMove, onScout }: {
  cards: WorkspaceCard[];
  planById: Record<string, Pick<ContentEntry, "product" | "plannedDate">>;
  stageId: string;
  canWrite: boolean;
  busy: boolean;
  requests: ScoutRequest[];
  onOpen: (id: string) => void;
  onMove: (id: string, column: BoardColumn, beforeId: string | null) => void;
  onScout: (id: string) => void;
}) {
  return <div className={styles.boardScroll} data-testid="growth-kanban" data-stage-id={stageId} tabIndex={0} role="region" aria-label="Доска контента, прокрутка по горизонтали">
    <div className={styles.board}>
      {BOARD_COLUMNS.map((column) => {
        const items = cards.filter((card) => card.column === column);
        return <section key={column} className={styles.column} data-testid={`growth-column-${column}`} aria-label={COLUMN_LABELS[column]} onDragOver={(event) => { if (canWrite && !busy) event.preventDefault(); }} onDrop={(event) => {
          if (!canWrite || busy) return;
          event.preventDefault();
          const id = event.dataTransfer.getData("text/plain");
          if (cards.some((card) => card.id === id)) onMove(id, column, null);
        }}>
          <h3>{COLUMN_LABELS[column]}<span>{items.length}</span></h3>
          <div className={styles.columnBody}>
            {items.map((card) => {
              const request = requests.filter((item) => item.cardId === card.id).at(-1);
              const plan = planById[card.id];
              return <article key={card.id} className={styles.card} data-testid="growth-content-card" data-card-id={card.id} data-column={card.column} draggable={canWrite && !busy} onDragStart={(event) => { event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", card.id); }} onDragOver={(event) => { if (canWrite && !busy) event.preventDefault(); }} onDrop={(event) => {
                if (!canWrite || busy) return;
                event.preventDefault(); event.stopPropagation();
                const id = event.dataTransfer.getData("text/plain");
                if (id !== card.id && cards.some((item) => item.id === id)) onMove(id, column, card.id);
              }}>
                <div className={styles.cardTop}><span><GripVertical size={13} aria-hidden="true" />{card.format}</span><button type="button" className={styles.cardUpdate} data-testid={`growth-update-${card.id}`} onClick={() => onScout(card.id)} disabled={!canWrite || busy}><RefreshCw size={13} aria-hidden="true" />Обновить</button></div>
                <button type="button" className={styles.cardTitle} data-testid={`growth-open-${card.id}`} onClick={() => onOpen(card.id)}>{card.title}</button>
                <p className={styles.cardMeta}>{card.id}<br />{card.channels.join(" · ")}</p>
                <p className={styles.cardMeta} data-testid="growth-card-plan-meta">План: {plan?.plannedDate ? plan.plannedDate.split("-").reverse().join(".") : "дата не указана"}<br />{plan?.product || "Продукт не указан"}</p>
                <span className={card.origin.evidence === "verified" ? styles.verified : styles.needsResearch}>{card.origin.evidence === "verified" ? "Источник проверен" : "Нужна разведка"}</span>
                {card.publication && <a href={card.publication.url} className={styles.publication} target="_blank" rel="noreferrer">Опубликовано ↗</a>}
                <label className={styles.moveLabel}>Переместить в…<select data-testid={`growth-move-${card.id}`} aria-label={`Переместить ${card.id}`} value={card.column} disabled={!canWrite || busy} onChange={(event) => onMove(card.id, event.target.value as BoardColumn, null)}>{BOARD_COLUMNS.map((id) => <option value={id} key={id}>{COLUMN_LABELS[id]}</option>)}</select></label>
                {request && <p className={styles.requestStatus}>{request.status === "git_saved" ? "Запрос записан в GitHub" : request.status === "git_pending" ? "Запрос сохранён · GitHub ожидает" : "Запрос сохранён на сервере"}<br />{request.id}</p>}
              </article>;
            })}
            {items.length === 0 && <div className={styles.emptyColumn}>Нет карточек</div>}
          </div>
        </section>;
      })}
    </div>
  </div>;
}
