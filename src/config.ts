/**
 * Bot configuration.
 */
export interface Config {
  token: string;
  containmentRoleId: number;
  containmentResponseGif: string;
  blessableUserIds: Array<BigInt>;
  listenableUserIds: Array<BigInt>;
}

/**
 * Load the bot configuration from the "./config.json" file.
 */
export async function loadConfig(): Promise<Config> {
  const data = JSON.parse(await Deno.readTextFile("./config.json"));
  data.blessableUserIds = data.blessableUserIds.map((n: number) => BigInt(n));
  data.listenableUserIds = data.listenableUserIds.map((n: number) => BigInt(n));
  return data as Config;
}
