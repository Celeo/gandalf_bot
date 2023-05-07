import { logger } from "./_deps.ts";

/**
 * An entry in the "reactionRoles" list.
 */
export type ReactionRole = {
  channelId: bigint;
  messageId: bigint;
  emoji: string;
  roleName: string;
};

/**
 * An entry in the "birthdays" list.
 */
export type Birthday = {
  who: string;
  when: string;
};

/**
 * Bot configuration.
 */
export type Config = {
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
};

/**
 * Data returned from the B2 auth call.
 */
type B2AuthResponse = {
  accountId: string;
  apiUrl: string;
  authorizationToken: string;
  downloadUrl: string;
  allowed: {
    bucketId: string;
    bucketName: string;
  };
};

/**
 * Load and return the bot's configuration.
 */
export async function loadConfig(get = fetch): Promise<Config> {
  const keyId = Deno.env.get("B2_KEY_ID");
  const appKey = Deno.env.get("B2_APP_KEY");
  const encoded = btoa(`${keyId}:${appKey}`);
  const fileName = Deno.env.get("B2_FILE_NAME");

  logger.debug("Getting config from B2");
  const authResponse = await get(
    "https://api.backblazeb2.com/b2api/v2/b2_authorize_account",
    { headers: { authorization: `Basic ${encoded}` } },
  );
  if (authResponse.status !== 200) {
    throw new Error(`Got status ${authResponse.status} from B2 auth call`);
  }
  const authData: B2AuthResponse = await authResponse.json();

  const downloadResponse = await get(
    `${authData.downloadUrl}/file/${authData.allowed.bucketName}/${fileName}`,
    {
      headers: { authorization: authData.authorizationToken },
    },
  );
  if (downloadResponse.status !== 200) {
    throw new Error(
      `Got status ${downloadResponse.status} from B2 download call`,
    );
  }
  const data = await downloadResponse.json();

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
