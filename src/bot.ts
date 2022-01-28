import {
  BotWithCache,
  createBot,
  DiscordenoMessage,
  enableCachePlugin,
  enableCacheSweepers,
  enablePermissionsPlugin,
  sendMessage,
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
): Promise<void> {
  if (message.isBot) {
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
export async function main(): Promise<void> {
  /* config first load */

  let config = await loadConfig();
  if (config.token.length === 0) {
    console.error("No token supplied");
    return;
  }

  /* workers */

  const configWorker = new Worker(
    new URL("./configWorker.ts", import.meta.url).href,
    { type: "module", deno: true },
  );
  const birthdayWorker = new Worker(
    new URL("./birthdaysWorker.ts", import.meta.url).href,
    { type: "module" },
  );
  birthdayWorker.postMessage(config);
  configWorker.onmessage = (e: MessageEvent<Config>) => {
    console.log("Received message from configWorker in main thread");
    config = e.data;
    birthdayWorker.postMessage(config);
  };

  /* bot creation and plugin enablement */

  const baseBot = createBot({
    token: config.token,
    intents: ["GuildMessages", "GuildMembers", "GuildMessageReactions"],
    botId: BigInt(atob(config.token.split(".")[0])),
    events: {
      ready() {
        console.log("Connected to gateway");
      },
      messageCreate(bot, message) {
        messageHandler(bot as BotWithCache, config, message);
      },
      reactionAdd(bot, payload) {
        reactionAdd(bot as BotWithCache, config, payload);
      },
      reactionRemove(bot, payload) {
        reactionRemove(bot as BotWithCache, config, payload);
      },
    },
  });
  const bot = enableCachePlugin(baseBot);
  enableCacheSweepers(bot);
  enablePermissionsPlugin(bot);

  // hook up received birthdaysWorker messages
  birthdayWorker.onmessage = async (e: MessageEvent<string>) => {
    console.log(
      "Received message from birthdays worker in main thread:",
      e.data,
    );
    await sendMessage(bot, config.birthdayChannel, {
      content: `Happy birthday to <@!${e.data}>!`,
    });
  };

  // start and block
  await startBot(bot);
}
