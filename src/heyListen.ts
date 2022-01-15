import { addReaction, Bot, DiscordenoMessage } from "./deps.ts";
import { Config } from "./config.ts";

const PATTERN = /^listen[! ]*$/i;

/**
 * Add an ear emoji to messages from specific users that type "listen!".
 */
export async function handler(
  bot: Bot,
  config: Config,
  message: DiscordenoMessage,
): Promise<void> {
  if (!config.listenableUserIds.includes(message.authorId)) {
    return;
  }
  const content = message.content.trim().replaceAll(/[\*_~`?\\,]/g, "");
  if (content.match(PATTERN)) {
    await addReaction(bot, message.channelId, message.id, "👂");
  }
}
