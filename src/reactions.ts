import { Bot, DiscordenoEmoji, DiscordenoMember } from "./deps.ts";
import { Config } from "./config.ts";

interface ReactionAddPayload {
  userId: bigint;
  channelId: bigint;
  messageId: bigint;
  guildId?: bigint;
  member?: DiscordenoMember;
  emoji: DiscordenoEmoji;
}

interface ReactionRemovePayload {
  userId: bigint;
  channelId: bigint;
  messageId: bigint;
  guildId?: bigint;
  emoji: DiscordenoEmoji;
}

export async function reactionAdd(
  _bot: Bot,
  _config: Config,
  _payload: ReactionAddPayload,
) {
  // TODO
}

export async function reactionRemove(
  _bot: Bot,
  _config: Config,
  _payload: ReactionRemovePayload,
) {
  // TODO
}
