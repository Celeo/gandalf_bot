import {
  BotWithCache,
  createBot,
  DiscordenoMessage,
  enableCachePlugin,
  enableCacheSweepers,
  enablePermissionsPlugin,
  startBot,
} from "./deps.ts";
import { Config, loadConfig } from "./config.ts";
import { handler as blessYouHandler } from "./blessYou.ts";
import { handler as commandsHandler } from "./commands.ts";
import { handler as heyListenHandler } from "./heyListen.ts";
import { handler as quotesHandler } from "./quotes.ts";
import { reactionAdd, reactionRemove } from "./reactions.ts";

/**
 * Collection of message handlers and their "friendly" names.
 */
const HANDLERS: Array<[
  (
    bot: BotWithCache<BotWithCache>,
    config: Config,
    message: DiscordenoMessage,
  ) => Promise<void>,
  string,
]> = [
  [blessYouHandler, "blessYou"],
  [commandsHandler, "commands"],
  [heyListenHandler, "heyListen"],
  [quotesHandler, "quotes"],
];

/**
 * Event handler for new messages.
 */
async function messageHandler(
  bot: BotWithCache,
  config: Config,
  message: DiscordenoMessage,
) {
  if (message.isBot) {
    // not handling any messages from bots
    return;
  }
  for (const [handler, name] of HANDLERS) {
    try {
      await handler(bot, config, message);
    } catch (e) {
      console.log(`Error when processing message handler "${name}: ${e}`);
    }
  }
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
  const baseBot = createBot({
    token: config.token,
    intents: ["GuildMessages", "GuildMembers", "GuildMessageReactions"],
    botId: BigInt(atob(config.token.split(".")[0])),
    events: {
      ready() {
        console.log("Connected to gateway");
      },
      async messageCreate(bot, message) {
        await messageHandler(bot as BotWithCache, config, message);
      },
      async reactionAdd(bot, payload) {
        await reactionAdd(bot as BotWithCache, config, payload);
      },
      async reactionRemove(bot, payload) {
        await reactionRemove(bot as BotWithCache, config, payload);
      },
    },
  });
  const bot = enableCachePlugin(baseBot);
  enableCacheSweepers(bot);
  enablePermissionsPlugin(bot);
  await startBot(bot);
}
