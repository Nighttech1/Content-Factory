"""
Reference contracts for Cortana retrieval (ТЗ §5–9).
Agents/AI Bridge: keep runtime Pydantic in cortana_service/schemas/retrieval.py in sync.
"""

from __future__ import annotations

from typing import Any, Literal, TypedDict

EntityCode = Literal[
    "objectives",
    "path",
    "biometrics",
    "dreams",
    "temporal",
    "coach_notes",
    "meta_schema",
]

ENTITY_CODES: tuple[str, ...] = (
    "objectives",
    "path",
    "biometrics",
    "dreams",
    "temporal",
    "coach_notes",
    "meta_schema",
)


class FactRef(TypedDict, total=False):
    type: str
    id: str
    label: str


class TextBlock(TypedDict):
    entity: str
    text: str


class FilteredContext(TypedDict, total=False):
    entities_included: list[str]
    text_blocks: list[TextBlock]
    facts_refs: list[FactRef]
    coverage_notes: str


class SufficiencySignal(TypedDict, total=False):
    context_sufficient: bool
    need_vector_search: bool
    missing_entities: list[str]
    missing_hints: list[str]
    answer: str | None


class RouterResult(TypedDict, total=False):
    entities: list[str]
    rationale: str


ANTI_HALLUCINATION_PROMPT_BLOCK = """
DATA RULES (обязательно):
- Отвечай только по FILTERED_CONTEXT и VECTOR_HITS.
- Не придумывай и не додумывай цели, Path, привычки, события, id, прогресс.
- Если фактов не хватает — верни JSON need_vector_search=true, answer=null (не фантазируй).
- Если vector_round_done=true и hits пусты по теме — честно: в данных Спутника этого нет.
""".strip()


def validate_entity_codes(codes: list[str]) -> list[str]:
    bad = [c for c in codes if c not in ENTITY_CODES]
    if bad:
        raise ValueError(f"Unknown entity codes: {bad}")
    return list(dict.fromkeys(codes))


def merge_entity_union(*groups: list[str]) -> list[str]:
    out: list[str] = []
    for g in groups:
        for c in g:
            if c in ENTITY_CODES and c not in out:
                out.append(c)
    return out


def sufficiency_needs_vector(signal: dict[str, Any]) -> bool:
    return bool(signal.get("need_vector_search")) and not bool(
        signal.get("context_sufficient")
    )
