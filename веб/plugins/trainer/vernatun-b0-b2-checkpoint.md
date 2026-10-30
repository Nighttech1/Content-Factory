# Trainer — Vernatun B0–B2 checkpoint (усиливаем команду)

**Когда:** после live Mode B без HTML chrome; Клиент REJECT.

## Findings → усиления

| Finding | Усилить в |
|---------|-----------|
| Logo shape drift across slides | `buildModeBSlidePrompt` + AD CHECK + repair logo-only edit |
| Pagination 2/6 on 4-slide | image prompt ban + QA vs `script.slide_count` |
| FINAL despite major | supervisor / finalize gate |
| Double logo on CTA | «exactly one logo» in prompt + CHECK |

## HARD locks

- Client: no half-finished approve  
- Mode A HTML chrome not a product fix  
- Always write `prompts/` DEV_TRACE  

## Next wave focus

B5 gate majors → then B3 type_system → B4 HY script letters.
