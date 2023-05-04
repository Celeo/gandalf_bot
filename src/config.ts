import { redisConnect } from "./deps.ts";

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
 * An entry in the "birthdays" list.
 */
export interface Birthday {
  who: string;
  when: string;
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
  grossUserIds: Array<bigint>;
  reactionRoles: Array<ReactionRole>;
  birthdayChannel: bigint;
  birthdays: Array<Birthday>;
  bookChannel: bigint;
  bookReminders: Array<number>;
}

export const REDIS_KEY = "gandalf-config";

/**
 * Load the bot configuration from the configuration file,
 * which is "config.json" unless otherwise specified.
 */
export async function loadConfig(connectFn = redisConnect): Promise<Config> {
  const redis = await connectFn({ hostname: "127.0.0.1" });
  const raw = await redis.get(REDIS_KEY);
  if (raw === null) {
    throw new Error("Got empty config from Redis");
  }
  const data = JSON.parse(raw);
  data.containmentRoleId = BigInt(data.containmentRoleId);
  data.blessableUserIds = data.blessableUserIds.map((s: string) => BigInt(s));
  data.listenableUserIds = data.listenableUserIds.map((s: string) => BigInt(s));
  data.grossUserIds = data.grossUserIds.map((s: string) => BigInt(s));
  data.reactionRoles = data.reactionRoles.map(
    (entry: Record<string, string>) => {
      return {
        ...entry,
        channelId: BigInt(entry.channelId),
        messageId: BigInt(entry.messageId),
      };
    },
  );
  data.birthdayChannel = BigInt(data.birthdayChannel);
  data.bookChannel = BigInt(data.bookChannel);
  return data as Config;
}
