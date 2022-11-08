import { BotWrapper, memoizy, Message } from "./deps.ts";
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
 * Load the words.txt file into memory.
 */
function loadWords(): Array<string> {
  console.log("Loading words.txt into memory");
  const decoder = new TextDecoder("utf-8");
  const raw = Deno.readFileSync("./words.txt");
  const text = decoder.decode(raw);
  return text.split("\n");
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
  const realWords = memoziedLoadWords();
  if (realWords.includes(content.toLowerCase())) {
    return;
  }
  await wrapper.addReaction(message.channelId, message.id, "🤧");
}
