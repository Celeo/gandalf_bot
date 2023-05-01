import { BotWrapper, Message } from "./deps.ts";
import { Config } from "./config.ts";

const PATTERNS = [
  /Framed #\d+\n🎥 🟩 ⬛ ⬛ ⬛ ⬛ ⬛\n\nhttps:\/\/framed.wtf/,
  /#Tradle #\d+ \d+\/\d+\n🟩🟩🟩🟩🟩\nhttps:\/\/oec.world\/en\/tradle/,
  /#Heardle #\d+\n\n🔊🟩⬜⬜⬜⬜⬜\n\nhttps:\/\/spotify\.com\/heardle/,
  /#Tradle \(🇺🇸 Edition\) #\d+ 1\/6\n🟩🟩🟩🟩🟩\nhttps:\/\/oec.world\/en\/tradle/,
  /#GuessTheGame #\d+\n\n🎮 🟩 ⬜ ⬜ ⬜ ⬜ ⬜\n\nhttps:\/\/guessthe.game\//,
];

export async function handler(
  wrapper: BotWrapper,
  _config: Config,
  message: Message,
): Promise<void> {
  for (const pattern of PATTERNS) {
    if (message.content.match(pattern) !== null) {
      await wrapper.addReaction(message.channelId, message.id, "💯");
      break;
    }
  }
}
