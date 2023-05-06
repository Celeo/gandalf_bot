import { redisConnect } from "./_deps.ts";

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

export const KEY = "gandalf-config";

/**
 * Load and return the bot's configuration.
 */
export async function loadConfig(connectFn = redisConnect): Promise<Config> {
  const redis = await connectFn();
  const raw = await redis.get(KEY);
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
  redis.close();
  return data as Config;
}
