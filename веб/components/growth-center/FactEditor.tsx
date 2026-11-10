"use client";

import { useState } from "react";
import { WORKSPACE_STAGE_IDS, type Counts, type WorkspaceView } from "@/lib/growth-center/workspace-model";
import type { GrowthCenterDataset } from "@/lib/growth-center/model";
import { WorkspaceDialog } from "./WorkspaceDialog";
import type { useGrowthWorkspace } from "./useGrowthWorkspace";
import styles from "./workspace.module.css";

export function FactEditor({ view, dataset, busy, error, run, onClose }: {
  view: WorkspaceView;
  dataset: GrowthCenterDataset;
  busy: boolean;
  error: string | null;
  run: ReturnType<typeof useGrowthWorkspace>["run"];
  onClose: () => void;
}) {
  const [revision, setRevision] = useState(view.revision);
  const [values, setValues] = useState(() => Object.fromEntries(WORKSPACE_STAGE_IDS.map((id) => [id, view.counts[id] === null ? "" : String(view.counts[id])])) as Record<typeof WORKSPACE_STAGE_IDS[number], string>);
  const [source, setSource] = useState(view.countSource);
  const [validation, setValidation] = useState<string | null>(null);

  return <WorkspaceDialog open onOpenChange={(open) => { if (!open && !busy) onClose(); }} title="Изменить факт" description={`Неделя с ${view.weekKey}. Пустое поле означает, что данных нет.`} testId="growth-fact-editor">
    <form onSubmit={async (event) => {
      event.preventDefault();
      const counts = Object.fromEntries(WORKSPACE_STAGE_IDS.map((id) => [id, values[id].trim() === "" ? null : Number(values[id])])) as Counts;
      if (Object.values(counts).some((value) => value !== null && (!Number.isSafeInteger(value) || value < 0))) { setValidation("Введи целые неотрицательные числа или оставь поля пустыми."); return; }
      if (!source.trim()) { setValidation("Укажи источник или пояснение к этим данным."); return; }
      setValidation(null);
      if (await run({ type: "save_counts", counts, source: source.trim(), expectedRevision: revision })) onClose();
    }}>
      <div className={styles.editorGrid}>
        {WORKSPACE_STAGE_IDS.map((id) => <label key={id}>{dataset.stages.find((stage) => stage.id === id)?.label}<input data-testid={`growth-fact-${id}`} type="number" min="0" step="1" inputMode="numeric" placeholder="Нет данных" value={values[id]} onChange={(event) => setValues((previous) => ({ ...previous, [id]: event.target.value }))} disabled={busy} /></label>)}
      </div>
      <label className={styles.field}>Источник / пояснение<input data-testid="growth-fact-source" maxLength={4000} value={source} onChange={(event) => setSource(event.target.value)} placeholder="Например, мой учёт регистраций и гостей" disabled={busy} required /></label>
      {view.revision !== revision && <p className={styles.muted}>Общая версия изменилась. <button type="button" className={styles.textButton} data-testid="growth-fact-reload" disabled={busy} onClick={() => { setValues(Object.fromEntries(WORKSPACE_STAGE_IDS.map((id) => [id, view.counts[id] === null ? "" : String(view.counts[id])])) as typeof values); setSource(view.countSource); setRevision(view.revision); setValidation(null); }}>Заменить черновик актуальными значениями</button></p>}
      {(validation || error) && <p className={styles.error} role="alert">{validation || error}</p>}
      <div className={styles.dialogActions}><button type="button" data-testid="growth-fact-cancel" className={styles.button} onClick={onClose} disabled={busy}>Отмена</button><button type="submit" data-testid="growth-fact-save" className={styles.primaryButton} disabled={busy}>{busy ? "Сохраняем…" : "Сохранить"}</button></div>
    </form>
  </WorkspaceDialog>;
}
