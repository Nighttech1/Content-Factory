### [C-63] Perceived nav speed ≤1s
- **Зона / Экран:** App Shell routes — `/studio`, `/schedule`, `/analytics`, `/brand-kit`, `/settings`, `/admin/mesh`
- **Факт:** смена экрана ощущается >1s; full-page `opacity:0` / blank; тяжёлые клиентские бандлы (mesh, recharts, Razbor) тянут первый paint; Analytics грузит insights и snapshot последовательно
- **Ожидание по DESIGN.md / skills:** `content-factory-ui` § Nav/route loading + `web-motion-engine` § route enter — skeleton/`loading.tsx` без blank shell; **нет** full-page opacity:0; бюджет perceived ≤1s
- **Приоритет:** P0
- **Скрин-улика:** S15 navigate Studio↔Schedule↔Холст; chrome-devtools Performance если >1s
- **Зона:** Frontend | Motion
