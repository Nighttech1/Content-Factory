#!/usr/bin/env bash
# clone-to-fingrad.sh — клонирует структуру команды Вернатун → Финград.
# Копирует РОЛИ/СТРУКТУРU, сбрасывает ДАННЫЕ (план/черновики/память), оставляет TODO на ребрендинг.
# Финград пока НЕ поднимаем — скрипт готов, запускать по готовности.
# Запуск:  bash scripts/clone-to-fingrad.sh
set -euo pipefail
cd "$(dirname "$0")/.."

SRC=projects/vernatun
DST=projects/fingrad

if [ -e "$DST" ] && [ "$(ls -A "$DST" 2>/dev/null | grep -v '.gitkeep' || true)" ]; then
  echo "⚠️  $DST уже не пустой — останавливаюсь, чтобы не затереть."; exit 1
fi

echo "→ Создаю структуру $DST"
mkdir -p "$DST"/.claude/agents "$DST"/brand "$DST"/content-plan "$DST"/drafts "$DST"/assets "$DST"/memory

echo "→ Копирую агентов (роли переиспользуемы; тексты про «Вернатун» — ребрендить)"
cp "$SRC"/.claude/agents/*.md "$DST"/.claude/agents/

echo "→ Память: создаю чистые файлы (данные НЕ копируем — память изолирована по проектам)"
for f in "$SRC"/memory/*.md; do
  base=$(basename "$f")
  cat > "$DST/memory/$base" <<EOF
# memory/$base — память агента (Финград)

## Зафиксированные решения
- (клон структуры Вернатун; заполнить под Финград)

## Выученные уроки (лог) — формат: \`ГГГГ-ММ-ДД — урок\`
- (пусто)
EOF
done

echo "→ Бренд: заготовки (ЗАПОЛНИТЬ под Финград)"
cat > "$DST/brand/brief.md" <<'EOF'
# brief.md — Финград Консалтинг (ЗАПОЛНИТЬ)
> TODO: позиционирование, аудитория, тон, цели, запреты, каналы. Это закон для агентов.
EOF
cat > "$DST/brand/design.md" <<'EOF'
# design.md — дизайн-токены Финград (ЗАПОЛНИТЬ)
> TODO: палитра, шрифты, лого, отступы. Читает brand-kit.
EOF

echo "→ .gitkeep в пустые папки"
for d in content-plan drafts assets; do touch "$DST/$d/.gitkeep"; done

echo "✅ Готово. Дальше: заполнить brand/brief.md + design.md под Финград, ребрендить тексты агентов,"
echo "   переключить ACTIVE_PROJECT=fingrad при работе над ним. Shared (скиллы/пайплайны/правила) — общие, не трогать."
