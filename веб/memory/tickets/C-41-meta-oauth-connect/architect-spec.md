# Architect spec — C-41 Meta OAuth Connect

> Заполняет **Архитектор** до любого кода. Код не писать в этой фазе.

## 1. Цель продукта (простыми словами)

Друг клуба открывает страницу фабрики, нажимает «Подключить Facebook / Instagram», входит через **официальное окно Meta**, разрешает доступ. Интерфейс **сам** получает нужные для Content Factory данные:

| Что нужно фабрике | Зачем |
|-------------------|--------|
| Долгоживущий Page Access Token → `IG_ACCESS_TOKEN` / `INSTAGRAM_ACCESS_TOKEN` | Читать ленту, хэштеги, позже публиковать |
| `IG_USER_ID` | Instagram Business/Creator ID аккаунта клуба (mosarmclub и т.п.) |
| (опц.) Facebook Page ID | Привязка Page ↔ Instagram |

**Не цель:** форма «логин + пароль Facebook» внутри нашего сайта. Это запрещено правилами Meta, ломается 2FA, токены отзывают, риск бана.

---

## 2. Ответ на вопрос заказчика: «Если сейчас зарегаю Meta — смогу протестировать интерфейс?»

### Коротко

**Частично да**, но **одного личного аккаунта Meta мало**. Для теста мастера OAuth нужен «набор клуба».

### Что обязательно собрать до теста

| # | Что | Зачем |
|---|-----|--------|
| 1 | Личный аккаунт Facebook/Meta (можно новый) | Вход в OAuth |
| 2 | **Facebook Page** клуба | Токен для Graph API — page-level |
| 3 | **Instagram** типа Business или Creator, **привязанный к этой Page** | Иначе `IG_USER_ID` не появится |
| 4 | Приложение в [developers.facebook.com](https://developers.facebook.com) (Meta App) | Client ID / Secret для OAuth |
| 5 | В приложении: продукт **Facebook Login** + permissions (ниже) | Без этого кнопка «войти» бесполезна |
| 6 | Режим **Development** + роли: Admin / Developer / **Tester** на аккаунт друга | Пока нет App Review — только эти люди могут пройти OAuth |

### Что можно тестировать сразу после регистрации «пакета»

- Весь UI мастера: кнопка → редирект Meta → callback → сохранение ID.
- Обмен code → short-lived user token → long-lived → page token.
- Запрос `me/accounts` + `instagram_business_account` → показать Page ID + IG_USER_ID.
- «Проверить связь» → `/{IG_USER_ID}?fields=id,username` → badge live.

### Чего **нельзя** ожидать без App Review (публичный Live Mode)

- Любой случайный пользователь Facebook вне ролей приложения успешно авторизуется.
- Полный production publish на чужие аккаунты без ревью Meta (для клуба на старте достаточно Development + роли клуба).

### Практическая рекомендация клубу

1. Использовать **существующий** аккаунт админа клуба + Page + IG Business (лучше, чем «голый» новый аккаунт без Page/IG).
2. Новый аккаунт Meta имеет смысл **только** если нет доступа к админке Page/IG — тогда всё равно придётся создать Page и привязать IG.
3. App ID / App Secret класть только в `.env` (`META_APP_ID`, `META_APP_SECRET`), не в чат и не в тикеты.

---

## 3. Границы (In / Out)

### In scope

1. Экран мастера: `/studio/settings/meta-connect` **или** `/admin/integrations/meta` (OWNER/ADMIN).
2. Backend OAuth:
   - `GET /api/meta/oauth/start` — редирект на Meta dialog.
   - `GET /api/meta/oauth/callback` — code → tokens → resolve Page + IG IDs.
   - `POST /api/meta/oauth/verify` — health-check Graph без утечки токена в ответ.
   - `POST /api/meta/oauth/save-local` (dev) — безопасная запись в локальный `.env.local` **только на localhost**; на shared/prod — шифр. vault / DB secrets (см. Decisions).
3. UI: шаги мастера, статусы, маскированный токен (`••••` + last 4), копирование только ID (не полного токена по умолчанию).
4. Документация для друга: чеклист «что нажать в Meta Business / Developers» (короткий `docs/META_CONNECT.md`).
5. Permissions (минимум для текущего продукта — feed/hashtags C-36…C-40):

| Permission | Зачем сейчас |
|------------|----------------|
| `pages_show_list` | Список Page |
| `pages_read_engagement` | Метрики/контент Page |
| `instagram_basic` | Базовый IG профиль |
| `instagram_manage_insights` | Insights (если уже используем) |
| `business_management` | Только если Business Manager обязателен для связки |

**На будущее (Publisher, отдельный тикет):** `pages_manage_posts`, `instagram_content_publish` — **не** включать в C-41, чтобы не раздувать App Review раньше времени. В UI пометить «Публикация — следующая волна».

### Out of scope

- Автоматический логин паролем / Puppeteer в facebook.com.
- Полный App Review и Live Mode для всех юзеров.
- Публикация постов (Publisher worker).
- TikTok / YouTube OAuth.
- Prisma-модель multi-tenant secrets (можно заложить интерфейс, реализация — Decision D1).

---

## 4. Пользовательский сценарий (acceptance)

**S-Meta-1.** OWNER открывает мастер → видит шаги: «Приложение Meta настроено?» → «Войти через Facebook» → «Выбрать Page» → «Готово».

**S-Meta-2.** Клик «Войти» → уход на `facebook.com/vXX.X/dialog/oauth` → после согласия возврат на callback → UI показывает username IG + ID.

**S-Meta-3.** «Проверить связь» → успех: «Связь с Instagram живая»; при просроченном токене — «Нужно подключить заново», без 500.

**S-Meta-4.** Пользователь **не** роли приложения (Development) → Meta показывает ошибну доступа → наш UI объясняет: «Добавьте аккаунт как Tester в Meta App».

**S-Meta-5.** RBAC: ADMIN без права интеграций (если так решим) или OWNER-only — как mesh: не светить секреты ADMIN'у без нужды. **Decision D2:** OWNER-only для save token.

---

## 5. Технический контракт

### Env (дополнение `.env.example`)

```env
# Meta App (developers.facebook.com) — never commit real values
META_APP_ID=
META_APP_SECRET=
META_OAUTH_REDIRECT_URI=http://localhost:3000/api/meta/oauth/callback
META_GRAPH_API_VERSION=v21.0

# Result of Connect wizard (existing aliases kept)
# IG_ACCESS_TOKEN=
# IG_USER_ID=
# META_PAGE_ID=
```

### OAuth flow (канон)

```
[UI] → GET /api/meta/oauth/start
     → redirect Meta dialog (state=csrf)
[Meta] → GET /api/meta/oauth/callback?code&state
     → validate state
     → POST /oauth/access_token (code → short user token)
     → exchange long-lived user token
     → GET /me/accounts?fields=id,name,access_token,instagram_business_account
     → pick Page (если одна — auto; если несколько — UI select)
     → IG_USER_ID = page.instagram_business_account.id
     → Page token (long-lived) → persist as IG_ACCESS_TOKEN
     → redirect UI ?connected=1
```

### API responses (без секретов)

```ts
type MetaConnectStatus = {
  connected: boolean;
  pageId?: string;
  pageName?: string;
  igUserId?: string;
  igUsername?: string;
  tokenPresent: boolean;
  tokenPreview?: string; // "…a1b2" only
  verifiedAt?: string;
  lastError?: string;
};
```

**Invariant:** ни один JSON response / log / ticket не содержит полный access_token.

### UI

- Стек: Next.js 15 App Router, токены Dark Luxury / GlassCard (`content-factory-ui`), 21st.dev для кнопки/stepper при живом MCP.
- Mobile: один столбец, CTA доступен пальцем (`responsive-mobile-web`).
- Не карточки ради карточек: мастер = одна композиция шагов.

---

## 6. Decisions

| ID | Decision | Why |
|----|----------|-----|
| D1 | **Localhost:** после OAuth писать в `.env.local` (или показать «Скачать .env snippet» + кнопка Apply local). **Shared/prod:** только encrypted server-side store / не коммитить. | Data-safety; сейчас тест на localhost |
| D2 | Экран Connect и save — **OWNER-only** (как `/admin/mesh`) | Секреты клуба |
| D3 | Permissions publish **не** в C-41 | Меньше friction App Review; feed уже работает на read scopes |
| D4 | Если у Page нет `instagram_business_account` — стоп с инструкцией «переведите IG в Business и привяжите к Page» | Частая ошибка новичков |
| D5 | CSRF `state` в httpOnly cookie / server session, TTL короткий | Security OAuth |

---

## 7. Риски и митигация

| Риск | Митигация |
|------|-----------|
| Друг думает, что «регистрации Meta хватит» | Чеклист в UI + этот spec §2 |
| Токен short-lived истекает | Exchange long-lived; UI «переподключить» |
| App Secret в клиенте | Только server routes |
| Случайный commit `.env.local` | `.gitignore` уже; guard теста |

---

## 8. Acceptance checklist (Клиент)

- [ ] Нет поля «пароль Facebook» на нашем сайте.
- [ ] После OAuth видны Page name + IG username + ID.
- [ ] `IG_USER_ID` и факт наличия токена позволяют Studio badge «Онлайн · Instagram» при verify.
- [ ] Полный токен не светится в UI/Network response.
- [ ] Development: Tester-роль проходит; чужой аккаунт — понятная ошибка.
- [ ] Документ `docs/META_CONNECT.md` читается не-айтишником.

---

## 9. Зависимости продукта

- Уже есть: live IG feed (C-36…C-40) читает `IG_ACCESS_TOKEN` + `IG_USER_ID`.
- C-41 **не ломает** mock soft-fail без токена.
