/**
 * An entry in the "reactionRoles" list.
 */
export interface ReactionRole {
  channelId: bigint;
  messageId: bigint;
  emoji: string;
  roleName: string;
}

/**
 * Bot configuration.
 */
export interface Config {
  token: string;
  containmentRoleId: bigint;
  containmentResponseGif: string;
  blessableUserIds: Array<bigint>;
  listenableUserIds: Array<bigint>;
  reactionRoles: Array<ReactionRole>;
}

/**
 * Load the bot configuration from the configuration file,
 * which is "config.json" unless otherwise specified.
 */
export async function loadConfig(filename = "config.json"): Promise<Config> {
  const raw = await Deno.readTextFile(`./${filename}`);
  const data = JSON.parse(raw);
  data.containmentRoleId = BigInt(data.containmentRoleId);
  data.blessableUserIds = data.blessableUserIds.map((s: string) => BigInt(s));
  data.listenableUserIds = data.listenableUserIds.map((s: string) => BigInt(s));
  data.reactionRoles = data.reactionRoles.map(
    (entry: Record<string, string>) => {
      return {
        ...entry,
        channelId: BigInt(entry.channelId),
        messageId: BigInt(entry.messageId),
      };
    },
  );
  return data as Config;
}
