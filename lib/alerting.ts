/**
 * Solution d'alerting
 *
 * Envoie une notification vers un webhook (Discord ou Slack) lorsqu'une erreur
 * critique survient en production. L'URL du webhook est lue depuis la variable
 * d'environnement ALERT_WEBHOOK_URL.
 *
 * - Compatible Discord et Slack (le format du payload est choisi selon l'URL).
 * - Anti-spam : une même alerte n'est pas renvoyée plus d'une fois par minute.
 * - Sans configuration (URL absente), l'alerting est simplement désactivé : le
 *   reste de l'application continue de fonctionner normalement.
 */

import { logger } from "@/lib/logger";

const WEBHOOK_URL = process.env.ALERT_WEBHOOK_URL;
const COOLDOWN_MS = 60_000;

// Mémoire des dernières alertes envoyées (clé -> timestamp) pour limiter le spam.
const lastSentAt = new Map<string, number>();

export interface AlertPayload {
  /** Titre court de l'alerte (ex. "Erreur 500 sur POST /api/dossiers"). */
  title: string;
  /** Message détaillé (souvent le message d'erreur). */
  message: string;
  /** Contexte additionnel affiché dans l'alerte. */
  context?: Record<string, unknown>;
}

function buildDiscordBody(payload: AlertPayload) {
  const fields = Object.entries(payload.context ?? {}).map(([name, value]) => ({
    name,
    value: "```" + String(value).slice(0, 1000) + "```",
    inline: false,
  }));

  return {
    username: "M-Motors Alerting",
    embeds: [
      {
        title: `🚨 ${payload.title}`,
        description: payload.message.slice(0, 2000),
        color: 0xe11d48, // rouge
        fields,
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

function buildSlackBody(payload: AlertPayload) {
  const contextLines = Object.entries(payload.context ?? {})
    .map(([name, value]) => `• *${name}*: ${String(value).slice(0, 1000)}`)
    .join("\n");

  return {
    text: `🚨 *${payload.title}*\n${payload.message.slice(0, 2000)}${
      contextLines ? `\n${contextLines}` : ""
    }`,
  };
}

/**
 * Envoie une alerte vers le webhook configuré.
 * Ne lève jamais d'exception : une panne d'alerting ne doit pas casser la requête.
 */
export async function sendAlert(payload: AlertPayload): Promise<void> {
  if (!WEBHOOK_URL) {
    logger.warn("Alerting désactivé : ALERT_WEBHOOK_URL non défini", {
      alert: payload.title,
    });
    return;
  }

  // Anti-spam : on regroupe par titre.
  const now = Date.now();
  const previous = lastSentAt.get(payload.title);
  if (previous && now - previous < COOLDOWN_MS) {
    return;
  }
  lastSentAt.set(payload.title, now);

  const isSlack = WEBHOOK_URL.includes("hooks.slack.com");
  const body = isSlack ? buildSlackBody(payload) : buildDiscordBody(payload);

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      logger.error("Échec de l'envoi de l'alerte", {
        status: response.status,
        statusText: response.statusText,
      });
    }
  } catch (error) {
    logger.error("Erreur réseau lors de l'envoi de l'alerte", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
