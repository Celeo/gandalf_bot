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
  minecraftChannel: bigint;
  minecraftMessage: bigint | null;
  minecraftServer: string;
  valheim: {
    server: number;
    password: string;
  };
}

const CONFIG_FILE_NAME = "config.json";

/**
 * Load the bot configuration from the configuration file,
 * which is "config.json" unless otherwise specified.
 */
export async function loadConfig(filename = CONFIG_FILE_NAME): Promise<Config> {
  const raw = await Deno.readTextFile(`./${filename}`);
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
  data.minecraftChannel = BigInt(data.minecraftChannel);
  if (data.minecraftMessage !== null) {
    data.minecraftMessage = BigInt(data.minecraftMessage);
  }
  return data as Config;
}

/**
 * Save the config file in memory to disk.
 *
 * A backup is saved at "config.json.bak".
 */
export async function saveConfig(
  config: Config,
  filename = CONFIG_FILE_NAME,
): Promise<void> {
  await Deno.copyFile(filename, `${filename}.bak`);
  await Deno.writeTextFile(
    filename,
    JSON.stringify(
      config,
      (_, v) => typeof v === "bigint" ? v.toString() : v,
      2,
    ),
  );
}
