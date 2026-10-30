/** Extract JSON object from LLM text (strips fences). Gemini often truncates. */

function tryParse(s: string): unknown {
  return JSON.parse(s);
}

/** Close truncated JSON by trimming to last complete object/array boundary. */
function repairTruncatedJson(slice: string): string {
  let s = slice.trim();
  // Drop trailing incomplete string value: ,"key": "abc
  s = s.replace(/,\s*"[^"]*":\s*"[^"]*$/s, "");
  s = s.replace(/,\s*"[^"]*$/s, "");
  s = s.replace(/:\s*"[^"]*$/s, ': ""');
  // Balance braces/brackets
  const opens = (s.match(/\{/g) || []).length;
  const closes = (s.match(/\}/g) || []).length;
  const openArr = (s.match(/\[/g) || []).length;
  const closeArr = (s.match(/\]/g) || []).length;
  if (openArr > closeArr) s += "]".repeat(openArr - closeArr);
  if (opens > closes) s += "}".repeat(opens - closes);
  return s;
}

export function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("empty_llm_json");
  try {
    return tryParse(trimmed);
  } catch {
    /* continue */
  }
  const fence = /```(?:json)?\s*([\s\S]*?)```/i.exec(trimmed);
  if (fence?.[1]) {
    try {
      return tryParse(fence[1].trim());
    } catch {
      try {
        return tryParse(repairTruncatedJson(fence[1]));
      } catch {
        /* continue */
      }
    }
  }
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try {
      return tryParse(trimmed.slice(start, end + 1));
    } catch {
      /* continue */
    }
  }
  if (start >= 0) {
    try {
      return tryParse(repairTruncatedJson(trimmed.slice(start)));
    } catch {
      /* continue */
    }
  }
  throw new Error("llm_json_parse_fail");
}
