import fs from "node:fs/promises";
import path from "node:path";

const YEAR = 2026;
const BASE = `https://api.jolpi.ca/ergast/f1/${YEAR}`;
const OUTPUT = path.resolve(
  "src/data/motorsport/season.json"
);

const sleep = ms =>
  new Promise(resolve => setTimeout(resolve, ms));

async function request(route) {
  await sleep(1100);

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(
        `${BASE}${route}?limit=100`,
        {
          signal: AbortSignal.timeout(30000),
          headers: {
            Accept: "application/json"
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json = await response.json();

      if (!json.MRData) {
        throw new Error("Respuesta inválida");
      }

      return json.MRData;

    } catch (error) {
      if (attempt === 3) throw error;
      await sleep(attempt * 5000);
    }
  }
}

function driver(row) {
  return {
    id: row.Driver.driverId,
    code: row.Driver.code ?? "",
    name: [
      row.Driver.givenName,
      row.Driver.familyName
    ].join(" "),
    surname: row.Driver.familyName,
    number: row.number ??
      row.Driver.permanentNumber ?? "",
    team: row.Constructor?.name ??
      row.Constructors?.at(-1)?.name ?? "",
    teamId: row.Constructor?.constructorId ??
      row.Constructors?.at(-1)?.constructorId ?? ""
  };
}

function raceInfo(race) {
  return {
    round: Number(race.round),
    name: race.raceName,
    date: race.date,
    circuitId: race.Circuit.circuitId,
    circuit: race.Circuit.circuitName
  };
}

async function main() {
  console.log("DRN MOTORSPORT PRO");
  console.log("Consultando resultados...");

  const resultsData = await request("/last/results/");
  const race = resultsData.RaceTable?.Races?.[0];

  if (!race || race.Results?.length < 3) {
    throw new Error("Resultados insuficientes");
  }

  const results = race.Results.map(row => ({
    ...driver(row),
    position: Number(row.position),
    grid: Number(row.grid),
    points: Number(row.points),
    status: row.status,
    time: row.Time?.time ?? ""
  }));

  const podium = results
    .filter(row => row.position >= 1 && row.position <= 3)
    .sort((a, b) => a.position - b.position);

  if (
    podium.length !== 3 ||
    podium.some((row, i) => row.position !== i + 1)
  ) {
    throw new Error("Podio inválido");
  }

  console.log("Consultando clasificación...");

  const qualifyingData = await request(
    "/last/qualifying/"
  );

  const qualifyingRace =
    qualifyingData.RaceTable?.Races?.[0];

  if (!qualifyingRace?.QualifyingResults?.length) {
    throw new Error("Clasificación no disponible");
  }

  const qualifying =
    qualifyingRace.QualifyingResults.map(row => ({
      ...driver(row),
      position: Number(row.position),
      q1: row.Q1 ?? "",
      q2: row.Q2 ?? "",
      q3: row.Q3 ?? ""
    }));

  console.log("Consultando circuitos...");

  const circuitData = await request("/circuits/");

  const circuits =
    circuitData.CircuitTable?.Circuits ?? [];

  if (!circuits.length) {
    throw new Error("Circuitos no disponibles");
  }

  console.log("Recuperando historial del campeonato...");

  const history = [];

  for (let round = 1; round <= Number(race.round); round++) {
    console.log(`Ronda ${round} de ${race.round}`);

    const data = await request(
      `/${round}/driverstandings/`
    );

    const standings =
      data.StandingsTable?.StandingsLists?.[0];

    if (
      !standings?.DriverStandings?.length ||
      Number(standings.round) !== round
    ) {
      throw new Error(`Historial inválido: ronda ${round}`);
    }

    const rows = standings.DriverStandings.map(row => ({
      ...driver(row),
      position: Number(row.position),
      points: Number(row.points)
    }));

    if (rows.some(row => !Number.isFinite(row.points))) {
      throw new Error(`Puntos inválidos: ronda ${round}`);
    }

    history.push({
      round,
      drivers: rows
    });
  }

  const actualGrid = results
    .filter(row => row.grid > 0)
    .sort((a, b) => a.grid - b.grid);

  const pitLaneOrUnassigned = results
    .filter(row => row.grid === 0);

  const data = {
    season: YEAR,
    source: "Jolpica F1",
    latestRace: {
      ...raceInfo(race),
      podium,
      results,
      grid: actualGrid,
      pitLaneOrUnassigned
    },
    latestQualifying: {
      ...raceInfo(qualifyingRace),
      drivers: qualifying
    },
    circuits,
    history
  };

  const content = JSON.stringify(data, null, 2) + "\n";

  const previous = await fs.readFile(
    OUTPUT, "utf8"
  ).catch(() => "");

  if (previous === content) {
    console.log("Los datos ya están actualizados.");
    return;
  }

  await fs.mkdir(path.dirname(OUTPUT), {
    recursive: true
  });

  const temporary = `${OUTPUT}.tmp`;

  await fs.writeFile(temporary, content);
  await fs.rename(temporary, OUTPUT);

  console.log("\nDATOS GUARDADOS CORRECTAMENTE");
  console.log("Último GP:", race.raceName);
  console.log("Rondas históricas:", history.length);
  console.log("Circuitos:", circuits.length);

  console.table(
    podium.map(row => ({
      posicion: row.position,
      piloto: row.name,
      puntos: row.points
    }))
  );
}

main().catch(error => {
  console.error("ERROR:", error.message);
  process.exitCode = 1;
});
