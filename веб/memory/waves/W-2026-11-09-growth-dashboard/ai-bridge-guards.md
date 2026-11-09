# AI Bridge — воспроизводимые проверки

09.11.2026 · W-2026-11-09-growth-dashboard. Выполнено AI Bridge; не независимый вердикт Тестировщика. Контракт API/user history не менялся.

## 1. Методические пути

Из корня репозитория:

```bash
python3 shared/skills/marketing-methods/validate.py
```

Получено: `PASS: 3 pinned repositories, 31 verified source files, 10 source methods, 9 modules, 17 roles, 6 pipelines, 5 existing skills`. Это проверка источников/путей адаптера офлайн, не производства контента или поведения внешнего API.

## 2. Transport guard действующего runtime

Из `веб/`, после установки зависимостей и `prisma generate`, выполнить команду ниже. Она импортирует **настоящий** `runMarketingDirectorChat`, заменяет `global.fetch` локальным ответом и проверяет собранный payload. Значения env — фиктивные, задаются только внутри этого Node-процесса; реальные ключи не используются/не выводятся. Внешних запросов нет. Возвращённый текст — транспортная fixture, не маркетинговый ответ модели.

```bash
node --import tsx - <<'JS'
const assert = require('node:assert/strict');
const { MARKETING_DIRECTOR_SYSTEM_PROMPT: prompt } = require('./lib/marketing/prompt.ts');
const { runMarketingDirectorChat } = require('./lib/marketing/chat.ts');

process.env.AGGREGATOR_API_KEY = 'offline-test-placeholder';
process.env.AGGREGATOR_BASE_URL = 'https://offline.invalid/v1';
let captured = null;
let calls = 0;
global.fetch = async (_url, init) => {
  calls++;
  captured = JSON.parse(init.body);
  return new Response(JSON.stringify({
    model: 'offline-fixture',
    choices: [{ message: { role: 'assistant', content: 'offline transport fixture' } }],
  }), { status: 200, headers: { 'content-type': 'application/json' } });
};

(async () => {
  const raw = 'Покажи рынок и путь холодной аудитории';
  const result = await runMarketingDirectorChat({ user: raw, thinking: false });
  assert(result.ok);
  assert.equal(calls, 1);
  assert.equal(captured.messages.at(-1).role, 'user');
  assert.equal(captured.messages.at(-1).content, raw);
  assert.equal(captured.messages[0].role, 'system');
  assert(captured.messages[0].content.startsWith(prompt));
  for (const fragment of [
    'STP/JTBD', 'TAM', 'SAM', 'SOM', 'attraction-first',
    'нулевом/неизвестном знаменателе', 'Рекомендации', 'реактивация', 'платные API',
  ]) assert(prompt.includes(fragment), fragment);
  console.log('PASS offline transport contract: strengthened system prompt reaches chat.ts; raw user preserved; one intercepted fetch, zero network/LLM calls. This is not a live model-quality test.');
})().catch(error => { console.error(error); process.exitCode = 1; });
JS
```

Получено: `PASS offline transport contract: strengthened system prompt reaches chat.ts; raw user preserved; one intercepted fetch, zero network/LLM calls. This is not a live model-quality test.` Exit code 0.

Существенное доказательство здесь — проверка **собранного runtime payload**, а не только поиск строки в файле. Она подтверждает доставку инструкции через существующий `chat.ts`, отдельную system-роль и неизменённый user turn. Она не подтверждает качество рекомендаций, следование методу моделью, исправность tools во внешней среде или эффект на конверсию. Реальный LLM smoke не выполнялся и не требуется для этого разрешённого офлайн-изменения.

## 3. Diff hygiene

`git diff --check` по семи изменённым существующим файлам прошёл; новый playbook и этот guard — Markdown, без секретов. Изменения не затрагивают `chat.ts`, API routes, модель/настройки провайдера, БД, публикацию или статусы контента. Commit/push остаются у Оркестратора.
