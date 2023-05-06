import { Config } from "./config.ts";
import {
  ApplicationCommandOptionTypes,
  InteractionResponseTypes,
  InteractionTypes,
} from "./_deps.ts";
import { BotWrapper, Interaction } from "./_deps.ts";

const HELP_CONTEXT = `**Available commands**:

- /pin - Pin a message to a channel
- /unpin - Unpin a pinned message from a channel
- /breach - Throw someone to the shadow realm
- /unbreach - Save someone from the shadow realm

When using (un)pin, you need the ID of the message. Enable developer \
mode in Settings -> Advanced, and then right click a message -> Copy ID \
to get the ID. Paste that into the command argument.

Anyone can pin and unpin messages via those commands. These are available \
as commands instead of default Discord permissions since Discord permissions \
are bad.

Breaching is only available to server admins.`;

/**
 * Register the bot's slash commands.
 */
export function registerCommands(wrapper: BotWrapper): void {
  wrapper.bot.helpers.createGlobalApplicationCommand({
    name: "pin",
    description: "Pin a message to a channel",
    options: [
      {
        type: ApplicationCommandOptionTypes.String,
        name: "messageid",
        description: "ID of the message to pin",
        required: true,
      },
    ],
  });

  wrapper.bot.helpers.createGlobalApplicationCommand({
    name: "unpin",
    description: "Unpin a message from a channel",
    options: [
      {
        type: ApplicationCommandOptionTypes.String,
        name: "messageid",
        description: "ID of the message to unpin",
        required: true,
      },
    ],
  });

  wrapper.bot.helpers.createGlobalApplicationCommand({
    name: "breach",
    description: "Throw someone to the shadow realm",
    options: [
      {
        type: ApplicationCommandOptionTypes.User,
        name: "user",
        description: "User to target",
        required: true,
      },
    ],
  });
  wrapper.bot.helpers.createGlobalApplicationCommand({
    name: "unbreach",
    description: "Save someone from the shadow realm",
    options: [
      {
        type: ApplicationCommandOptionTypes.User,
        name: "user",
        description: "User to target",
        required: true,
      },
    ],
  });

  wrapper.bot.helpers.createGlobalApplicationCommand({
    name: "bookreminder",
    description: "Add reading reminders",
    options: [
      {
        type: ApplicationCommandOptionTypes.Number,
        name: "quarter",
        description: "A quarter of the way through the month",
        required: true,
      },
      {
        type: ApplicationCommandOptionTypes.Number,
        name: "half",
        description: "Halfway of the way through the month",
        required: true,
      },
      {
        type: ApplicationCommandOptionTypes.Number,
        name: "three-quarters",
        description: "Three quarters of the way through the month",
        required: true,
      },
      {
        type: ApplicationCommandOptionTypes.Number,
        name: "day-before",
        description: "Day before book club",
        required: true,
      },
    ],
  });

  wrapper.bot.helpers.createGlobalApplicationCommand({
    name: "help",
    description: "Show available commands",
  });
}

/**
 * Handle incoming interactions.
 */
export async function interactionCreate(
  wrapper: BotWrapper,
  config: Config,
  payload: Interaction,
): Promise<void> {
  if (payload.data === undefined) {
    return;
  }
  if (payload.type === InteractionTypes.ApplicationCommand) {
    switch (payload.data.name) {
      case "pin": {
        await commandPin(wrapper, config, payload);
        break;
      }
      case "unpin": {
        await commandUnpin(wrapper, config, payload);
        break;
      }
      case "breach": {
        await commandBreach(wrapper, config, payload);
        break;
      }
      case "unbreach": {
        await commandUnBreach(wrapper, config, payload);
        break;
      }
      case "help": {
        await commandHelp(wrapper, config, payload);
        break;
      }
    }
  }
}

/**
 * Check if a command sender is an admin on the server.
 *
 * If not, a response gif is sent in response to the payload.
 */
async function senderIsAdmin(
  wrapper: BotWrapper,
  payload: Interaction,
): Promise<boolean> {
  if (payload.member === undefined || payload.guildId === undefined) {
    return false;
  }
  const isAdmin = wrapper.hasGuildPermissions(
    payload.guildId,
    payload.member,
    ["ADMINISTRATOR"],
  );
  if (!isAdmin) {
    await interactionResponse(
      wrapper,
      payload,
      "https://tenor.com/view/no-nooo-nope-eat-fingerwag-gif-14832139",
    );
  }
  return isAdmin;
}

function interactionResponse(
  wrapper: BotWrapper,
  payload: Interaction,
  content: string,
): Promise<void> {
  return wrapper.bot.helpers.sendInteractionResponse(
    payload.id,
    payload.token,
    {
      type: InteractionResponseTypes.ChannelMessageWithSource,
      data: { content },
    },
  );
}

export async function commandBreach(
  wrapper: BotWrapper,
  config: Config,
  payload: Interaction,
): Promise<void> {
  if (
    payload.guildId === undefined ||
    payload.data === undefined ||
    payload.data.options === undefined ||
    payload.data.options.length === 0 ||
    !await senderIsAdmin(wrapper, payload)
  ) {
    return;
  }
  await wrapper.addRole(
    payload.guildId,
    BigInt(payload.data.options[0].value as string),
    config.containmentRoleId,
  );
  await interactionResponse(wrapper, payload, config.containmentResponseGif);
}

export async function commandUnBreach(
  wrapper: BotWrapper,
  config: Config,
  payload: Interaction,
): Promise<void> {
  if (
    payload.guildId === undefined ||
    payload.data === undefined ||
    payload.data.options === undefined ||
    payload.data.options.length === 0 ||
    !await senderIsAdmin(wrapper, payload)
  ) {
    return;
  }
  await wrapper.removeRole(
    payload.guildId,
    BigInt(payload.data.options[0].value as string),
    config.containmentRoleId,
  );
  await interactionResponse(wrapper, payload, "👍");
}

export async function commandPin(
  wrapper: BotWrapper,
  _config: Config,
  payload: Interaction,
): Promise<void> {
  if (
    payload.channelId === undefined || payload.data === undefined ||
    payload.data.options === undefined || payload.data.options.length === 0
  ) {
    return;
  }
  try {
    await wrapper.pinMessage(
      payload.channelId,
      BigInt(payload.data.options[0].value as string),
    );
    await interactionResponse(wrapper, payload, "👍");
  } catch {
    await interactionResponse(
      wrapper,
      payload,
      "Pin failed. Was that actually a message ID?",
    );
  }
}

export async function commandUnpin(
  wrapper: BotWrapper,
  _config: Config,
  payload: Interaction,
): Promise<void> {
  if (
    payload.channelId === undefined || payload.data === undefined ||
    payload.data.options === undefined || payload.data.options.length === 0
  ) {
    return;
  }

  try {
    await wrapper.unpinMessage(
      payload.channelId,
      BigInt(payload.data.options[0].value as string),
    );
    await interactionResponse(wrapper, payload, "👍");
  } catch {
    await interactionResponse(
      wrapper,
      payload,
      "Unpin failed. Was that actually a message ID?",
    );
  }
}

export async function commandHelp(
  wrapper: BotWrapper,
  _config: Config,
  payload: Interaction,
): Promise<void> {
  await interactionResponse(wrapper, payload, HELP_CONTEXT);
}
