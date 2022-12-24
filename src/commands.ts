import type { Config } from "./config.ts";
import {
  ApplicationCommandOptionTypes,
  InteractionResponseTypes,
  InteractionTypes,
} from "./deps.ts";
import type { BotWrapper, Interaction } from "./deps.ts";
import { getServerStatus } from "./valheim.ts";

const HELP_CONTEXT = `**Available commands**:

- /pin - Pin a message to a channel
- /unpin - Unpin a pinned message from a channel
- /breach - Throw someone to the shadow realm
- /unbreach - Save someone from the shadow realm
- /valheim - Interact with the Valheim server

When using (un)pin, you need the ID of the message. Enable developer \
mode in Settings -> Advanced, and then right click a message -> Copy ID \
to get the ID. Paste that into the command argument.

Anyone can pin and unpin messages via those commands. These are available \
as commands instead of default Discord permissions since Discord permissions \
are bad.

Breaching is only available to server admins (so, Charley).`;

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
    name: "valheim",
    description: "Interact with the Valheim server",
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
    case "valheim": {
      await commandValheim(wrapper, config, payload);
      break;
    }
    case "help": {
      await commandHelp(wrapper, config, payload);
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

export async function commandValheim(
  wrapper: BotWrapper,
  config: Config,
  payload: Interaction,
): Promise<void> {
  try {
    const data = await getServerStatus(config);
    const state = data["instance/state"] as number;
    const url = data["instance/cloud-dns"] as string;
    let content;
    if (state === 10 || state === 13) {
      content =
        `Server is online ✅\n**Url**: \`${url}\`\n**Password**: \`${config.valheim.password}\``;
    } else if (state === 0 || state === 5) {
      content = `Server is booting ⌚ - it should be on in a few minutes`;
    } else {
      content =
        `Server is offline ❌\nUse <https://gameho.io/servers/${config.valheim.server}> to boot it`;
    }
    await wrapper.bot.helpers.sendInteractionResponse(
      payload.id,
      payload.token,
      {
        type: InteractionResponseTypes.ChannelMessageWithSource,
        data: {
          content,
        },
      },
    );
  } catch (err) {
    console.error(`Error getting Valheim server details: ${err}`);
    await wrapper.bot.helpers.sendInteractionResponse(
      payload.id,
      payload.token,
      {
        type: InteractionResponseTypes.ChannelMessageWithSource,
        data: { content: "Something went wrong" },
      },
    );
  }
}

export async function commandHelp(
  wrapper: BotWrapper,
  _config: Config,
  payload: Interaction,
): Promise<void> {
  await wrapper.bot.helpers.sendInteractionResponse(
    payload.id,
    payload.token,
    {
      type: InteractionResponseTypes.ChannelMessageWithSource,
      data: { content: HELP_CONTEXT },
    },
  );
}
