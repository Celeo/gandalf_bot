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
 * Load the bot configuration from the "./config.json" file.
 */
export async function loadConfig(): Promise<Config> {
  const raw = await Deno.readTextFile("./config.json");
  const data = JsonBigInt({ useNativeBigInt: true }).parse(raw);
  return data as Config;
}
