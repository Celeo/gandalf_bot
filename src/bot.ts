import {
  BotWrapper,
  createBot,
  createEventHandlers,
  enableCachePlugin,
  enableCacheSweepers,
  enablePermissionsPlugin,
  GatewayIntents,
  isEqual,
  logger,
  Message,
} from "./_deps.ts";
import { Config, loadConfig } from "./config.ts";
import { interactionCreate, registerCommands } from "./commands.ts";
import { handler as blessYouHandler } from "./blessYou.ts";
import { handler as heyListenHandler } from "./heyListen.ts";
import { handler as quotesHandler } from "./quotes.ts";
import { handler as grossHandler } from "./gross.ts";
import { handler as guessingGamesHandler } from "./guessingGames.ts";
import { reactionAdd, reactionRemove } from "./reactions.ts";

const BOT_INTENTS = GatewayIntents.GuildMessages |
  GatewayIntents.MessageContent | GatewayIntents.GuildMembers |
  GatewayIntents.GuildMessageReactions | GatewayIntents.DirectMessages;

const DISCORD_BOT_TOKEN = "DISCORD_BOT_TOKEN";

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
 * Sleep for a number of milliseconds.
 */
function sleep(milliseconds: number): Promise<(() => Promise<void>)> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/**
 * Check for birthdays, posting in the configured
 * channel to wish people well.
 */
async function checkBirthday(
  wrapper: BotWrapper,
  config: Config,
  data: Record<string, Array<number>>,
): Promise<void> {
  logger.debug("Checking for birthdays");
  if (config.birthdays.length > 0) {
    const date = new Date(new Date().getTime() - (1_000 * 60 * 60 * 8));
    const dateMatch = `${date.getMonth() + 1}/${date.getDate()}`;
    for (const birthday of config.birthdays) {
      if (birthday.when === dateMatch) {
        if (
          birthday.who in data &&
          data[birthday.who].includes(date.getFullYear())
        ) {
          continue;
        }
        try {
          await wrapper.sendMessage(config.birthdayChannel, {
            content: `Happy birthday to <@!${birthday.who}>!`,
          });
          if (birthday.who in data) {
            data[birthday.who].push(date.getFullYear());
          } else {
            data[birthday.who] = [date.getFullYear()];
          }
        } catch (err) {
          logger.error(
            `Error in sending birthday message: ${
              JSON.stringify(birthday)
            }: ${err}`,
          );
        }
      }
    }
  }
}

/**
 * Remind people in the configured channel of the month's
 * progress and their time to read the monthly book.
 */
async function checkBookReminder(
  wrapper: BotWrapper,
  config: Config,
  data: Array<number>,
): Promise<void> {
  logger.debug("Checking for book reminders");
  if (config.bookChannel && config.bookReminders.length > 0) {
    const date = new Date(new Date().getTime() - (1_000 * 60 * 60 * 8));
    const day = date.getDate();
    if (config.bookReminders.includes(day)) {
      if (data.includes(day)) {
        return;
      }
      const index = config.bookReminders.indexOf(day);
      let content;
      switch (index) {
        case 0: {
          content = "First book reminder! 25% of the way through the month.";
          break;
        }
        case 1: {
          content = "Second book reminder! Halfway through the month.";
          break;
        }
        case 2: {
          content = "Third book reminder! 75% through the month!";
          break;
        }
        case 3: {
          content = "Last book reminder! Finish by tomorrow!";
          break;
        }
      }
      await wrapper.sendMessage(config.bookChannel, { content });
      data.push(day);
    }
  }
}

/**
 * Entry point.
 */
export async function main(): Promise<void> {
  /* initial setup */

  const token = Deno.env.get(DISCORD_BOT_TOKEN);
  if (token === undefined || token.length === 0) {
    logger.error("No token supplied");
    return;
  }
  const birthdayData: Record<string, Array<number>> = {};
  const bookReminderData: Array<number> = [];
  let config = await loadConfig();

  /* bot creation and plugin enablement */

  const baseBot = createBot({
    token: token,
    intents: BOT_INTENTS,
    botId: BigInt(atob(token.split(".")[0])),
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
      try {
        reactionAdd(wrapper, config, payload);
      } catch (e) {
        logger.error(`Error when handling reaction addition: ${e}`);
      }
    },
    reactionRemove(_bot, payload) {
      try {
        reactionRemove(wrapper, config, payload);
      } catch (e) {
        logger.error(`Error when handling reaction removal: ${e}`);
      }
    },
    interactionCreate(_bot, payload) {
      try {
        interactionCreate(wrapper, config, payload);
      } catch (e) {
        logger.error(`Error when handling interaction creation: ${e}`);
      }
    },
  });

  /* background functions */

  (async () => {
    await sleep(1_000 * 30);
    while (true) {
      try {
        const maybeNewConfig = await loadConfig();
        if (!isEqual(maybeNewConfig, config)) {
          logger.info("Found config file edit; reloading");
          config = await loadConfig();
          for (const prop of Object.getOwnPropertyNames(birthdayData)) {
            delete birthdayData[prop];
          }
          bookReminderData.splice(0, bookReminderData.length);
        }
      } catch (err) {
        logger.error(`Error in background task loadConfig: ${err}`);
      }
      await sleep(1_000 * 60 * 30); // 30 minutes
    }
  })();

  (async () => {
    await sleep(1_000 * 30);
    while (true) {
      try {
        await checkBirthday(wrapper, config, birthdayData);
      } catch (err) {
        logger.error(`Error in background task checkBirthday: ${err}`);
      }
      await sleep(1_000 * 60 * 60 * 6); // 6 hours
    }
  })();

  (async () => {
    await sleep(1_000 * 30);
    while (true) {
      try {
        await checkBookReminder(wrapper, config, bookReminderData);
      } catch (err) {
        logger.error(`Error in background task checkBookReminder: ${err}`);
      }
      await sleep(1_000 * 60 * 60 * 12); // 12 hours
    }
  })();

  /* start and block */

  await wrapper.startBot();
}
