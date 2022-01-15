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
  const data = JSON.parse(await Deno.readTextFile("./config.json"));
  data.containmentRoleId = BigInt(data.containmentRoleId);
  data.blessableUserIds = data.blessableUserIds.map((n: number) => BigInt(n));
  data.listenableUserIds = data.listenableUserIds.map((n: number) => BigInt(n));
  return data as Config;
}
