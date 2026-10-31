#!/usr/bin/env node
/**
 * dzen-publish.mjs — СКЕЛЕТ браузер-автопубликации в Яндекс.Дзен (крайний путь, см. shared/pipelines/article/dzen-publish.md).
 * ⚠️ Против ToS Дзена, хрупко (селекторы меняются), ловит капчу/2FA. Предпочитай TG→Дзен или RSS.
 *
 * Требует: сохранённую сессию входа (storageState) — НЕ в git.
 *   DZEN_STORAGE_STATE=/secure/path/dzen-state.json   (создаётся разово: логин в headful + context.storageState())
 *
 * Запуск:
 *   node scripts/dzen-publish.mjs --title "Заголовок" --file article.md            # dry-run (скриншот, НЕ публикует)
 *   node scripts/dzen-publish.mjs --title "..." --file article.md --publish         # публикует
 *
 * Селекторы помечены TODO — выверить на живом редакторе Дзена при первом прогоне.
 */
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';

function arg(name, def = undefined) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return def;
  const v = process.argv[i + 1];
  return v && !v.startsWith('--') ? v : true;
}

const title = arg('title');
const file = arg('file');
const doPublish = Boolean(arg('publish', false));
const statePath = process.env.DZEN_STORAGE_STATE;

if (!title || !file) { console.error('Нужно --title и --file'); process.exit(1); }
if (!statePath) { console.error('Нет DZEN_STORAGE_STATE (сохранённая сессия входа). См. dzen-publish.md'); process.exit(1); }

const body = await readFile(file, 'utf8');

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ storageState: statePath, locale: 'ru-RU' });
const page = await ctx.newPage();

try {
  // TODO: актуальный URL редактора статьи Дзена
  await page.goto('https://dzen.ru/profile/editor/', { waitUntil: 'networkidle', timeout: 60000 });

  // Проверка, что сессия жива (не выкинуло на логин)
  if (/passport\.yandex|\/login/.test(page.url())) {
    throw new Error('Сессия истекла — нужен повторный логин и новый storageState.');
  }

  // TODO: выверить селекторы на живом редакторе
  // await page.click('ТODO: кнопка «Новая статья»');
  // await page.fill('TODO: поле заголовка', title);
  // await page.fill('TODO: поле текста', body);
  // (обложка/картинки — отдельно)

  await page.screenshot({ path: '/tmp/dzen-editor.png', fullPage: true });
  console.log('Скриншот редактора: /tmp/dzen-editor.png');

  if (doPublish) {
    // await page.click('TODO: кнопка «Опубликовать»');
    console.log('[publish] TODO: подтвердить селектор публикации на живом редакторе перед включением.');
  } else {
    console.log('[dry-run] Не публиковал. Для реальной публикации — --publish (после выверки селекторов).');
  }
} catch (e) {
  console.error('FAIL:', e.message, '→ вероятно капча/смена верстки. Используй TG→Дзен или RSS, либо вручную.');
  await page.screenshot({ path: '/tmp/dzen-fail.png', fullPage: true }).catch(() => {});
  process.exitCode = 2;
} finally {
  await browser.close();
}
