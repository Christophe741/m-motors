import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// `fetch` est mocké globalement : aucun appel réseau réel pendant les tests.
const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

const discordUrl = "https://discord.com/api/webhooks/123/abc";
const slackUrl = "https://hooks.slack.com/services/T/B/X";

/**
 * `alerting.ts` lit ALERT_WEBHOOK_URL au chargement du module. On force donc la
 * variable d'environnement PUIS on recharge le module pour chaque scénario.
 */
async function loadAlerting(url: string) {
  vi.resetModules();
  vi.stubEnv("ALERT_WEBHOOK_URL", url);
  return import("@/lib/alerting");
}

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({ ok: true, status: 200, statusText: "OK" });
});

afterEach(() => vi.unstubAllEnvs());

describe("sendAlert", () => {
  it("n'envoie rien si ALERT_WEBHOOK_URL n'est pas défini", async () => {
    const { sendAlert } = await loadAlerting("");
    await sendAlert({ title: "désactivé", message: "m" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("envoie un payload au format Discord vers un webhook Discord", async () => {
    const { sendAlert } = await loadAlerting(discordUrl);
    await sendAlert({ title: "Erreur 500", message: "boom", context: { method: "GET" } });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe(discordUrl);
    const body = JSON.parse(opts.body);
    expect(body.embeds).toBeDefined(); // structure spécifique Discord
    expect(body.embeds[0].title).toContain("Erreur 500");
    expect(body.embeds[0].fields).toHaveLength(1); // le contexte devient un field
  });

  it("envoie un payload au format Slack vers un webhook Slack (sans contexte)", async () => {
    const { sendAlert } = await loadAlerting(slackUrl);
    await sendAlert({ title: "Alerte Slack", message: "boom" });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.text).toContain("Alerte Slack"); // structure spécifique Slack
    expect(body.embeds).toBeUndefined();
  });

  it("ne renvoie pas deux fois la même alerte dans la fenêtre de cooldown", async () => {
    const { sendAlert } = await loadAlerting(discordUrl);
    await sendAlert({ title: "répétée", message: "1" });
    await sendAlert({ title: "répétée", message: "2" });
    expect(fetchMock).toHaveBeenCalledTimes(1); // 2e bloquée par l'anti-spam
  });

  it("ne lève pas si le webhook répond en échec (ok=false)", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500, statusText: "ERR" });
    const { sendAlert } = await loadAlerting(discordUrl);
    await expect(
      sendAlert({ title: "échec-http", message: "x" })
    ).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("ne lève jamais en cas d'erreur réseau", async () => {
    fetchMock.mockRejectedValue(new Error("réseau coupé"));
    const { sendAlert } = await loadAlerting(discordUrl);
    await expect(
      sendAlert({ title: "réseau", message: "x" })
    ).resolves.toBeUndefined();
  });
});
