import { BotWrapper, DiscordenoMessage } from "./deps.ts";
import { Config } from "./config.ts";

const PATTERN = /^listen[! ]*$/i;

/**
 * Add an ear emoji to messages from specific users that type "listen!".
 */
export async function handler(
  wrapper: BotWrapper,
  config: Config,
  message: DiscordenoMessage,
): Promise<void> {
  if (!config.listenableUserIds.includes(message.authorId)) {
    return;
  }
  const content = message.content.trim().replaceAll(/[\*_~`?\\,]/g, "");
  if (content.match(PATTERN)) {
    await wrapper.addReaction(message.channelId, message.id, "👂");
  }
}
