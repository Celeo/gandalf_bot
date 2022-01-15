import { Bot, createBot, DiscordenoMessage, startBot } from "./deps.ts";
import { Config, loadConfig } from "./config.ts";
import { handler as blessYouHandler } from "./blessYou.ts";
import { handler as commandsHandler } from "./commands.ts";
import { handler as heyListenHandler } from "./heyListen.ts";
import { handler as quotesHandler } from "./quotes.ts";
import { reactionAdd, reactionRemove } from "./reactions.ts";

/**
 * Event handler for new messages.
 */
async function messageHandler(
  bot: Bot,
  config: Config,
  message: DiscordenoMessage,
) {
  if (message.isBot) {
    // not handling any messages from bots
    return;
  }
  await blessYouHandler(bot, config, message);
  await commandsHandler(bot, config, message);
  await heyListenHandler(bot, config, message);
  await quotesHandler(bot, config, message);
}

/**
 * Entry point.
 */
export async function main() {
  const config = await loadConfig();
  if (config.token.length === 0) {
    console.error("No token supplied");
    return;
  }
  const bot = createBot({
    token: config.token,
    intents: ["GuildMessages", "GuildMembers", "GuildMessageReactions"],
    botId: BigInt(atob(config.token.split(".")[0])),
    events: {
      ready() {
        console.log("Connected to gateway");
      },
      async messageCreate(bot, message) {
        await messageHandler(bot, config, message);
      },
      async reactionAdd(bot, payload) {
        await reactionAdd(bot, config, payload);
      },
      async reactionRemove(bot, payload) {
        await reactionRemove(bot, config, payload);
      },
    },
  });
  await startBot(bot);
}
