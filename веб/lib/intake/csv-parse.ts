/**
 * Minimal RFC4180 CSV parser (quoted fields + embedded newlines).
 * No dependency — Backend sheet intake only.
 */

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let i = 0;
  let inQuotes = false;
  const s = text.replace(/^\uFEFF/, "");

  while (i < s.length) {
    const ch = s[i]!;
    if (inQuotes) {
      if (ch === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += ch;
      i += 1;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (ch === ",") {
      row.push(field);
      field = "";
      i += 1;
      continue;
    }
    if (ch === "\r") {
      i += 1;
      continue;
    }
    if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i += 1;
      continue;
    }
    field += ch;
    i += 1;
  }
  // trailing field
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** Map header row → objects; empty header cells become `__colN`. */
export function rowsToObjects(
  matrix: string[][],
  headerRowIndex: number,
): { headers: string[]; objects: Record<string, string>[] } {
  const headerRaw = matrix[headerRowIndex] ?? [];
  const headers = headerRaw.map((h, idx) => {
    const t = (h ?? "").trim();
    return t || `__col${idx}`;
  });
  const objects: Record<string, string>[] = [];
  for (let r = headerRowIndex + 1; r < matrix.length; r++) {
    const cells = matrix[r] ?? [];
    if (cells.every((c) => !(c ?? "").trim())) continue;
    const obj: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      obj[headers[c]!] = (cells[c] ?? "").trim();
    }
    objects.push(obj);
  }
  return { headers, objects };
}
