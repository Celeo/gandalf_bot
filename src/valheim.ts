import { Config } from "./config.ts";

/**
 * Get the status of the configured Valheim server.
 */
export async function getServerStatus(
  config: Config,
): Promise<Record<string, unknown>> {
  const response = await fetch(
    `https://api.ggod.io/api/worlds/${config.valheim.server}`,
    {
      headers: {
        "authorization":
          `Auth-ggod token=undefined password=${config.valheim.password}`,
      },
    },
  );
  if (response.status !== 200) {
    throw Error(`Got status ${response.status}`);
  }
  return response.json();
}

/**
 * Send a command to start the configured Valheim server.
 *
 * Does not perform a check of the server status; that should
 * be done beforehand, and be aware of race conditions.
 */
export async function startServer(config: Config): Promise<void> {
  const response = await fetch(
    `https://api.ggod.io/api/worlds/${config.valheim.server}/_start`,
    {
      method: "POST",
      headers: {
        "authorization":
          `Auth-ggod token=undefined password=${config.valheim.password}`,
      },
    },
  );
  if (response.status !== 200) {
    throw Error(`Got status ${response.status}`);
  }
}

/**
 * Server status as a more usable enum.
 */
export enum ServerStatus {
  Offline,
  Online,
  Starting,
}

/**
 * Transform the server state from the site to a more usable enum.
 */
export function examineServerStatus(state: number): ServerStatus {
  if (state === 10 || state === 13) {
    return ServerStatus.Online;
  }
  if (state === 0 || state === 5) {
    return ServerStatus.Starting;
  }
  return ServerStatus.Offline;
}
