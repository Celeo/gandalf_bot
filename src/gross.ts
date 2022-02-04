import { BotWrapper, DiscordenoMessage } from "./deps.ts";
import { Config } from "./config.ts";

const PATTERNS = [
  /lungs? (?:soup|broth|wet|juice|sponge|slime|sweat|water|liquid)/i,
  /swamp lung/i,
  /lubricate/i,
];

/**
 * Add a reaction to nasty messages.
 */
export async function handler(
  wrapper: BotWrapper,
  config: Config,
  message: DiscordenoMessage,
): Promise<void> {
  if (!config.grossUserIds.includes(message.authorId)) {
    return;
  }
  for (const pattern of PATTERNS) {
    if (pattern.test(message.content)) {
      await wrapper.addReaction(message.channelId, message.id, "🤮");
      return;
    }
  }
}
