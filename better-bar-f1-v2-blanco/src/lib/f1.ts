import drivers from "../data/editorial/drivers.json";
import teams from "../data/editorial/teams.json";
import standings from "../data/f1-drivers-champions.json";

export const driverById = Object.fromEntries(drivers.map((d) => [d.id, d]));
export const teamById = Object.fromEntries(teams.map((t) => [t.id, t]));

export function slugifyTeam(name: string) {
  const exact = teams.find((t) => t.name.toLowerCase() === name.toLowerCase());
  if (exact) return exact.slug;
  const aliases: Record<string,string> = {
    "red bull": "red-bull-racing", "haas": "haas-f1-team"
  };
  return aliases[name.toLowerCase()] || name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
}
export function driverStanding(id: string) {
  return standings.find((s) => s.driverId === id);
}
