import type { Config } from "./config.ts";
import {
  ApplicationCommandOptionTypes,
  InteractionResponseTypes,
  InteractionTypes,
} from "./deps.ts";
import type { BotWrapper, DiscordenoInteraction } from "./deps.ts";

/**
 * Register the bot's slash commands.
 */
export function registerCommands(wrapper: BotWrapper): void {
  wrapper.bot.helpers.createApplicationCommand({
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

  wrapper.bot.helpers.createApplicationCommand({
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

  wrapper.bot.helpers.createApplicationCommand({
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

  wrapper.bot.helpers.createApplicationCommand({
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
}

/**
 * Handle incoming interactions.
 */
export async function interactionCreate(
  wrapper: BotWrapper,
  config: Config,
  payload: DiscordenoInteraction,
): Promise<void> {
  if (
    payload.data === undefined ||
    payload.type !== InteractionTypes.ApplicationCommand
  ) {
    return;
  }
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
  }
}

/**
 * Check if a command sender is an admin on the server.
 *
 * If not, a response gif is sent in response to the payload.
 */
async function senderIsAdmin(
  wrapper: BotWrapper,
  payload: DiscordenoInteraction,
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
    await wrapper.bot.helpers.sendInteractionResponse(
      payload.id,
      payload.token,
      {
        type: InteractionResponseTypes.ChannelMessageWithSource,
        data: {
          content:
            "https://tenor.com/view/no-nooo-nope-eat-fingerwag-gif-14832139",
        },
      },
    );
  }
  return isAdmin;
}

export async function commandBreach(
  wrapper: BotWrapper,
  config: Config,
  payload: DiscordenoInteraction,
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
  await wrapper.bot.helpers.sendInteractionResponse(
    payload.id,
    payload.token,
    {
      type: InteractionResponseTypes.ChannelMessageWithSource,
      data: { content: config.containmentResponseGif },
    },
  );
}

export async function commandUnBreach(
  wrapper: BotWrapper,
  config: Config,
  payload: DiscordenoInteraction,
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
  await wrapper.bot.helpers.sendInteractionResponse(
    payload.id,
    payload.token,
    {
      type: InteractionResponseTypes.ChannelMessageWithSource,
      data: { content: "👍" },
    },
  );
}

export async function commandPin(
  wrapper: BotWrapper,
  _config: Config,
  payload: DiscordenoInteraction,
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
    await wrapper.bot.helpers.sendInteractionResponse(
      payload.id,
      payload.token,
      {
        type: InteractionResponseTypes.ChannelMessageWithSource,
        data: { content: "👍" },
      },
    );
  } catch {
    await wrapper.bot.helpers.sendInteractionResponse(
      payload.id,
      payload.token,
      {
        type: InteractionResponseTypes.ChannelMessageWithSource,
        data: { content: "Pin failed. Was that actually a message ID?" },
      },
    );
  }
}

export async function commandUnpin(
  wrapper: BotWrapper,
  _config: Config,
  payload: DiscordenoInteraction,
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
    await wrapper.bot.helpers.sendInteractionResponse(
      payload.id,
      payload.token,
      {
        type: InteractionResponseTypes.ChannelMessageWithSource,
        data: { content: "👍" },
      },
    );
  } catch {
    await wrapper.bot.helpers.sendInteractionResponse(
      payload.id,
      payload.token,
      {
        type: InteractionResponseTypes.ChannelMessageWithSource,
        data: { content: "Unpin failed. Was that actually a message ID?" },
      },
    );
  }
}
