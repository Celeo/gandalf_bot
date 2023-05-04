import { BotWrapper, logger, memoizy, Message, redisConnect } from "./deps.ts";
import { Config } from "./config.ts";

/**
 * Patterns to ignore, even if the text isn't a real word.
 */
const PATTERNS: Array<RegExp> = [
  /^[hue]{5,}$/i,
  /^[bha]{5,}$/i,
  /^[lo]{5,}$/i,
  /^https?:\/\//i,
  /^re{5,}/i,
  /^<:\w+:\d+>$/,
  /^<@!?\d+>$/,
  /^!/,
];

/**
 * Load the English words from Redis.
 */
export async function loadWords(): Promise<Array<string>> {
  logger.info("Loading English words from Redis into memory");
  const redis = await redisConnect({ hostname: "127.0.0.1", port: 6379 });
  const data = await redis.get("english_words");
  if (data === null) {
    throw new Error("Got a null value from Redis");
  }
  redis.close();
  return data.split(",");
}

/**
 * Memoize word load so that it only happens once.
 */
const memoziedLoadWords = memoizy(loadWords);

/**
 * Add a sneeze emoji to misspelled words from specific users.
 */
export async function handler(
  wrapper: BotWrapper,
  config: Config,
  message: Message,
  wordsFunction: () => Promise<Array<string>> = memoziedLoadWords,
): Promise<void> {
  if (!config.blessableUserIds.includes(message.authorId)) {
    return;
  }
  let content = message.content;
  if (content.includes(" ") || content.includes("\n")) {
    return;
  }
  content = content.trim().replaceAll(/[\*_~`!?\\,]/g, "");
  if (content.length < 8) {
    return;
  }
  if (PATTERNS.find((pattern) => pattern.test(content))) {
    return;
  }
  const realWords = await wordsFunction();
  if (realWords.includes(content.toLowerCase())) {
    return;
  }
  await wrapper.addReaction(message.channelId, message.id, "🤧");
}
