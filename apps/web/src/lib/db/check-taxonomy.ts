import fs from "fs";
import path from "path";
const CSV_DIR = path.resolve("d:/CODE/Career/bundle/database/csv");
function parseCsvLine(line: string): string[] {
  const result: string[] = []; let current = ""; let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i], nextChar = line[i + 1];
    if (char === '"') { if (inQuotes && nextChar === '"') { current += '"'; i++; } else { inQuotes = !inQuotes; } }
    else if (char === "," && !inQuotes) { result.push(current.trim()); current = ""; }
    else { current += char; }
  }
  result.push(current.trim()); return result;
}
function parseCsv(filePath: string): any[] {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split(/\r?\n/);
  if (lines.length === 0) return [];
  const header = parseCsvLine(lines[0] || "");
  const result: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i]; if (!rawLine) continue;
    const line = rawLine.trim(); if (!line) continue;
    const values = parseCsvLine(line);
    const row: any = {};
    header.forEach((colName, index) => { row[colName] = values[index] !== undefined ? values[index] : null; });
    result.push(row);
  }
  return result;
}
const terms = parseCsv(path.join(CSV_DIR, "career_taxonomy_terms.csv"));
const types = new Map<string, number>();
for (const t of terms) {
  const tt = t.term_type || "unknown";
  types.set(tt, (types.get(tt) || 0) + 1);
}
console.log("Term types:");
for (const [type, count] of types) console.log(`  ${type}: ${count}`);
console.log(`\nTotal terms: ${terms.length}`);
console.log("\nSample terms per type:");
for (const [type] of types) {
  const samples = terms.filter(t => (t.term_type || "unknown") === type).slice(0, 3);
  console.log(`\n${type} samples:`);
  for (const s of samples) console.log(`  - ${s.name} (${s.slug || s.id})`);
}
