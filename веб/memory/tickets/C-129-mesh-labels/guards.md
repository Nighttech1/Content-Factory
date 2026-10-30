# Guards — C-129 mesh handoff labels

## Assert (Playwright @1440)

1. Navigate `/admin/mesh`.
2. Visible `[data-testid="mesh-edge-handoff"]` = short RU only (carousel: 6).
3. No mid-edge text on dashed Trainer→release.
4. Dictionary: `запрос|разбор|сценарий|медиа|фильтр постов|выводы`.
5. **HARD D1:** handoff bbox ∩ node bbox = **0**.
6. **D2 clear:** relevant vertical clear ≥8px (labels in inter-lane gutter).
7. Agent titles not truncated with ellipsis (full «Копирайтер каруселей» etc.).
8. Regression: dual-lane / barbell / panel / no MiniMap.

## Evidence 2026-10-10 (Playwright measure)

```
texts: [запрос, разбор, сценарий, медиа, фильтр постов, выводы]
hits: 0
clear: запрос 15.5, сценарий 34.3, … (≥8)
pass: true
dashed mid-labels: 0
titles: full (no ellipsis)
```

Screenshot: `client-c129-agreed.png`

Tester: **PASS**  
Client: S33 labels HARD — ready for **согласовано**
