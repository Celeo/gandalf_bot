import { JsonBigInt } from "./deps.ts";

/**
 * Bot configuration.
 */
export interface Config {
  token: string;
  containmentRoleId: bigint;
  containmentResponseGif: string;
  blessableUserIds: Array<bigint>;
  listenableUserIds: Array<bigint>;
}

/**
 * Load the bot configuration from the configuration file,
 * which is "config.json" unless otherwise specified.
 */
export async function loadConfig(filename = "config.json"): Promise<Config> {
  const raw = await Deno.readTextFile(`./${filename}`);
  const data = JsonBigInt({ useNativeBigInt: true }).parse(raw);
  return data as Config;
}
