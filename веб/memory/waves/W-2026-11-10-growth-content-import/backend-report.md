# Backend — prepared content import

10.11.2026. Реальная проектная роль Backend; действующие AGENTS/STATE/профиль и новая спецификация/chain прочитаны до продуктового кода.

## Результат и контракты

- Authoritative schemas/types: `workspace-prepared.ts` — PreparedBrief, CandidatePreparedUnit (director:null), PreparedUnit, ContentProvenance, DirectorApproval, ApprovedPreparedCatalog/EmptyPreparedCatalog; строгие URLs/dates/role/version/source/coverage/hash guards. Полезные exports: validatePreparedCandidate, validatePreparedCatalog, preparedUnitDigest, preparedCatalogDigest, approvePreparedCandidates. Последняя функция **требует существующий отдельный approval artifact**, не выпускает одобрение сама.
- Нециркулярный digest: canonical sorted-key JSON; unit digest исключает director approval, но включает research sourceCommit и внешний department artifactSha256; catalog digest связывает catalogId/sourceCommit и точный ordered unitId/version/digest список. Director artifact связывает catalog digest и все unit digests/versions.
- `data/growth/prepared-units.json` сейчас **пустой**: catalogId/sourceCommit/contentSha256/approval null, units[]. Это не фиктивное одобрение и не фальшивые результаты разведки.
- `workspace-prepared-store.ts` применяет trusted build catalog под прежним crossprocess lock. Dry-run planner → private backup → fsynced recoverable journal → metadata sidecar → старый строгий state.json → journal removal. Partial commit допускает roll-forward только при matching before/after state hash; новая правка владельца блокирует восстановление, а не затирается.
- Metadata/history/provenance/import receipts хранятся отдельно в `prepared/`; у persisted WorkspaceCard и stateSchema v1 нет новых полей. Старые24 IDs, facts, snapshots, очередь, sessions, Kanban positions и публикационные proof сохраняются. Same ID/version digest clash отклоняется; повтор того же каталога no-op; downgrade не удаляет более новые данные; owner-edited unit quarantined без overwrite.
- WorkspaceView дополнен preparedDetails/activeCardIds/archivedCardCount/catalogStatus через ephemeral enrichment. Новые типы импортированы в client-readable workspace-model **только type import**, crypto в client selectors не переносится. Local owner adaptations отдельно помечаются; approved source/department trail нельзя подменить через owner patch.
- Приложение не читает Git/network ради каталога. Только versioned approved repository catalog в tested build; его сохранение не является выкладкой. Нет новых runtime Secrets или обхода owner auth.

## Локальный build/import CLI

`node --import tsx scripts/import-growth-prepared.ts --units <units.json> --evidence <evidence.json> --source-root <pinned-checkout> --source-commit <SHA40> [--approval <director-approval.json> --output <new-catalog.json>]`

Units wrapper: `{version:1,catalogId,sourceCommit,units:[CandidatePreparedUnit]}`. Evidence manifest: `{version:1,sourceCommit,reports:[{reportId,path,sha256}],departments:[{unitId,version,role,path,sha256}]}`. Отдельный department artifact: `{version:1,unitId,unitVersion,role,decision:'approved',decidedAt,note,research:{reportId,reportSha256}}`. Значения должны согласоваться с unit provenance; hash проверяется по committed bytes через локальный git show. Brief/report/decision должны существовать в pinned source и не иметь uncommitted изменений; realpath/traversal защищены.

Без approval CLI выводит только pending preview/hash list и не записывает каталог. С supplied director artifact формирует validated approved catalog только по явно заданному новому output path с `wx`, не перезаписывает файл. Ни Git push, ни deployment, ни исследование не запускает. Исходные candidate JSON могут быть подготовлены после pinned evidence snapshot; они не должны самоссылочно включать SHA собственного будущего commit.

## Проверки автора

- `node --import tsx scripts/test-growth-prepared.ts` — **14 групп PASS**: unknown/empty archive, real approval requirement, digest/version/source/date/URL/unknown-field rejection, preservation24, idempotency, owner adaptation/source gate, conflict quarantine, facts/column/publication preservation, hash clash/downgrade, rollback, partial commit recovery и refusal intervening owner write.
- `node --import tsx scripts/test-growth-prepared-cli.ts` — **PASS**: временный локальный Git fixture, pinned artifact bytes+role/report binding, preview cannot write/approve, supplied synthetic approval→validated output, overwrite/uncommitted tamper rejection. Внешней Git операции не было.
- Прежние `test-growth-workspace.ts` **24 групп PASS**, `test-growth-workspace-api.ts` **PASS**.
- Integrated `tsc --noEmit` **PASS**; targeted ESLint новых/изменённых Backend файлов **PASS без warnings**.

Synthetic fixtures из `scripts/fixtures/prepared-catalog-fixture.ts` явно test-only; они не импортируются приложением и не записываются в canonical catalog. Actual research, department/director invocation/approval, provider calls, runtime Git, VPS/release в этой подзадаче не выполнялись. Backend handoff передан Frontend/AI Bridge/root; независимая приёмка и новая build/browser QA — отдельные роли.
