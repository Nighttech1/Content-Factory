"use client";

import { useState } from "react";
import type { WorkspaceCard, WorkspaceView } from "@/lib/growth-center/workspace-model";
import type { ContentEntry } from "@/lib/growth-center/model";
import { WorkspaceDialog } from "./WorkspaceDialog";
import type { useGrowthWorkspace } from "./useGrowthWorkspace";
import styles from "./workspace.module.css";

const departmentLabel: Record<string, string> = { "reel-lead": "Руководитель отдела рилсов", "carousel-lead": "Руководитель отдела каруселей", "telegram-graphics-lead": "Руководитель отдела Telegram-графики", "youtube-lead": "Руководитель YouTube-направления", "scriptwriter-article": "Ответственный за статьи" };

export function WorkspaceCardDialog({ card, plan, prepared, view, busy, error, run, onClose }: {
  card: WorkspaceCard;
  plan?: Pick<ContentEntry, "product"> & { plannedDate: string | null };
  prepared?: WorkspaceView["preparedDetails"][string];
  view: WorkspaceView;
  busy: boolean;
  error: string | null;
  run: ReturnType<typeof useGrowthWorkspace>["run"];
  onClose: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [revision, setRevision] = useState(view.revision);
  const [draft, setDraft] = useState(card);
  const [validation, setValidation] = useState<string | null>(null);
  const beginEdit = () => { setDraft(structuredClone(card)); setRevision(view.revision); setValidation(null); setEditing(true); };

  return <WorkspaceDialog open onOpenChange={(open) => { if (!open && !busy) onClose(); }} title={card.title} description={`${card.id} · ${card.format} · ${card.channels.join(" / ")}`} testId="growth-card-dialog">
    <p className={styles.muted} data-testid="growth-dialog-plan-meta">План: {plan?.plannedDate ? plan.plannedDate.split("-").reverse().join(".") : "дата не указана"} · Продукт: {plan?.product || "не указан"}</p>
    {editing ? <form onSubmit={async (event) => {
      event.preventDefault();
      const publication = draft.publication;
      if (publication && (!publication.url.trim() || !publication.publishedAt)) { setValidation("Для факта публикации нужны и ссылка, и дата."); return; }
      setValidation(null);
      const next = await run({ type: "update_card", cardId: card.id, expectedRevision: revision, patch: { title: draft.title.trim(), script: draft.script?.trim() || null, shots: draft.shots, publication } });
      if (next) setEditing(false);
    }}>
      <label className={styles.field}>Тема<input data-testid="growth-edit-title" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} required maxLength={4000} disabled={busy} /></label>
      <label className={styles.field}>Сценарий<textarea data-testid="growth-edit-script" value={draft.script || ""} onChange={(event) => setDraft({ ...draft, script: event.target.value })} maxLength={30000} rows={7} disabled={busy} placeholder="Внеси подготовленный сценарий" /></label>
      <fieldset className={styles.editSection}><legend>План съёмки / разработки</legend>
        {draft.shots.map((shot, index) => <div className={styles.shotEditor} key={index}>
          <label>Кадр / шаг {index + 1}<input aria-label={`Визуал шага ${index + 1}`} value={shot.visual} onChange={(event) => setDraft({ ...draft, shots: draft.shots.map((item, i) => i === index ? { ...item, visual: event.target.value } : item) })} required disabled={busy} maxLength={4000} /></label>
          <label>Речь<textarea aria-label={`Речь шага ${index + 1}`} value={shot.spoken} onChange={(event) => setDraft({ ...draft, shots: draft.shots.map((item, i) => i === index ? { ...item, spoken: event.target.value } : item) })} rows={2} disabled={busy} maxLength={4000} /></label>
          <label>Текст в кадре<input aria-label={`Текст шага ${index + 1}`} value={shot.onScreen} onChange={(event) => setDraft({ ...draft, shots: draft.shots.map((item, i) => i === index ? { ...item, onScreen: event.target.value } : item) })} disabled={busy} maxLength={2000} /></label>
          <button type="button" className={styles.textButton} onClick={() => setDraft({ ...draft, shots: draft.shots.filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i })) })} disabled={busy}>Убрать шаг {index + 1}</button>
        </div>)}
        <button type="button" data-testid="growth-add-shot" className={styles.button} onClick={() => setDraft({ ...draft, shots: [...draft.shots, { order: draft.shots.length, visual: "", spoken: "", onScreen: "" }] })} disabled={busy || draft.shots.length >= 100}>Добавить шаг</button>
      </fieldset>
      <fieldset className={styles.editSection}><legend>Факт публикации</legend>
        <label className={styles.field}>Ссылка на публикацию<input data-testid="growth-edit-publication-url" type="url" value={draft.publication?.url || ""} onChange={(event) => setDraft({ ...draft, publication: event.target.value || draft.publication?.publishedAt ? { url: event.target.value, publishedAt: draft.publication?.publishedAt || "" } : null })} disabled={busy} maxLength={2000} /></label>
        <label className={styles.field}>Дата публикации<input data-testid="growth-edit-publication-date" type="date" value={draft.publication?.publishedAt || ""} onChange={(event) => setDraft({ ...draft, publication: event.target.value || draft.publication?.url ? { url: draft.publication?.url || "", publishedAt: event.target.value } : null })} disabled={busy} /></label>
      </fieldset>
      {view.revision !== revision && <p className={styles.muted}>Общая версия изменилась. <button type="button" className={styles.textButton} data-testid="growth-card-reload" disabled={busy} onClick={beginEdit}>Заменить черновик актуальной карточкой</button></p>}
      {(validation || error) && <p className={styles.error} role="alert">{validation || error}</p>}
      <div className={styles.dialogActions}><button type="button" data-testid="growth-card-cancel" className={styles.button} onClick={() => { setEditing(false); setValidation(null); }} disabled={busy}>Отмена</button><button type="submit" data-testid="growth-card-save" className={styles.primaryButton} disabled={busy}>{busy ? "Сохраняем…" : "Сохранить"}</button></div>
    </form> : <>
      <section className={styles.modalSection} data-testid="growth-card-brief"><h3>Бриф</h3>{prepared ? <><dl className={styles.briefSummary}><div><dt>Цель</dt><dd>{prepared.brief.goal}</dd></div><div><dt>Для кого</dt><dd>{prepared.brief.audience}</dd></div><div><dt>Барьер</dt><dd>{prepared.brief.barrier}</dd></div><div><dt>Основная мысль</dt><dd>{prepared.brief.keyMessage}</dd></div><div><dt>Призыв к действию</dt><dd>{prepared.brief.cta}</dd></div><div><dt>Что подготовить</dt><dd>{prepared.brief.deliverable}</dd></div></dl>{prepared.brief.requirements.length > 0 && <ul className={styles.briefRequirements}>{prepared.brief.requirements.map((requirement, index) => <li key={index}>{requirement}</li>)}</ul>}</> : <p className={styles.muted}>Подготовленный бриф пока не получен.</p>}</section>
      <section className={styles.modalSection} data-testid="growth-card-script"><h3>Сценарий</h3>{card.script ? <div className={styles.script}>{card.script}</div> : <p className={styles.muted}>Сценарий пока не подготовлен.</p>}</section>
      <section className={styles.modalSection} data-testid="growth-card-shots"><h3>План съёмки / разработки</h3>{card.shots.length ? <ol className={styles.shots}>{card.shots.map((shot) => <li key={shot.order}><strong>{shot.visual}</strong>{shot.spoken && <p>{shot.spoken}</p>}{shot.onScreen && <small>В кадре: {shot.onScreen}</small>}</li>)}</ol> : <p className={styles.muted}>План кадров и шагов ещё не внесён.</p>}</section>
      <section className={styles.modalSection} data-testid="growth-card-origin"><h3>Материал-источник</h3>{prepared ? <div className={styles.sourceList}>{prepared.provenance.sources.map((source) => <article key={source.url}><a data-testid="growth-card-source-link" href={source.url} target="_blank" rel="noreferrer">{source.url}</a><p className={styles.muted}>Проверено {source.observedAt}</p><p>{source.note}</p>{source.metrics.length > 0 && <ul>{source.metrics.map((metric, index) => <li key={index}>{metric.name}: {metric.value} {metric.unit} · {metric.observedAt}</li>)}</ul>}</article>)}</div> : card.origin.url ? <><a data-testid="growth-card-source-link" href={card.origin.url} target="_blank" rel="noreferrer">{card.origin.url}</a><p>{card.origin.note || "Данные источника ещё не подтверждены."}</p></> : <p className={styles.muted}>Конкретный материал-источник пока не подтверждён.</p>}</section>
      <section className={styles.modalSection} data-testid="growth-card-department"><h3>Решение руководителя отдела</h3>{prepared ? <div data-testid="growth-card-department-provenance"><p><strong>{departmentLabel[prepared.provenance.department.role] || prepared.provenance.department.role}</strong></p><p>Принята версия {prepared.provenance.unitVersion} · {prepared.provenance.department.decidedAt}</p><p>{prepared.provenance.department.note}</p>{prepared.localAdaptation && <p className={styles.muted} data-testid="growth-card-local-adaptation">После согласования внесены правки владельца.</p>}<dl className={styles.provenance}><div><dt>Исследование скаута</dt><dd>{prepared.provenance.scout.reportId} · {prepared.provenance.scout.researchedAt}</dd></div><div><dt>Принято контент-директором</dt><dd>{prepared.provenance.director.reviewedAt}</dd></div></dl></div> : <p className={styles.muted}>Подтверждённое решение руководителя отдела пока не получено.</p>}</section>
      <section className={styles.modalSection} data-testid="growth-card-publication"><h3>Публикация</h3>{card.publication ? <a href={card.publication.url} target="_blank" rel="noreferrer">Материал от {card.publication.publishedAt} ↗</a> : <p className={styles.muted}>Подтверждённой публикации нет.</p>}</section>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.dialogActions}><button type="button" data-testid="growth-card-edit" className={styles.primaryButton} onClick={beginEdit} disabled={!view.capabilities.writeEnabled || busy}>Редактировать</button></div>
    </>}
  </WorkspaceDialog>;
}
