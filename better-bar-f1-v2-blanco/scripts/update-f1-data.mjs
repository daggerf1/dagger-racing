import fs from "node:fs/promises";
import path from "node:path";

/* =========================
   CONFIGURACIÓN
========================= */

const YEAR = 2026;

const DRIVERS_SOURCE_URL =
  `https://www.formula1.com/en/results/${YEAR}/drivers`;

const TEAMS_SOURCE_URL =
  `https://www.formula1.com/en/results/${YEAR}/team`;

const DRIVERS_OUTPUT_FILE = path.join(
  process.cwd(),
  "src/data/f1-drivers-champions.json"
);

const TEAMS_OUTPUT_FILE = path.join(
  process.cwd(),
  "src/data/f1-constructors-championship.json"
);

/* =========================
   PILOTOS CONOCIDOS
========================= */

const DRIVER_IDS = {
  "Alexander Albon": "alexander-albon",
  "Fernando Alonso": "fernando-alonso",
  "Kimi Antonelli": "kimi-antonelli",
  "Oliver Bearman": "oliver-bearman",
  "Gabriel Bortoleto": "gabriel-bortoleto",
  "Valtteri Bottas": "valtteri-bottas",
  "Franco Colapinto": "franco-colapinto",
  "Pierre Gasly": "pierre-gasly",
  "Isack Hadjar": "isack-hadjar",
  "Lewis Hamilton": "lewis-hamilton",
  "Ryo Hirakawa": "ryo-hirakawa",
  "Nico Hulkenberg": "nico-hulkenberg",
  "Nico Hülkenberg": "nico-hulkenberg",
  "Liam Lawson": "liam-lawson",
  "Charles Leclerc": "charles-leclerc",
  "Arvid Lindblad": "arvid-lindblad",
  "Lando Norris": "lando-norris",
  "Esteban Ocon": "esteban-ocon",
  "Sergio Perez": "sergio-perez",
  "Sergio Pérez": "sergio-perez",
  "Oscar Piastri": "oscar-piastri",
  "George Russell": "george-russell",
  "Carlos Sainz": "carlos-sainz",
  "Lance Stroll": "lance-stroll",
  "Yuki Tsunoda": "yuki-tsunoda",
  "Max Verstappen": "max-verstappen",
};

/* =========================
   EQUIPOS CONOCIDOS
========================= */

const TEAM_IDS = {
  Mercedes: "mercedes",
  Ferrari: "ferrari",
  McLaren: "mclaren",
  "Red Bull Racing": "red-bull-racing",
  "Racing Bulls": "racing-bulls",
  Alpine: "alpine",
  "Haas F1 Team": "haas-f1-team",
  Audi: "audi",
  Williams: "williams",
  "Aston Martin": "aston-martin",
  Cadillac: "cadillac",
};

/* =========================
   NORMALIZACIÓN
========================= */

function normalizeText(value) {
  return String(value)
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function createSlug(value) {
  return normalizeText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeDriverName(value) {
  return normalizeText(value)
    .replace(/\s+[A-Z]{3}$/, "")
    .trim();
}

/* =========================
   IDENTIFICAR PILOTO
========================= */

function getDriverId(driverName) {
  const knownId = DRIVER_IDS[driverName];

  if (knownId) {
    return knownId;
  }

  const generatedId = createSlug(driverName);

  if (!generatedId) {
    throw new Error(
      `No se pudo generar un ID para "${driverName}".`
    );
  }

  console.warn(
    `⚠️ Piloto nuevo detectado: "${driverName}" → "${generatedId}"`
  );

  return generatedId;
}

/* =========================
   UTILIDADES HTML
========================= */

function decodeHtml(value) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function stripHtml(value) {
  return decodeHtml(
    value
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]*>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

/* =========================
   EXTRAER FILAS HTML
========================= */

function extractRows(html) {
  const rows = [];

  const rowRegex =
    /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;

  let rowMatch;

  while (
    (rowMatch = rowRegex.exec(html)) !== null
  ) {
    const rowHtml = rowMatch[1];

    const cells = [];

    const cellRegex =
      /<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi;

    let cellMatch;

    while (
      (cellMatch = cellRegex.exec(rowHtml)) !== null
    ) {
      cells.push(stripHtml(cellMatch[1]));
    }

    if (cells.length > 0) {
      rows.push(cells);
    }
  }

  return rows;
}

/* =========================
   PARSEAR PILOTOS
========================= */

function parseDriverStandings(rows) {
  const standings = [];

  for (const cells of rows) {
    if (cells.length < 5) {
      continue;
    }

    const position = Number.parseInt(
      cells[0],
      10
    );

    const driver = normalizeDriverName(
      cells[1]
    );

    const team = normalizeText(
      cells[3]
    );

    const points = Number.parseFloat(
      cells[4].replace(",", ".")
    );

    if (
      !Number.isInteger(position) ||
      position < 1 ||
      !driver ||
      !team ||
      !Number.isFinite(points) ||
      points < 0
    ) {
      continue;
    }

    const driverId = getDriverId(driver);

    standings.push({
      position,
      driverId,
      team,
      points,
    });
  }

  return standings;
}

/* =========================
   PARSEAR CONSTRUCTORES
========================= */

function parseConstructorStandings(rows) {
  const standings = [];

  for (const cells of rows) {
    if (cells.length < 3) {
      continue;
    }

    const position = Number.parseInt(
      cells[0],
      10
    );

    const team = normalizeText(
      cells[1]
    );

    const pointsCell =
      cells[cells.length - 1];

    const points = Number.parseFloat(
      pointsCell.replace(",", ".")
    );

    if (
      !Number.isInteger(position) ||
      position < 1 ||
      !team ||
      !Number.isFinite(points) ||
      points < 0
    ) {
      continue;
    }

    const teamId = TEAM_IDS[team];

    if (!teamId) {
      throw new Error(
        `Equipo desconocido recibido desde F1: "${team}"`
      );
    }

    standings.push({
      position,
      teamId,
      team,
      points,
    });
  }

  return standings;
}

/* =========================
   VALIDAR PILOTOS
========================= */

function validateDriverStandings(standings) {
  if (standings.length < 20) {
    throw new Error(
      `Clasificación incompleta: solo se encontraron ${standings.length} pilotos.`
    );
  }

  const driverIds = new Set();
  const positions = new Set();

  for (const standing of standings) {
    if (driverIds.has(standing.driverId)) {
      throw new Error(
        `Piloto duplicado: ${standing.driverId}`
      );
    }

    if (positions.has(standing.position)) {
      throw new Error(
        `Posición duplicada: P${standing.position}`
      );
    }

    driverIds.add(standing.driverId);
    positions.add(standing.position);
  }

  standings.sort(
    (a, b) => a.position - b.position
  );

  return standings;
}

/* =========================
   VALIDAR CONSTRUCTORES
========================= */

function validateConstructorStandings(standings) {
  if (standings.length !== 11) {
    throw new Error(
      `Clasificación incompleta: se esperaban 11 equipos y se encontraron ${standings.length}.`
    );
  }

  const teamIds = new Set();
  const positions = new Set();

  for (const standing of standings) {
    if (teamIds.has(standing.teamId)) {
      throw new Error(
        `Equipo duplicado: ${standing.teamId}`
      );
    }

    if (positions.has(standing.position)) {
      throw new Error(
        `Posición duplicada: P${standing.position}`
      );
    }

    teamIds.add(standing.teamId);
    positions.add(standing.position);
  }

  standings.sort(
    (a, b) => a.position - b.position
  );

  return standings;
}

/* =========================
   DESCARGAR DATOS OFICIALES
========================= */

async function fetchFormula1(url, label) {
  console.log(`🌐 Consultando ${label}...`);

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 DaggerRacingNews/1.0",

      Accept:
        "text/html,application/xhtml+xml",

      "Accept-Language":
        "en-US,en;q=0.9",
    },
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    throw new Error(
      `Formula 1 respondió HTTP ${response.status} al consultar ${label}.`
    );
  }

  const html = await response.text();

  if (!html || html.length < 1000) {
    throw new Error(
      `Respuesta vacía o incompleta para ${label}.`
    );
  }

  return html;
}

/* =========================
   GUARDAR JSON
========================= */

async function saveJson(outputFile, data) {
  const json = JSON.stringify(
    data,
    null,
    2
  );

  const temporaryFile =
    `${outputFile}.tmp`;

  await fs.writeFile(
    temporaryFile,
    `${json}\n`,
    "utf-8"
  );

  await fs.rename(
    temporaryFile,
    outputFile
  );
}

/* =========================
   ACTUALIZAR PILOTOS
========================= */

async function updateDrivers() {
  const html = await fetchFormula1(
    DRIVERS_SOURCE_URL,
    "clasificación de pilotos"
  );

  const rows = extractRows(html);

  if (rows.length === 0) {
    throw new Error(
      "No se encontraron tablas de pilotos en Formula1.com."
    );
  }

  const standings = validateDriverStandings(
    parseDriverStandings(rows)
  );

  console.log(
    `✅ ${standings.length} pilotos encontrados.`
  );

  console.table(
    standings.map((standing) => ({
      P: standing.position,
      Piloto: standing.driverId,
      Equipo: standing.team,
      Puntos: standing.points,
    }))
  );

  return standings;
}

/* =========================
   ACTUALIZAR CONSTRUCTORES
========================= */

async function updateConstructors() {
  const html = await fetchFormula1(
    TEAMS_SOURCE_URL,
    "clasificación de constructores"
  );

  const rows = extractRows(html);

  if (rows.length === 0) {
    throw new Error(
      "No se encontraron tablas de constructores en Formula1.com."
    );
  }

  const standings =
    validateConstructorStandings(
      parseConstructorStandings(rows)
    );

  console.log(
    `✅ ${standings.length} equipos encontrados.`
  );

  console.table(
    standings.map((standing) => ({
      P: standing.position,
      Equipo: standing.team,
      ID: standing.teamId,
      Puntos: standing.points,
    }))
  );

  return standings;
}

/* =========================
   PROCESO PRINCIPAL
========================= */

async function main() {
  console.log("");

  console.log("🏎️ Dagger Racing News");
  console.log(
    `📊 Actualizando campeonato F1 ${YEAR}`
  );

  console.log("");

  /*
   * Descargamos y validamos ambas
   * clasificaciones antes de guardar.
   */

  const driverStandings =
    await updateDrivers();

  console.log("");

  const constructorStandings =
    await updateConstructors();

  console.log("");

  /*
   * Guardar solamente cuando ambas
   * clasificaciones sean válidas.
   */

  await saveJson(
    DRIVERS_OUTPUT_FILE,
    driverStandings
  );

  await saveJson(
    TEAMS_OUTPUT_FILE,
    constructorStandings
  );

  console.log(
    "✅ Campeonato de pilotos actualizado."
  );

  console.log(
    `📁 ${DRIVERS_OUTPUT_FILE}`
  );

  console.log("");

  console.log(
    "✅ Campeonato de constructores actualizado."
  );

  console.log(
    `📁 ${TEAMS_OUTPUT_FILE}`
  );

  console.log("");

  console.log(
    `🌐 Pilotos: ${DRIVERS_SOURCE_URL}`
  );

  console.log(
    `🌐 Constructores: ${TEAMS_SOURCE_URL}`
  );

  console.log("");
}

/* =========================
   EJECUTAR
========================= */

main().catch((error) => {
  console.error("");

  console.error(
    "❌ No se pudo actualizar el campeonato F1."
  );

  console.error(
    error instanceof Error
      ? error.message
      : error
  );

  console.error("");

  console.error(
    "🛡️ La validación impidió guardar una clasificación incompleta."
  );

  console.error("");

  process.exitCode = 1;
});
