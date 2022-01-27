import {
  addRole,
  BotWithCache,
  DiscordenoEmoji,
  DiscordenoMember,
  getDmChannel,
  getMember,
  removeRole,
  sendMessage,
} from "./deps.ts";
import { Config } from "./config.ts";

/**
 * Event payload for a reaction being added.
 */
interface ReactionAddPayload {
  userId: bigint;
  channelId: bigint;
  messageId: bigint;
  guildId?: bigint;
  member?: DiscordenoMember;
  emoji: DiscordenoEmoji;
}

/**
 * Event payload for a reaction being removed.
 */
interface ReactionRemovePayload {
  userId: bigint;
  channelId: bigint;
  messageId: bigint;
  guildId?: bigint;
  emoji: DiscordenoEmoji;
}

/**
 * Internal handler of the reactions.
 *
 * Takes information about the reaction and the message
 * it is/was attached to, and processes the information
 * into the functionality of granting roles based on
 * those reactions.
 */
async function handleReaction(
  bot: BotWithCache,
  config: Config,
  guildId: bigint,
  memberId: bigint,
  userId: bigint,
  channelId: bigint,
  messageId: bigint,
  emojiName: string,
  add: boolean,
) {
  let anyPartialMatch = false;
  for (const entry of config.reactionRoles) {
    if (
      entry.channelId !== channelId ||
      entry.messageId !== messageId
    ) {
      continue;
    }
    anyPartialMatch = true;
    if (entry.emoji !== emojiName) {
      continue;
    }
    const allGuilds = bot.guilds;
    const matchingGuild = allGuilds.find((guild) => guild.id === guildId);
    if (!matchingGuild) {
      return;
    }
    const role = matchingGuild.roles.find((role) =>
      role.name === entry.roleName
    );
    if (!role) {
      return;
    }
    const dmChannel = await getDmChannel(bot, userId);
    if (add) {
      await addRole(
        bot,
        guildId,
        memberId,
        role.id,
      );
      await sendMessage(bot, dmChannel.id, {
        content: `Added the "${role.name}" role to you`,
      });
      return;
    } else {
      await removeRole(
        bot,
        guildId,
        memberId,
        role.id,
      );
      await sendMessage(bot, dmChannel.id, {
        content: `Removed the "${role.name}" role from you`,
      });
      return;
    }
  }
  if (anyPartialMatch) {
    console.log(
      "Matching channel & message, but no matching reaction emoji for:",
      emojiName,
    );
  }
}

/**
 * Handler for reactions being added to messages.
 */
export async function reactionAdd(
  bot: BotWithCache,
  config: Config,
  payload: ReactionAddPayload,
) {
  if (payload.guildId === undefined || payload.member === undefined) {
    return;
  }
  await handleReaction(
    bot,
    config,
    payload.guildId,
    payload.member.id,
    payload.userId,
    payload.channelId,
    payload.messageId,
    payload.emoji.name as string,
    true,
  );
}

/**
 * Handler for reactions being removed from messages.
 */
export async function reactionRemove(
  bot: BotWithCache,
  config: Config,
  payload: ReactionRemovePayload,
) {
  if (payload.guildId === undefined) {
    return;
  }
  const member = await getMember(bot, payload.guildId, payload.userId);
  await handleReaction(
    bot,
    config,
    payload.guildId,
    member.id,
    payload.userId,
    payload.channelId,
    payload.messageId,
    payload.emoji.name as string,
    false,
  );
}
