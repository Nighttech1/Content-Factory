"use client";

import { useState } from "react";
import { Bookmark, Clapperboard, Lightbulb, Smile } from "lucide-react";
import {
  getStageContentMechanics,
  type ContentMechanic,
  type GrowthCenterDataset,
  type StageId,
} from "@/lib/growth-center/model";
import styles from "./growth-center.module.css";

type Filter = "all" | "humor" | "useful" | "series" | "other";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Все идеи" },
  { id: "humor", label: "Юмор" },
  { id: "useful", label: "Полезное" },
  { id: "series", label: "Мини-сериал" },
  { id: "other", label: "Другие механики" },
];
const KINDS: Record<ContentMechanic["kind"], string> = {
  humor: "Юмор и узнавание",
  useful: "Польза и сохранения",
  series: "Мини-сериал",
  interactive: "Игра и участие",
  trust: "Живой опыт и доверие",
  invitation: "Повод прийти",
};
const matches = (item: ContentMechanic, filter: Filter) =>
  filter === "all" || (filter === "other"
    ? !["humor", "useful", "series"].includes(item.kind)
    : item.kind === filter);
const REPO = "https://github.com/Nighttech1/Content-Factory/blob/codex/director-chatgpt-transfer/";

/** A keyed instance resets its filter when the selected funnel stage changes. */
export function ContentMechanics({ dataset, stageId, mode }: {
  dataset: GrowthCenterDataset;
  stageId: StageId;
  mode: "plan" | "fact";
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const ideas = getStageContentMechanics(dataset, stageId);
  const stage = dataset.stages.find((item) => item.id === stageId)!;
  const visible = ideas.filter((item) => matches(item, filter));
  const available = FILTERS.filter((item) => item.id === "all" || ideas.some((idea) => matches(idea, item.id)));

  return <section className={styles.mechanics} data-testid="growth-content-mechanics" data-stage-id={stageId} aria-labelledby="growth-mechanics-title">
    <div className={styles.sectionHead}>
      <div>
        <div className={styles.eyebrow}>Что поможет человеку перейти дальше</div>
        <h2 id="growth-mechanics-title">Контентные механики этапа</h2>
        <p>«{stage.label}»: какой интерес создаём, какой барьер снимаем и что проверяем.</p>
      </div>
      <span className={styles.mechanicsStatus}>Гипотезы стратегии</span>
    </div>

    {mode === "fact" ? <div className={styles.notice} data-testid="growth-mechanics-fact-empty">
      <b>Реализация механик ещё не подтверждена.</b><br />
      Идеи доступны в «Плане». Опубликованные материалы с датой и ссылкой показаны ниже отдельно.
    </div> : <>
      <p className={styles.subtle}>Предложения, а не новые задания на выпуск. Дату, производственный ID и запуск согласуем отдельно; сохранения и просмотры не равны гостям клуба.</p>
      {ideas.length > 0 ? <>
        <div className={styles.mechanicFilters} role="group" aria-label="Тип контентной механики" data-testid="growth-mechanic-filters">
          {available.map((item) => <button key={item.id} type="button" data-testid={`growth-mechanic-filter-${item.id}`} aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>{item.label}</button>)}
        </div>
        <p className={styles.subtle} role="status">Показано {visible.length} из {ideas.length} идей этапа. Фильтр не меняет производственные задания.</p>
        <div className={styles.mechanicGrid}>
          {visible.map((idea) => {
            const Icon = idea.kind === "humor" ? Smile : idea.kind === "useful" ? Bookmark : idea.kind === "series" ? Clapperboard : Lightbulb;
            const source = dataset.sources.find((item) => item.id === idea.sourceId);
            return <article className={styles.mechanicCard} key={idea.id} data-testid="growth-mechanic-card" data-mechanic-id={idea.id} data-kind={idea.kind}>
              <div className={styles.mechanicTop}><span><Icon size={16} aria-hidden="true" />{KINDS[idea.kind]}</span><small>Идея · не в производстве</small></div>
              <h3>{idea.title}</h3>
              <p className={styles.mechanicHook}>«{idea.hook}»</p>
              <p className={styles.mechanicPurpose}>{idea.purpose}</p>
              <dl className={styles.mechanicFields}>
                <div><dt>Потребность</dt><dd>{idea.need}</dd></div>
                <div><dt>Какой барьер снимаем</dt><dd>{idea.barrier}</dd></div>
              </dl>
              <details className={styles.mechanicExample}><summary>Пример и сценарий</summary><p>{idea.example}</p></details>
              <div className={styles.mechanicFormat}>{idea.format} · {idea.channels.join(" / ")}</div>
              <dl className={styles.mechanicOutcome}>
                <div><dt>Следующее действие зрителя</dt><dd>{idea.cta}</dd></div>
                <div><dt>Что измеряем после теста</dt><dd>{idea.successMetric}</dd></div>
              </dl>
              <p className={styles.evidence}>Основание: {source ? <a href={/^https?:\/\//.test(source.location) ? source.location : REPO + source.location} target="_blank" rel="noreferrer">{source.title} ↗</a> : "Источник не указан"}</p>
            </article>;
          })}
        </div>
      </> : <div className={styles.notice}>Механики для этого этапа пока не предложены. Существующие задания и фактические данные показаны отдельно.</div>}
    </>}
  </section>;
}
