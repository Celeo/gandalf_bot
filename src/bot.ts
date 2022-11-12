import {
  BotWrapper,
  createBot,
  createEventHandlers,
  enableCachePlugin,
  enableCacheSweepers,
  enablePermissionsPlugin,
  GatewayIntents,
  logger,
  Message,
} from "./deps.ts";
import { Config, loadConfig } from "./config.ts";
import { interactionCreate, registerCommands } from "./commands.ts";
import { handler as blessYouHandler } from "./blessYou.ts";
import { handler as heyListenHandler } from "./heyListen.ts";
import { handler as quotesHandler } from "./quotes.ts";
import { handler as grossHandler } from "./gross.ts";
import { handler as guessingGamesHandler } from "./guessingGames.ts";
import { reactionAdd, reactionRemove } from "./reactions.ts";

/**
 * Collection of message handlers and their "friendly" names.
 */
const HANDLERS: Array<[
  (
    wrapper: BotWrapper,
    config: Config,
    message: Message,
  ) => Promise<void>,
  string,
]> = [
  [blessYouHandler, "blessYou"],
  [heyListenHandler, "heyListen"],
  [quotesHandler, "quotes"],
  [grossHandler, "gross"],
  [guessingGamesHandler, "guessingGames"],
];

/**
 * Event handler for new messages.
 */
async function messageHandler(
  wrapper: BotWrapper,
  config: Config,
  message: Message,
): Promise<void> {
  if (message.isFromBot) {
    return;
  }
  for (const [handler, name] of HANDLERS) {
    try {
      await handler(wrapper, config, message);
    } catch (e) {
      logger.error(`Error when processing message handler "${name}: ${e}`);
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
    logger.error("No token supplied");
    return;
  }

  /* workers */

  const configWorker = new Worker(
    new URL("./configWorker.ts", import.meta.url).href,
    { type: "module" },
  );
  const birthdayWorker = new Worker(
    new URL("./birthdaysWorker.ts", import.meta.url).href,
    { type: "module" },
  );
  birthdayWorker.postMessage(config);
  const minecraftWorker = new Worker(
    new URL("./minecraftOnlineWorker.ts", import.meta.url).href,
    { type: "module" },
  );
  minecraftWorker.postMessage(config);
  configWorker.onmessage = (e: MessageEvent<Config>) => {
    logger.debug("Received message from configWorker in main thread");
    config = e.data;
    birthdayWorker.postMessage(config);
    minecraftWorker.postMessage(config);
  };

  /* bot creation and plugin enablement */

  const baseBot = createBot({
    token: config.token,
    intents: GatewayIntents.GuildMessages |
      GatewayIntents.MessageContent |
      GatewayIntents.GuildMembers |
      GatewayIntents.GuildMessageReactions |
      GatewayIntents.DirectMessages,
    botId: BigInt(atob(config.token.split(".")[0])),
    events: {},
  });
  const bot = enableCachePlugin(baseBot);
  enableCacheSweepers(bot);
  enablePermissionsPlugin(bot);

  const wrapper = new BotWrapper(bot);
  registerCommands(wrapper);
  wrapper.bot.events = createEventHandlers({
    ready() {
      logger.info("Connected to gateway");
    },
    messageCreate(_bot, message) {
      messageHandler(wrapper, config, message);
    },
    reactionAdd(_bot, payload) {
      reactionAdd(wrapper, config, payload);
    },
    reactionRemove(_bot, payload) {
      reactionRemove(wrapper, config, payload);
    },
    interactionCreate(_bot, payload) {
      interactionCreate(wrapper, config, payload);
    },
  });

  // hook up received birthdaysWorker messages
  birthdayWorker.onmessage = async (e: MessageEvent<string>) => {
    try {
      logger.debug("Sending happy birthday message");
      await wrapper.sendMessage(config.birthdayChannel, {
        content: `Happy birthday to <@!${e.data}>!`,
      });
    } catch (err) {
      logger.error("Could not send birthday announcement:", err);
    }
  };
  minecraftWorker.onmessage = async (e: MessageEvent<number>) => {
    try {
      logger.debug(`Updating channel topic with player count ${e.data}`);
      await wrapper.editChannel(config.minecraftChannel, {
        topic: `Online players: ${e.data}`,
      });
    } catch (err) {
      logger.error("Could not update Minecraft channel topic:", err);
    }
  };

  // start and block
  await wrapper.startBot();
}
