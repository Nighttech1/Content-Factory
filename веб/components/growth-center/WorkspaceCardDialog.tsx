"use client";

import { useState } from "react";
import type { WorkspaceCard, WorkspaceView } from "@/lib/growth-center/workspace-model";
import type { ContentEntry } from "@/lib/growth-center/model";
import { WorkspaceDialog } from "./WorkspaceDialog";
import type { useGrowthWorkspace } from "./useGrowthWorkspace";
import styles from "./workspace.module.css";

const REPO = "https://github.com/Nighttech1/Content-Factory/blob/codex/director-chatgpt-transfer/";
const decisionLabel = { pending: "Решение пока не внесено", approved: "Согласовано отделом", remarks: "Есть замечания" };

export function WorkspaceCardDialog({ card, plan, view, busy, error, run, onClose }: {
  card: WorkspaceCard;
  plan?: Pick<ContentEntry, "product" | "plannedDate">;
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
  const request = view.scoutRequests.filter((item) => item.cardId === card.id).at(-1);
  const beginEdit = () => { setDraft(structuredClone(card)); setRevision(view.revision); setValidation(null); setEditing(true); };

  return <WorkspaceDialog open onOpenChange={(open) => { if (!open && !busy) onClose(); }} title={card.title} description={`${card.id} · ${card.format} · ${card.channels.join(" / ")}`} testId="growth-card-dialog">
    <a className={styles.briefLink} href={REPO + card.briefPath} target="_blank" rel="noreferrer">Открыть исходный бриф ↗</a>
    <p className={styles.muted} data-testid="growth-dialog-plan-meta">План: {plan?.plannedDate ? plan.plannedDate.split("-").reverse().join(".") : "дата не указана"} · Продукт: {plan?.product || "не указан"}</p>
    {editing ? <form onSubmit={async (event) => {
      event.preventDefault();
      const publication = draft.publication;
      if (publication && (!publication.url.trim() || !publication.publishedAt)) { setValidation("Для факта публикации нужны и ссылка, и дата."); return; }
      setValidation(null);
      const next = await run({ type: "update_card", cardId: card.id, expectedRevision: revision, patch: { title: draft.title.trim(), script: draft.script?.trim() || null, shots: draft.shots, origin: draft.origin, departmentDecision: draft.departmentDecision, publication } });
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
      <fieldset className={styles.editSection}><legend>Происхождение идеи</legend>
        <label className={styles.field}>Ссылка на материал<input data-testid="growth-edit-origin-url" type="url" value={draft.origin.url || ""} onChange={(event) => setDraft({ ...draft, origin: { ...draft.origin, url: event.target.value || null } })} disabled={busy} maxLength={2000} /></label>
        <div className={styles.editorGrid}><label>Статус источника<select data-testid="growth-edit-origin-status" value={draft.origin.evidence} onChange={(event) => setDraft({ ...draft, origin: { ...draft.origin, evidence: event.target.value as WorkspaceCard["origin"]["evidence"] } })} disabled={busy}><option value="unverified">Не проверен</option><option value="verified">Подтверждён</option></select></label><label>Дата проверки<input data-testid="growth-edit-origin-date" type="date" value={draft.origin.observedAt || ""} onChange={(event) => setDraft({ ...draft, origin: { ...draft.origin, observedAt: event.target.value || null } })} disabled={busy} /></label></div>
        <label className={styles.field}>Что подтверждено и какие ограничения<textarea data-testid="growth-edit-origin-note" value={draft.origin.note} onChange={(event) => setDraft({ ...draft, origin: { ...draft.origin, note: event.target.value } })} rows={3} disabled={busy} maxLength={4000} /></label>
      </fieldset>
      <fieldset className={styles.editSection}><legend>Решение профильного отдела</legend>
        <div className={styles.editorGrid}><label>Решение<select data-testid="growth-edit-decision-status" value={draft.departmentDecision.status} onChange={(event) => setDraft({ ...draft, departmentDecision: { ...draft.departmentDecision, status: event.target.value as WorkspaceCard["departmentDecision"]["status"] } })} disabled={busy}><option value="pending">Ожидается</option><option value="approved">Согласовано</option><option value="remarks">Замечания</option></select></label><label>Дата решения<input data-testid="growth-edit-decision-date" type="date" value={draft.departmentDecision.at || ""} onChange={(event) => setDraft({ ...draft, departmentDecision: { ...draft.departmentDecision, at: event.target.value || null } })} disabled={busy} /></label></div>
        <label className={styles.field}>Комментарий отдела<textarea data-testid="growth-edit-decision-note" value={draft.departmentDecision.note} onChange={(event) => setDraft({ ...draft, departmentDecision: { ...draft.departmentDecision, note: event.target.value } })} rows={3} disabled={busy} maxLength={4000} /></label>
      </fieldset>
      <fieldset className={styles.editSection}><legend>Факт публикации</legend>
        <label className={styles.field}>Ссылка на публикацию<input data-testid="growth-edit-publication-url" type="url" value={draft.publication?.url || ""} onChange={(event) => setDraft({ ...draft, publication: event.target.value || draft.publication?.publishedAt ? { url: event.target.value, publishedAt: draft.publication?.publishedAt || "" } : null })} disabled={busy} maxLength={2000} /></label>
        <label className={styles.field}>Дата публикации<input data-testid="growth-edit-publication-date" type="date" value={draft.publication?.publishedAt || ""} onChange={(event) => setDraft({ ...draft, publication: event.target.value || draft.publication?.url ? { url: draft.publication?.url || "", publishedAt: event.target.value } : null })} disabled={busy} /></label>
        <p className={styles.muted}>Колонка «Выпуск» сама по себе не подтверждает публикацию.</p>
      </fieldset>
      {view.revision !== revision && <p className={styles.muted}>Общая версия изменилась. <button type="button" className={styles.textButton} data-testid="growth-card-reload" disabled={busy} onClick={beginEdit}>Заменить черновик актуальной карточкой</button></p>}
      {(validation || error) && <p className={styles.error} role="alert">{validation || error}</p>}
      <div className={styles.dialogActions}><button type="button" data-testid="growth-card-cancel" className={styles.button} onClick={() => { setEditing(false); setValidation(null); }} disabled={busy}>Отмена</button><button type="submit" data-testid="growth-card-save" className={styles.primaryButton} disabled={busy}>{busy ? "Сохраняем…" : "Сохранить"}</button></div>
    </form> : <>
      <section className={styles.modalSection} data-testid="growth-card-script"><h3>Сценарий</h3>{card.script ? <div className={styles.script}>{card.script}</div> : <p className={styles.muted}>Сценарий пока не подготовлен.</p>}</section>
      <section className={styles.modalSection} data-testid="growth-card-shots"><h3>План съёмки / разработки</h3>{card.shots.length ? <ol className={styles.shots}>{card.shots.map((shot) => <li key={shot.order}><strong>{shot.visual}</strong>{shot.spoken && <p>{shot.spoken}</p>}{shot.onScreen && <small>В кадре: {shot.onScreen}</small>}</li>)}</ol> : <p className={styles.muted}>План кадров и шагов ещё не внесён.</p>}</section>
      <section className={styles.modalSection} data-testid="growth-card-origin"><h3>Происхождение идеи</h3><p className={card.origin.evidence === "verified" ? styles.verified : styles.needsResearch}>{card.origin.evidence === "verified" ? "Источник подтверждён" : "Нужна разведка · источник не проверен"}</p>{card.origin.url && <a href={card.origin.url} target="_blank" rel="noreferrer">Открыть исходный материал ↗</a>}{card.origin.observedAt && <p className={styles.muted}>Проверка: {card.origin.observedAt}</p>}<p>{card.origin.note || "Подтверждения и ограничения пока не внесены. Популярность материала не установлена."}</p></section>
      <section className={styles.modalSection} data-testid="growth-card-department"><h3>Решение профильного отдела</h3><p>{decisionLabel[card.departmentDecision.status]}</p>{card.departmentDecision.note && <p>{card.departmentDecision.note}</p>}{card.departmentDecision.at && <p className={styles.muted}>{card.departmentDecision.at}</p>}</section>
      <section className={styles.modalSection} data-testid="growth-card-publication"><h3>Публикация</h3>{card.publication ? <a href={card.publication.url} target="_blank" rel="noreferrer">Материал от {card.publication.publishedAt} ↗</a> : <p className={styles.muted}>Подтверждённой публикации нет.</p>}</section>
      {request && <p className={styles.requestStatus} data-testid="growth-scout-request-status">{request.id}: {request.status === "git_saved" ? "записан в GitHub" : request.status === "git_pending" ? "сохранён на сервере, ожидает GitHub" : "сохранён на сервере, не отправлен в GitHub"}. Разведка не запускалась.</p>}
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.dialogActions}><button type="button" data-testid="growth-request-scout" className={styles.button} onClick={() => { void run({ type: "request_scout", cardId: card.id }); }} disabled={!view.capabilities.writeEnabled || busy}>Обновить</button><button type="button" data-testid="growth-card-edit" className={styles.primaryButton} onClick={beginEdit} disabled={!view.capabilities.writeEnabled || busy}>Редактировать</button></div>
      <p className={styles.muted}>Обновление создаёт ручной запрос скауту. Исследование начнётся только по твоему отдельному поручению.</p>
    </>}
  </WorkspaceDialog>;
}
