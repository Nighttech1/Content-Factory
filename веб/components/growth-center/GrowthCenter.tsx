"use client";

import Link from "next/link";
import { useState } from "react";
import { getPlanFact, type ContentEntry, type GrowthCenterDataset } from "@/lib/growth-center/model";
import { WORKSPACE_STAGE_IDS, getStageCards, type WorkspaceStageId, type BoardColumn } from "@/lib/growth-center/workspace-model";
import { useGrowthWorkspace } from "./useGrowthWorkspace";
import { WorkspaceBoard } from "./WorkspaceBoard";
import { WorkspaceCardDialog } from "./WorkspaceCardDialog";
import { WeeklyChart } from "./WeeklyChart";
import styles from "./workspace.module.css";

const number = (value: number | null) => value === null ? "Нет данных" : new Intl.NumberFormat("ru-RU").format(value);
const week = (value: string) => `${value.slice(8, 10)}.${value.slice(5, 7)}`;

export function GrowthCenter({ dataset }: { dataset: GrowthCenterDataset }) {
  const workspace = useGrowthWorkspace();
  const { view, loading, busy, error, run } = workspace;
  const [selectedStage, setSelectedStage] = useState<WorkspaceStageId>("awareness");
  const [mode, setMode] = useState<"plan" | "fact">("plan");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const stage = dataset.stages.find((item) => item.id === selectedStage)!;
  const planTarget = getPlanFact(dataset, selectedStage).target;
  const activeIds = new Set(view?.activeCardIds || []);
  const allCards = view ? getStageCards(view, selectedStage).filter((card) => activeIds.has(card.id)) : [];
  const cards = mode === "plan" ? allCards : allCards.filter((card) => card.publication !== null);
  const selectedCard = view?.cards.find((card) => card.id === selectedCardId);
  const planById = { ...Object.fromEntries(dataset.content.map((item) => [item.id, { product: item.product, plannedDate: item.plannedDate }])), ...Object.fromEntries(Object.entries(view?.preparedDetails || {}).map(([id, details]) => [id, { product: details.brief.product, plannedDate: details.brief.plannedDate }])) } as Record<string, Pick<ContentEntry, "product"> & { plannedDate: string | null }>;

  const move = async (cardId: string, column: BoardColumn, beforeCardId: string | null) => {
    setNotice(null);
    if (await run({ type: "move_card", cardId, column, beforeCardId })) setNotice("Сохранено.");
  };


  return <div className={styles.workspace} data-testid="growth-center">
    <nav className={styles.mobileNav} aria-label="Разделы фабрики"><Link href="/studio">Студия</Link><Link href="/schedule">Расписание</Link><Link href="/settings">Настройки</Link><Link href="/growth" aria-current="page">Ситуационный центр</Link></nav>
    <header className={styles.header}>
      <div><h1>Ситуационный центр</h1><p>{mode === "plan" ? `План целей: ${week(planTarget?.periodStart || dataset.planHorizon.start)} — ${week(planTarget?.periodEnd || dataset.planHorizon.end)}` : view ? `Неделя с ${week(view.weekKey)}` : "Общие данные клуба"}</p></div>
      <div className={styles.headerActions}>
        <div className={styles.mode} role="group" aria-label="План или факт"><button type="button" data-testid="growth-mode-plan" aria-pressed={mode === "plan"} onClick={() => setMode("plan")}>План</button><button type="button" data-testid="growth-mode-fact" aria-pressed={mode === "fact"} onClick={() => setMode("fact")}>Факт</button></div>
      </div>
    </header>
    {error && <div className={styles.error} role="alert">{error}{!view && <button type="button" className={styles.textButton} onClick={() => { void workspace.refresh().then(workspace.clearError).catch(() => {}); }}>Повторить загрузку</button>}</div>}
    {notice && <p className={styles.notice} role="status">{notice}</p>}

    <section className={styles.funnel} aria-label="Этапы пути участника" data-testid="growth-center-funnel">
      {WORKSPACE_STAGE_IDS.map((id, index) => {
        const item = dataset.stages.find((entry) => entry.id === id)!;
        const value = mode === "plan" ? getPlanFact(dataset, id).planned : view?.counts[id] ?? null;
        return <button type="button" key={id} className={styles.stage} data-testid={`growth-stage-${id}`} aria-pressed={selectedStage === id} onClick={() => { setSelectedStage(id); setNotice(null); }}>
          <span className={styles.stageNumber}>0{index + 1}</span><span className={styles.stageTitle}>{item.label}</span><strong className={value === null ? styles.unknownCount : styles.stageCount}>{number(value)}</strong><small>{mode === "plan" ? "Предложенная цель" : "Факт недели"}</small>
        </button>;
      })}
    </section>
    <section className={styles.profile} data-testid="growth-stage-detail" data-stage-id={selectedStage} aria-label={stage.label}>
      <div><span>Аудитория</span><p>{stage.audience}</p></div><div><span>Потребность</span><p>{stage.job}</p></div><div><span>Барьер</span><p>{stage.barrier}</p></div>
    </section>
    <section className={styles.boardSection}>
      <div className={styles.sectionHeading}><h2>Контент · {stage.label}</h2><span>{view ? `${cards.length} материалов` : ""}</span></div>
      {loading && !view ? <div className={styles.loading}>Загружаем доску…</div> : view ? <>
        {cards.length === 0 && <p className={styles.muted} data-testid={mode === "fact" ? "growth-fact-empty" : "growth-catalog-empty"}>{mode === "fact" ? "Подтверждённых публикаций этого этапа пока нет." : view.catalogStatus?.state === "conflict" ? "Каталог требует проверки. Материалы пока недоступны." : "Утверждённых материалов этого этапа пока нет."}</p>}
        <WorkspaceBoard cards={cards} planById={planById} stageId={selectedStage} canWrite={view.capabilities.writeEnabled} busy={busy} onOpen={(id) => { workspace.clearError(); setSelectedCardId(id); }} onMove={(...args) => { void move(...args); }} />
      </> : <p className={styles.muted}>Доска появится после загрузки общих данных.</p>}
    </section>
    <WeeklyChart view={view} stageId={selectedStage} label={stage.label} />

    {selectedCard && view && <WorkspaceCardDialog key={selectedCard.id} card={selectedCard} plan={planById[selectedCard.id]} prepared={view.preparedDetails?.[selectedCard.id]} view={view} busy={busy} error={error} run={run} onClose={() => setSelectedCardId(null)} />}
  </div>;
}
