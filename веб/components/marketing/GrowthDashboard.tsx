"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDownToLine, ArrowRight, ArrowUpRight, Check, ChevronRight, ClipboardList, Compass, Eye, HeartHandshake, MessageCircle, Play, RotateCcw, Share2, Sparkles, Ticket, Upload, Users, Wallet } from "lucide-react";
import { STAGES, EMPTY_SNAPSHOT, conversionRate, evaluateMarketScenario, parseGrowthSnapshot, type GrowthSnapshot, type StageId } from "@/lib/marketing/growth-model";
import { BASELINE_ESTIMATES, COMPETITORS, CONTENT_IDEAS, MARKET_CONTEXT, SEGMENTS, STAGE_PLAYBOOK } from "@/lib/marketing/growth-content";
import styles from "./growth-dashboard.module.css";

const STORAGE_KEY = "cf.vernatun.growth.v1";
const TABS = [
  { id: "lifecycle", label: "Жизненный цикл", icon: Compass },
  { id: "content", label: "Контент и тесты", icon: Play },
  { id: "market", label: "Рынок и позиция", icon: Users },
  { id: "chat", label: "Чат директора", icon: MessageCircle },
] as const;
type TabId = (typeof TABS)[number]["id"];
const ICONS = { attraction: Eye, interest: Sparkles, registration: Ticket, attendance: Users, return: HeartHandshake, membership: Wallet, advocacy: Share2, reactivation: RotateCcw };
const formatNumber = (n: number | null) => n === null ? "—" : new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n);
const formatPercent = (n: number) => new Intl.NumberFormat("ru-RU", { style: "percent", maximumFractionDigits: 1 }).format(n);

function downloadJson(value: unknown, filename: string) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url; link.download = filename; link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Presentational application view. No router, API, credentials or live collection. */
export function GrowthDashboard({ chat }: { chat?: ReactNode }) {
  const [tab, setTab] = useState<TabId>("lifecycle");
  const [stageId, setStageId] = useState<StageId>("attraction");
  const [snapshot, setSnapshot] = useState<GrowthSnapshot>(EMPTY_SNAPSHOT);
  const [importOpen, setImportOpen] = useState(false);
  const [input, setInput] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [storageMessage, setStorageMessage] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [chatVisited, setChatVisited] = useState(false);
  const [projectsVisible, setProjectsVisible] = useState(true);
  const [scenario, setScenario] = useState(MARKET_CONTEXT.scenarioDefaults);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const result = parseGrowthSnapshot(JSON.parse(stored));
      if (result.ok) {
        setSnapshot(result.data);
        setStorageMessage("Открыт ручной агрегат с этого устройства. Серверной синхронизации нет.");
      } else {
        setStorageMessage("Сохранённый агрегат не прошёл проверку. Он не загружен и не перезаписан.");
      }
    } catch {
      setStorageMessage("Локальное хранилище недоступно или содержит некорректный файл. Работаем без сохранённого агрегата.");
    }
  }, []);

  const selectTab = (next: TabId) => {
    if (next === "chat") setChatVisited(true);
    setTab(next);
  };
  const importSnapshot = (text: string) => {
    if (text.length > 100_000) { setImportError("Файл больше 100 КБ. Нужны только агрегаты, без списков людей."); return; }
    let parsed: unknown;
    try { parsed = JSON.parse(text); } catch { setImportError("Не удалось прочитать JSON. Текущий агрегат сохранён без изменений."); return; }
    const result = parseGrowthSnapshot(parsed);
    if (!result.ok) { setImportError(result.errors.join("\n")); return; }
    setSnapshot(result.data);
    setImportError(null);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(result.data));
      setStorageMessage("Агрегат импортирован и сохранён на этом устройстве. Источник указан автором файла; это не проверенная API-интеграция.");
    } catch {
      setStorageMessage("Агрегат открыт на время сеанса. Браузер не разрешил сохранить его на устройстве.");
    }
    setImportOpen(false);
  };
  const playbook = STAGE_PLAYBOOK[stageId];
  const stage = STAGES.find((s) => s.id === stageId)!;
  const rate = conversionRate(snapshot, stageId);
  const filteredIdeas = CONTENT_IDEAS.filter((i) => (!stageFilter || i.stageId === stageFilter) && (!productFilter || i.product === productFilter));
  const products = [...new Set(CONTENT_IDEAS.map((i) => i.product))];
  const scenarioResult = evaluateMarketScenario(scenario);
  const mainStages = STAGES.filter((s) => s.id !== "advocacy" && s.id !== "reactivation");
  const hasMeasuredValues = Object.values(snapshot.counts).some((v) => v !== null);

  return (
    <div className={styles.workspace} data-testid="growth-workspace">
      <nav className={styles.mobileNav} aria-label="Разделы фабрики">
        <a href="/studio">Студия</a><a href="/schedule">Расписание</a><a href="/marketing" aria-current="page">Директор</a><a href="/settings">Настройки</a>
      </nav>
      <div className={styles.topline}>
        <div className={styles.brand}><span>V</span> Вернатун <ChevronRight size={12} /> Директор</div>
        <div className={styles.topStatus}><i className={styles.statusDot} /> План до 31 декабря · на согласовании</div>
      </div>
      <header className={styles.hero}>
        <div>
          <div className={styles.eyebrow}>Развитие клуба / 09 ноября — 31 декабря 2026</div>
          <h1>Из первого интереса<br />в <span>свой круг.</span></h1>
          <p className={styles.heroCopy}>Управляем всем путём участника: показываем, почему у нас хочется быть, помогаем прийти и создаём причину вернуться.</p>
          <div className={styles.constraintRow}><span><b>0 ₽</b> продвижение</span><span><b>до 3 ч</b> в неделю</span><span><b>1 тест</b> за раз</span><span><b>50–60 гостей</b> — цель, не прогноз</span></div>
        </div>
        <div className={styles.heroRight}>
          <div className={styles.focusLabel}>Приоритет сейчас</div>
          <div className={styles.focusTitle}>Сначала — «хочу к этим людям». Потом — «как прийти».</div>
          <div className={styles.focusSteps}><span>Атмосфера</span><ArrowRight size={13} /><span>Желание</span><ArrowRight size={13} /><span>Первый визит</span></div>
          <div className={styles.heroActions}><button className={styles.primaryButton} onClick={() => { selectTab("content"); setStageFilter("attraction"); }}><Play size={13} /> Контент для холодной аудитории</button></div>
        </div>
      </header>

      <div className={styles.tabs} role="tablist" aria-label="Рабочие пространства директора">
        {TABS.map(({ id, label, icon: Icon }, index) => <button key={id} id={`growth-tab-${id}`} className={styles.tab} role="tab" aria-selected={tab === id} aria-controls={`growth-panel-${id}`} onClick={() => selectTab(id)} onKeyDown={(event) => {
          let next = index;
          if (event.key === "ArrowRight") next = (index + 1) % TABS.length;
          else if (event.key === "ArrowLeft") next = (index - 1 + TABS.length) % TABS.length;
          else if (event.key === "Home") next = 0;
          else if (event.key === "End") next = TABS.length - 1;
          else return;
          event.preventDefault(); selectTab(TABS[next].id);
          document.getElementById(`growth-tab-${TABS[next].id}`)?.focus();
        }}><Icon size={14} />{label}</button>)}
      </div>

      <section id="growth-panel-lifecycle" role="tabpanel" aria-labelledby="growth-tab-lifecycle" hidden={tab !== "lifecycle"}>
        <div className={styles.sectionHead}>
          <div><h2>Жизненный цикл участника</h2><p>Нажми на этап — увидишь, чем продвигаем человека дальше и как проверяем результат.</p></div>
          <div className={styles.toolbar}><button className={styles.quietButton} onClick={() => setImportOpen(!importOpen)}><Upload size={13} /> Внести агрегаты</button><button className={styles.quietButton} onClick={() => downloadJson(snapshot, "vernatun-growth-snapshot.json")} aria-label="Экспортировать агрегаты JSON"><ArrowDownToLine size={13} /> Экспорт</button></div>
        </div>
        <div className={styles.legend}><span><i className={styles.fact} /> Измерение</span><span><i className={styles.owner} /> Оценка владельца</span><span><i className={styles.scenario} /> Сценарий</span><span><i /> Нет замера</span></div>
        <div className={styles.lifecycle} data-testid="growth-lifecycle">
          <div className={styles.stageRow}>
            {mainStages.map((s, index) => { const Icon = ICONS[s.id]; const value = snapshot.counts[s.id]; const conversion = conversionRate(snapshot, s.id); return <button key={s.id} className={styles.stage} aria-pressed={stageId === s.id} onClick={() => setStageId(s.id)} data-testid={`growth-stage-${s.id}`}>
              <span className={styles.stageTop}><span>{s.id === "membership" ? "Ветка от 04" : `0${index + 1}`}</span><Icon /></span><span className={styles.stageLabel}>{s.label}</span>
              <span className={styles.stageNumber}>{value === null ? <small>Нет замера</small> : formatNumber(value)}</span>
              <span className={styles.stageRate}>{snapshot.evidenceKind === "scenario" ? "Сценарий · " : snapshot.evidenceKind === "owner_estimate" ? "Оценка · " : ""}{conversion.value === null ? (s.id === "attraction" ? "Уникальные релевантные люди" : s.id === "membership" ? "База: впервые пришедшие" : "Конверсия пока неизвестна") : formatPercent(conversion.value) + (s.id === "membership" ? " · от первых гостей" : " · сопоставимая когорта")}</span>
            </button>; })}
          </div>
          <div className={styles.branches}>
            {(["advocacy", "reactivation"] as StageId[]).map((id) => { const s = STAGES.find((x) => x.id === id)!; const Icon = ICONS[id]; return <button key={id} className={styles.branch} aria-pressed={stageId === id} onClick={() => setStageId(id)} data-testid={`growth-stage-${id}`}><span className={styles.branchIcon}><Icon size={15} /></span><span><strong>{s.label}</strong><small>{id === "advocacy" ? "От повторного опыта — к новому гостю" : "Из неактивной когорты — обратно в клуб"}</small></span><span className={styles.branchValue}>{snapshot.counts[id] === null ? "—" : formatNumber(snapshot.counts[id]!)}</span></button>; })}
          </div>
          <p className={styles.mapCaption}>Рекомендации не требуют подписки. Реактивация считается от своей неактивной когорты. Геометрия схемы не изображает измеренные потери.</p>
        </div>
        <div className={styles.periodLine}><span>Агрегат: <b>{hasMeasuredValues ? snapshot.cohortId : "ещё не внесён"}</b></span><span>{snapshot.periodStart} — {snapshot.periodEnd}</span><span>Источник: {snapshot.source} · {snapshot.observedAt}</span><span>{({ measured: "Измерение — ручной ввод", owner_estimate: "Оценка владельца", scenario: "Сценарий", unknown: "Нет замера" })[snapshot.evidenceKind]}</span><span>Единица: уникальные люди</span><span>Окно возврата: {snapshot.returnWindowDays} дней · {snapshot.cohortMature ? "когорта созрела" : "ещё не созрела"}</span></div>
        {storageMessage && <p className={styles.success} role="status">{storageMessage}</p>}
        {importOpen && <div className={styles.importBox} data-testid="growth-import">
          <div className={styles.sectionHead}><div><h2>Одна когорта. Один период. Только люди.</h2><p>Загрузите агрегированный JSON: без имён, телефонов и списков участников. Поля, даты и знаменатели проверяются до сохранения.</p></div></div>
          <div className={styles.inputRow}><button className={styles.quietButton} onClick={() => downloadJson(EMPTY_SNAPSHOT, "vernatun-growth-template.json")}><ArrowDownToLine size={13} /> Шаблон JSON</button><button className={styles.quietButton} onClick={() => fileRef.current?.click()}><Upload size={13} /> Выбрать файл</button><input ref={fileRef} className={styles.fileInput} type="file" accept=".json,application/json" aria-label="Файл агрегатов" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; if (file.size > 100_000) { setImportError("Файл больше 100 КБ. Импорт не выполнен."); e.target.value = ""; return; } try { const text = await file.text(); setInput(text); importSnapshot(text); } catch { setImportError("Не удалось прочитать файл. Прежний агрегат не изменён."); } e.target.value = ""; }} hidden /></div>
          <label htmlFor="growth-json"><textarea id="growth-json" aria-label="Агрегаты JSON" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Вставь заполненный шаблон JSON" maxLength={100_001} /></label>
          {importError && <p className={styles.error} role="alert">{importError}</p>}
          <div className={styles.inputRow}><button className={styles.primaryButton} onClick={() => importSnapshot(input)}><Check size={13} /> Проверить и импортировать</button><button className={styles.quietButton} onClick={() => setImportOpen(false)}>Закрыть</button></div>
          <p className={styles.mapCaption}>Данные сохраняются только в этом браузере. Это ручной учёт, не подключение Telegram, CRM или API площадок. Некорректный импорт не заменяет предыдущую версию.</p>
        </div>}

        <div className={styles.detailGrid} aria-live="polite">
          <article className={styles.detailPanel} data-testid="growth-stage-detail">
            <div className={styles.sectionLabel}>Работаем с этапом / {stage.shortLabel}</div><h3>{stage.label}</h3><p className={styles.statement}>{playbook.jtbd}</p>
            <dl className={styles.detailFacts}><div><dt>Продукт</dt><dd>{playbook.product}</dd></div><div><dt>Аудитория</dt><dd>{playbook.audience}</dd></div><div><dt>Наше действие</dt><dd>{playbook.action}</dd></div><div><dt>Кто отвечает</dt><dd>{playbook.owner}</dd></div><div><dt>Основная метрика</dt><dd>{playbook.metric}</dd></div><div><dt>Конверсия</dt><dd>{rate.value === null ? "Нет расчёта" : formatPercent(rate.value)}<p>{rate.reason}</p></dd></div></dl>
            <div className={styles.nextAction}><div className={styles.sectionLabel}>Следующий шаг</div><p>{playbook.nextAction}</p></div>
          </article>
          <aside className={styles.detailPanel}><div className={styles.sectionLabel}>Контент, который двигает этап</div><div className={styles.contentSample}><strong>«{playbook.hook}»</strong><p>{playbook.content}</p></div><p><b>Где показываем:</b> {playbook.distribution}</p><p><b>Тест:</b> {playbook.test}</p><button className={styles.linkButton} onClick={() => { setStageFilter(stageId); selectTab("content"); }}>Открыть темы этого этапа <ArrowUpRight size={12} style={{ display: "inline" }} /></button><div className={styles.evidence}>Основание: {playbook.evidence.join(" · ")}. Перенос механики — гипотеза до собственного результата.</div></aside>
        </div>
        <div className={styles.baseline}>{BASELINE_ESTIMATES.slice(0, 4).map((metric) => <div key={metric.id}><strong>{metric.value}</strong><span>{metric.label}</span><small>Оценка владельца · {metric.date}</small></div>)}</div>
        <p className={styles.mapCaption}>Подписчики разных площадок могут пересекаться. Эти оценки не являются людьми одной когорты, поэтому не входят в расчёт конверсий.</p>
      </section>

      <section id="growth-panel-content" role="tabpanel" aria-labelledby="growth-tab-content" hidden={tab !== "content"}>
        <div className={styles.sectionHead}><div><h2>Контент — инструмент перехода</h2><p>Каждой теме назначены продукт, стадия, действие и проверка. Сначала показываем привлекательность живого опыта, затем снимаем риск первого визита.</p></div><span className={styles.sectionLabel}>План / не опубликовано</span></div>
        <div className={styles.notice}><b>Первый пакет:</b> одна реальная съёмка → атмосферный ролик для холодных → тёплая история для TG → проверенная карточка встречи. FAQ закреплён для заинтересовавшихся. Размещением одной афиши новых людей не создать.</div>
        <div className={styles.filterRow}><label>Стадия<select aria-label="Фильтр по стадии" value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}><option value="">Все стадии</option>{STAGES.map((s) => <option value={s.id} key={s.id}>{s.label}</option>)}</select></label><label>Продукт<select aria-label="Фильтр по продукту" value={productFilter} onChange={(e) => setProductFilter(e.target.value)}><option value="">Все продукты</option>{products.map((p) => <option key={p}>{p}</option>)}</select></label></div>
        <p className={styles.mapCaption} role="status">{filteredIdeas.length} тем. Фильтры меняют карту, не запускают производство.</p>
        <div className={styles.ideaGrid}>{filteredIdeas.map((idea) => <article className={styles.ideaCard} key={idea.id}><div className={styles.sectionLabel}>{STAGES.find((s) => s.id === idea.stageId)?.label} / {idea.format}</div><h3>{idea.title}</h3><p><b>Хук:</b> {idea.hook}</p><p><b>Продукт:</b> {idea.product}</p><p><b>CTA:</b> {idea.cta}</p><p><b>Проверка:</b> {idea.test}</p><div className={styles.ideaMeta}>{idea.channel} · {idea.owner}<br />{idea.status} · {idea.evidence.join(" / ")}</div></article>)}</div>
        {filteredIdeas.length === 0 && <div className={styles.notice}>По этой комбинации темы не назначены. Выбери другой продукт или стадию.</div>}
        <article className={`${styles.detailPanel} ${styles.widePanel}`}><div className={styles.sectionLabel}>Дистрибуция при 0 ₽</div><h3>Один источник холодной аудитории за раз</h3><div className={styles.methodList}><div><span>01</span><p>Собственные короткие видео: реальные люди, взаимодействие и узнаваемая ситуация вместо длинной заставки.</p></div><div><span>02</span><p>Одна согласованная рекомендация площадки или сообщества. Владелец обращается сам; бесплатность и согласие не предполагаются.</p></div><div><span>03</span><p>Рекомендации довольных гостей: дать понятный материал, которым хочется поделиться. Без массовых личных сообщений.</p></div></div><div className={styles.evidence}>Считаем новых пришедших из источника и затраченные минуты. Нет переходов — проверяем аудиторию/сюжет; есть записи, нет явки — условия и напоминание; нет повторов — опыт встречи.</div></article>
      </section>

      <section id="growth-panel-market" role="tabpanel" aria-labelledby="growth-tab-market" hidden={tab !== "market"}>
        <div className={styles.sectionHead}><div><h2>Рынок: от широкой базы к достижимому спросу</h2><p>Демография помогает задать границы. Клиентами становятся люди с подходящей задачей, географией, временем и готовностью платить.</p></div><span className={styles.sectionLabel}>Проверено 09.11.2026</span></div>
        <div className={styles.marketNumbers}><div className={styles.marketBig}><div className={styles.eyebrow}>Москва / переписной ориентир</div><strong>{formatNumber(MARKET_CONTEXT.moscowPopulation)}</strong><p>Указали армянскую национальность в переписи {MARKET_CONTEXT.censusYear}</p><small>Прочитаны вторичные таблицы. Оригинальный XLSX найден, но не получен. Это не текущая численность 2026 и не TAM покупателей.<br /><a href={MARKET_CONTEXT.sourceUrl} target="_blank" rel="noreferrer">Прочитанный источник ↗</a> · <a href={MARKET_CONTEXT.officialSourceUrl} target="_blank" rel="noreferrer">Оригинал Росстата ↗</a></small></div><div className={styles.marketBig}><div className={styles.eyebrow}>Потенциальные клиенты / SAM</div><strong>Не измерено</strong><p>Подходящие по задаче, языку, дороге, времени и оплате</p><small>{MARKET_CONTEXT.verificationNote}<br />Московская область: {formatNumber(MARKET_CONTEXT.oblastPopulation)} в той же переписи — отдельная география, не автоматический приток в Москву.</small></div></div>
        <div className={styles.widePanel}>
          <article className={styles.detailPanel}><div className={styles.sectionLabel}>Размер рынка — разные вопросы</div><div className={styles.methodList}><div><span>TAM</span><p>{MARKET_CONTEXT.tam}</p></div><div><span>SAM</span><p>{MARKET_CONTEXT.sam}</p></div><div><span>SOM</span><p>{MARKET_CONTEXT.som}</p></div></div></article>
        </div>
        <article className={`${styles.detailPanel} ${styles.widePanel}`}><div className={styles.sectionLabel}>Сценарная арифметика / не измеренный спрос</div><h3>Какие допущения меняют масштаб?</h3><p>Доли ниже введены для демонстрации. Изменение ползунков не создаёт подтверждённых клиентов. Ёмкость мест ограничивает обслуживание, но не доказывает спрос.</p>
          <div className={styles.scenarioFields}>{([
            ["adultShare", "Доля выбранного возраста, %", true], ["languageFitShare", "Подходит язык, %", true], ["travelInterestShare", "Подходит интерес / дорога, %", true], ["reachableShare", "Достижимая доля, %", true], ["eventsPerMonth", "Встреч в месяц", false], ["seatsPerEvent", "Мест на встрече — допущение", false], ["visitsPerPerson", "Визитов на человека / мес.", false], ["ticketPrice", "Разовый билет, ₽", false],
          ] as const).map(([key, label, percent]) => <label key={key}>{label}<input type="number" min="0" step={key === "visitsPerPerson" ? ".5" : "1"} max={percent ? "100" : undefined} value={Number.isFinite(scenario[key]) ? (percent ? Math.round(scenario[key] * 1000) / 10 : scenario[key]) : ""} onChange={(e) => setScenario((prev) => ({ ...prev, [key]: e.target.value === "" ? NaN : Number(e.target.value) / (percent ? 100 : 1) }))} aria-label={label} /></label>)}</div>
          {scenarioResult.errors.length > 0 ? <p className={styles.error} role="alert">{scenarioResult.errors.join(" · ")}</p> : <div className={styles.scenarioResults} aria-live="polite"><div><strong>{formatNumber(scenarioResult.samScenario)}</strong><span>Условно подходящих · SAM-сценарий</span></div><div><strong>{formatNumber(scenarioResult.reachableScenario)}</strong><span>Условно достижимых по выбранной доле</span></div><div><strong>{formatNumber(scenarioResult.capacityVisits)}</strong><span>Мест-посещений в месяц</span></div><div><strong>{formatNumber(scenarioResult.capacityPeople)}</strong><span>Людей при указанной частоте</span></div><div><strong>{formatNumber(scenarioResult.grossCapacityRevenue)} ₽</strong><span>Выручка при полной загрузке, до расходов</span></div></div>}
          <div className={styles.evidence}>Переписная база историческая. Доли, частота и места — неподтверждённые допущения. Это не прогноз продаж и не прибыль. Для реального тарифа нужны себестоимость и пиковые свободные места.</div>
        </article>
        <h2 className={styles.subhead}>Сегменты: зачем человеку именно клуб?</h2><div className={styles.segmentGrid}>{SEGMENTS.map((segment) => <article key={segment.id} className={styles.segment}><div className={styles.eyebrow}>{segment.priority}</div><h3>{segment.name}</h3><p><b>Задача:</b> {segment.jtbd}</p><p><b>Барьер:</b> {segment.barrier}</p><p><b>Предложение:</b> {segment.offer}</p><p><b>Канал:</b> {segment.channel}</p><p><b>Что доказать:</b> {segment.proof}</p></article>)}</div>
        <h2 className={styles.subhead}>Как выбирают между нами и альтернативой</h2><div className={styles.scrollTable}><table className={styles.table}><thead><tr><th>Альтернатива</th><th>За что её выбирают</th><th>Наше отличие для проверки</th><th>Где можем проиграть</th></tr></thead><tbody>{COMPETITORS.map((competitor) => <tr key={competitor.id}><td><a href={competitor.sourceUrl} target="_blank" rel="noreferrer">{competitor.name} ↗</a><br /><small>{competitor.type} · {competitor.date}</small></td><td>{competitor.strength}</td><td>{competitor.ourDifference}</td><td>{competitor.counterSignal}</td></tr>)}</tbody></table></div>
        <div className={styles.notice}><b>Конкурентная стратегия:</b> не копировать школы и не снижать цену вслепую. Доказывать тёплый круг, реальные знакомства и поддерживающую практику. Уровень помощи, качество общения и удобство записи проверяем собственными гостями; «мы лучшие» без доказательств не используем.</div>
      </section>

      <section id="growth-panel-chat" role="tabpanel" aria-labelledby="growth-tab-chat" hidden={tab !== "chat"}>
        <div className={styles.chatOptions}><p className={styles.mapCaption}>Твои существующие проекты и история сохранены. Сообщения отправляются только после нажатия «Отправить».</p><button className={styles.quietButton} onClick={() => setProjectsVisible(!projectsVisible)}><ClipboardList size={13} /> {projectsVisible ? "Свернуть проекты на телефоне" : "Показать проекты"}</button></div>
        <div className={`${styles.chatHost} ${projectsVisible ? "" : styles.chatCollapsed}`}>{chatVisited ? chat ?? <div className={styles.emptyChat}>Это переносимый снимок дашборда. Рабочий чат директора доступен в приложении Content Factory; снимок не вызывает API.</div> : null}</div>
      </section>
      <footer className={styles.footer}><span>Данные → гипотеза → один тест → решение. Редактор и явный апрув владельца перед выпуском.</span><span>Никаких публикаций или автоматического запуска отделов</span></footer>
    </div>
  );
}
