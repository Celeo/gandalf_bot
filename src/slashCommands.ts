import {
  ApplicationCommandOptionTypes,
  ApplicationCommandTypes,
  BotWithCache,
  BotWrapper,
  createApplicationCommand,
  DiscordenoInteraction,
  InteractionResponseTypes,
} from "./deps.ts";
import { Config } from "./config.ts";

const TEST_SERVER_ID = 758513911833427968n;

export async function registerCommands(bot: BotWithCache): Promise<void> {
  await createApplicationCommand(bot, {
    name: "pin",
    description: "Pin or unpin a message",
    type: ApplicationCommandTypes.ChatInput,
    options: [
      {
        name: "channel-id",
        description: "Channel ID (right click -> ID)",
        type: ApplicationCommandOptionTypes.String,
        required: true,
      },
      {
        name: "message-id",
        description: "Message ID (right click -> ID)",
        type: ApplicationCommandOptionTypes.String,
        required: true,
      },
    ],
  }, TEST_SERVER_ID);

  await createApplicationCommand(bot, {
    name: "breach",
    description: "Banish or rescue",
    type: ApplicationCommandTypes.ChatInput,
    options: [
      {
        name: "user",
        description: "The target",
        type: ApplicationCommandOptionTypes.User,
        required: true,
      },
    ],
  }, TEST_SERVER_ID);
}

/**
 * Handler for interaction events.
 */
export async function interactionCreate(
  wrapper: BotWrapper,
  config: Config,
  payload: DiscordenoInteraction,
): Promise<void> {
  if (payload.data?.name === undefined) {
    return;
  }
  try {
    switch (payload.data.name) {
      case "pin": {
        await commandPin(wrapper, config, payload);
        break;
      }
      case "breach": {
        await commandBreach(wrapper, config, payload);
        break;
      }
    }
  } catch (err) {
    console.error(`Error processing command: ${err}`);
    await wrapper.sendInteractionResponse(payload.id, payload.token, {
      type: InteractionResponseTypes.ChannelMessageWithSource,
      data: { content: "Error processing command" },
    });
  }
}

async function commandPin(
  wrapper: BotWrapper,
  _config: Config,
  payload: DiscordenoInteraction,
) {
  if (payload.data?.options === undefined || payload.channelId === undefined) {
    return;
  }
  const channelId = BigInt(payload.data.options[0].value as string);
  const messageId = BigInt(payload.data.options[1].value as string);
  const pins = await wrapper.getPins(channelId);
  const isPinned =
    pins.find((message) => message.id === messageId) !== undefined;

  if (isPinned) {
    await wrapper.unpinMessage(channelId, messageId);
  } else {
    await wrapper.pinMessage(channelId, messageId);
  }

  await wrapper.sendInteractionResponse(payload.id, payload.token, {
    type: InteractionResponseTypes.ChannelMessageWithSource,
    data: { content: isPinned ? "Unpinned" : "Pinned" },
  });
}

/**
 * Check if a command sender is an admin on the server.
 *
 * If not, a response gif is sent in response to the message.
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
    await wrapper.sendInteractionResponse(payload.id, payload.token, {
      type: InteractionResponseTypes.ChannelMessageWithSource,
      data: {
        content:
          "https://tenor.com/view/no-nooo-nope-eat-fingerwag-gif-14832139",
      },
    });
  }
  return isAdmin;
}

async function commandBreach(
  wrapper: BotWrapper,
  config: Config,
  payload: DiscordenoInteraction,
) {
  if (
    !senderIsAdmin(wrapper, payload) || payload.data?.options === undefined ||
    payload.guildId === undefined
  ) {
    return;
  }
  // TODO support unbreach
  const target = payload.data.options[0];
  await wrapper.addRole(
    payload.guildId,
    target.value as unknown as bigint,
    config.containmentRoleId,
  );
  await wrapper.sendInteractionResponse(payload.id, payload.token, {
    type: InteractionResponseTypes.ChannelMessageWithSource,
    data: {
      content: config.containmentResponseGif,
    },
  });
}
