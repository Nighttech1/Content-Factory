# Chain — growth workspace
10.11.2026. Before SHA b68eec9, branch codex/director-chatgpt-transfer. Spec — architect-spec.md рядом. Production запрещён; no paid API/search/LLM/scout execution.
1. Оркестратор/Клиент: scope последних11пунктов и уточнений, критерии, прозрачные реальные роли.
2. Тренер: readiness в `memory/trainer/2026-11-10-growth-workspace-grade.md`; BUI/Cwrite, fakeauth и Gitgap требуют этой спецификации.
3. Архитектор: spec+chain ДОкода; read existingmodel/store/authgap; после READY изменениятолько по review.
4. Backend: единственный автор shared DTO/model/schema, serverstore/atomiclock/CAS/auth/API/snapshots/scheduler/Gitoutbox, seedprojection24IDs; до FEintegration передать exports и тестовыйfixture.
5. Frontend: после DTOконтракта stagefunnel/board/modal/facteditor/weeklychart/mobile, navDirectorhide, forceDynamicpage; backend store/auth/Gitне дублировать. Можно scaffoldпослеBEexports безправокsharedtypes.
6. AI Bridge: отдельный реальный субагент существующей роли по еёrule/skills: manualScoutrequest contract/intakeREADME/setupguide. Не зовётScout и не выполняетисследование. Sharedcode через Backend, не параллельно.
7. Тестировщик: независимые model/store/auth/API/time/Gitmocks/board/browser tests, фиксируетC-*; noactualGitwrite/APIcost/VPS. Oldv2 baseline guards сохранить.
8. Фиксер/владельцыpaths: узкиеC-* fixes→retest; pathlockпередаётся явно.
9. Деплоер: только local/preview после применимыхзелёныхchecks; приlocalChromiumEPERM возможенQA-onlyActions поразрешениюroot, безrelease marker/VPS.
10. Клиент: отдельный независимыйприёмщик, actualdesktop/mobile+allcriteria; тикетывозвращаетдо полного закрытия. Только внутреннепринятыйрезультат→владелец; owner«согласовано» отдельно.

| Роль | Exclusive paths | Handoff/граница |
|---|---|---|
| Архитектор | Только `memory/waves/W-2026-11-10-growth-workspace/{architect-spec,chain}.md` | Noappcode |
| Backend | `lib/growth-center/workspace-*.ts`, `app/api/growth-workspace/**`, `instrumentation.ts`, `scripts/freeze-growth-workspace.ts`, собственныеAPI/storetests | Единственныйmodel/typesавтор; старыйgrowthmodel/canonicalJSONне менять; неUI/nav/departments |
| Frontend | `components/growth-center/**`, `app/growth/page.tsx`, `components/shell/SidebarNavigation.tsx`; толькообязательныйmobilemenuAppShellеслионреальноотдельный | НеBE/store/auth/sharedtypes; nolegacymarketingdeletion; датьtestids |
| AI Bridge | `docs/GROWTH_WORKSPACE.md`, `projects/vernatun/departments/scout/README.md`, manualintaketemplate/ScoutbranchSTARTaddendum при необходимости | Не actualintakejobs/Gitcredentials/runtime; поляконтрактаBEсогласовать |
| Tester | Independenttests в scripts/wave, отчёты/tickets/guards; existingbrowserQAselectorsпослепередачиlock | Неappfixes/реальныйGit/VPS |
| Fixer | ТолькоявнопереданныеfilesC-* | Неconcurrentсвладельцем |
| Deployer | Localprocess/QAevidence/report | Noops/VPS/releasemarkerchanges |
| Client | Acceptance/tickets/evidence | Неappmutation; неselfacceptавтора |
| Root | STATE/DEV_PLAN/scope/integrationпослеосвобожденияpaths | Nooverlapsharedfiles |

Motion отдельнопрoпущена: существующегоминимальногомotion/reducedmotionдостаточно; ArtDirector не вызывается — нетпроизводствавизуальногоконтента; Кодер не заменяетпрофильныеFE/BE.
Контрактhandoff: Backendexportsизspec + session/commandsAPI/capabilities иfixture → FE; FEdiff/testids → Tester; реальныеtestresults/localURL → Client; C-* → Fixer/retest. Scheduler/Gitruntimecredentials несуществуютотналичияфайла; setupguide ичестныеdisabled/notconfiguredстатусыобязательны.

КонтрактноеуточнениедоBEкода: update_card разрешает title/script/shots/origin/departmentDecision/publication; ownermodalEditSaveCancel; Planall/Factvalidproof, manualScoutreplacementбезrebuild. Backendпо-прежнемуединыйтипаавтор,Frontendиспользуетpatchтолькопоcapability. QAчерезHTTPSlocalhostproxy,нетproductionsecuritybypass.

## Дополнение Оркестратора — фактические исполнители и QA locks

AI Bridge выполняет отдельный проектный агент `/root/ai_bridge`, не root последовательно. Её paths: `projects/vernatun/departments/scout/requests/growth/README.md`, `scout-manual-handoff.md`; additive Scout START/README подготовлены вне checkout, публикует только root. `docs/GROWTH_WORKSPACE.md` — root setup guide.

Frontend дополнительно получает NAV-only `components/marketing/GrowthDashboard.tsx`; legacy chat/data/route не удаляются.

Tester: `scripts/growth-workspace-browser-qa.mjs` и testing-only HTTPS proxy helper, независимые server boundary tests. Client: `scripts/growth-workspace-client-qa.mjs` плюс acceptance/tickets/evidence. Это разные авторы сценариев; общий TLS fixture helper не заменяет независимую приёмку. Deployer: QA-job-only `.github/workflows/growth-center-release.yml`, без изменения deploy/gate/triggers/permissions/production marker. Root создаёт только QA marker после сохранения source; обычный code/docs push не выполняет production.
