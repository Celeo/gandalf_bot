import { BotWrapper, DiscordenoMessage } from "./deps.ts";
import { Config } from "./config.ts";

const PATTERN =
  /\#Tradle \#\d+ \d+\/\d+\n🟩🟩🟩🟩🟩\nhttps:\/\/oec.world\/en\/tradle/;

export async function handler(
  wrapper: BotWrapper,
  _config: Config,
  message: DiscordenoMessage,
): Promise<void> {
  if (message.content.match(PATTERN) !== null) {
    await wrapper.addReaction(message.channelId, message.id, "💯");
  }
}
