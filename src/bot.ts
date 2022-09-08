import {
  BotWrapper,
  createBot,
  createEventHandlers,
  DiscordenoMessage,
  enableCachePlugin,
  enableCacheSweepers,
  enablePermissionsPlugin,
} from "./deps.ts";
import { Config, loadConfig } from "./config.ts";
import { interactionCreate, registerCommands } from "./commands.ts";
import { handler as blessYouHandler } from "./blessYou.ts";
import { handler as heyListenHandler } from "./heyListen.ts";
import { handler as quotesHandler } from "./quotes.ts";
import { handler as grossHandler } from "./gross.ts";
import { handler as framedHandler } from "./framed.ts";
import { reactionAdd, reactionRemove } from "./reactions.ts";

/**
 * Collection of message handlers and their "friendly" names.
 */
const HANDLERS: Array<[
  (
    wrapper: BotWrapper,
    config: Config,
    message: DiscordenoMessage,
  ) => Promise<void>,
  string,
]> = [
  [blessYouHandler, "blessYou"],
  [heyListenHandler, "heyListen"],
  [quotesHandler, "quotes"],
  [grossHandler, "gross"],
  [framedHandler, "framed"],
];

/**
 * Event handler for new messages.
 */
async function messageHandler(
  wrapper: BotWrapper,
  config: Config,
  message: DiscordenoMessage,
): Promise<void> {
  if (message.isBot) {
    return;
  }
  for (const [handler, name] of HANDLERS) {
    try {
      await handler(wrapper, config, message);
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
    { type: "module" },
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
    intents: [
      "GuildMessages",
      "GuildMembers",
      "GuildMessageReactions",
      "DirectMessages",
    ],
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
      console.log("Connected to gateway");
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
    console.log(
      "Received message from birthdays worker in main thread:",
      e.data,
    );
    await wrapper.sendMessage(config.birthdayChannel, {
      content: `Happy birthday to <@!${e.data}>!`,
    });
  };

  // start and block
  await wrapper.startBot();
}
