import fs from "node:fs";
import path from "node:path";

export const teamColors: Record<string, string> = {
  mercedes: "#00d2be",
  ferrari: "#ff3535",
  red_bull: "#5478ff",
  mclaren: "#ff8000",
  alpine: "#ff87bc",
  williams: "#64a4ff",
  aston_martin: "#229971",
  rb: "#819aff",
  racing_bulls: "#819aff",
  haas: "#d5d5d5",
  audi: "#d94343",
  cadillac: "#c4bbaa"
};

export function teamColor(id: string) {
  return teamColors[id] ?? "#aeb4bf";
}

export function carImage(surname: string) {
  const name = surname
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  const file =
    `monoplaza_${name}_drn_daggerracingnews.png`;

  return fs.existsSync(
    path.join(process.cwd(), "public", file)
  ) ? `/${file}` : "";
}
