import { Bot, DiscordenoMessage, sendMessage } from "./deps.ts";

/**
 * Send a reply to a message.
 *
 * Calls `sendMessage` from Discordeno and includes the
 * required information from the message to make the
 * new message a response.
 */
export async function replyTo(
  bot: Bot,
  message: DiscordenoMessage,
  content: string,
): Promise<void> {
  await sendMessage(bot, message.channelId, {
    content,
    messageReference: {
      messageId: message.id,
      channelId: message.channelId,
      failIfNotExists: false,
    },
  });
}
