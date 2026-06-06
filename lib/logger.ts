/**
 * Logger structuré centralisé
 *
 * - En production : sortie JSON sur une seule ligne (horodatage, niveau, message,
 *   contexte) facilement agrégeable par un collecteur de logs (Docker, Vercel, etc.).
 * - En développement : sortie colorée et lisible pour le terminal.
 *
 * Zéro dépendance externe : repose sur `console`, donc compatible avec tous les
 * runtimes Next.js (Node et Edge) et avec le bundling de production.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

export type LogContext = Record<string, unknown>;

const isProduction = process.env.NODE_ENV === "production";

const LEVEL_COLORS: Record<LogLevel, string> = {
  debug: "\x1b[90m", // gris
  info: "\x1b[36m", // cyan
  warn: "\x1b[33m", // jaune
  error: "\x1b[31m", // rouge
};
const RESET = "\x1b[0m";

function write(level: LogLevel, message: string, context?: LogContext) {
  const time = new Date().toISOString();

  if (isProduction) {
    // Une ligne de JSON par log -> exploitable par un agrégateur.
    const entry = { time, level, message, ...context };
    const out = level === "error" ? console.error : console.log;
    out(JSON.stringify(entry));
    return;
  }

  // Développement : format lisible et coloré.
  const color = LEVEL_COLORS[level];
  const prefix = `${color}${time} ${level.toUpperCase().padEnd(5)}${RESET}`;
  const out = level === "error" ? console.error : console.log;
  if (context && Object.keys(context).length > 0) {
    out(`${prefix} ${message}`, context);
  } else {
    out(`${prefix} ${message}`);
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => write("debug", message, context),
  info: (message: string, context?: LogContext) => write("info", message, context),
  warn: (message: string, context?: LogContext) => write("warn", message, context),
  error: (message: string, context?: LogContext) => write("error", message, context),
};
