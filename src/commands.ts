import { BotWithCache, BotWrapper, DiscordenoMessage } from "./deps.ts";
import { Config } from "./config.ts";

const HELP_RESPONSE = `\`\`\`~~~ Gandalf bot commands ~~~

Command           Actions
--------------------------------------------------
help              Show this message
breach            Send someone to the shadow realm
unbreach          Bring someone back
sitrep            Show who's been banished
pin               Pin a message
unpin             Unpin a message
\`\`\``;

/**
 * Commands parts.
 */
export interface Command {
  /**
   * The actual name of the command.
   */
  name: string;
  /**
   * Any arguments supplied to the command.
   */
  args: Array<string>;
}

/**
 * Parse a message content into a command or `null`
 * if the message does not represent a command.
 */
export function parse(message: string): Command | null {
  if (message.length < 2) {
    return null;
  }
  if (!message.startsWith("!")) {
    return null;
  }
  let name;
  if (message.includes(" ")) {
    name = message.substring(1, message.indexOf(" "));
  } else {
    name = message.substring(1, message.length);
  }
  const args = message
    .substring(name.length + 1, message.length)
    .split(" ")
    .filter((part) => part.length > 0);
  return {
    name: name.toLowerCase(),
    args,
  };
}

/**
 * Handler for people sending commands to the bot.
 */
export async function handler(
  wrapper: BotWrapper,
  config: Config,
  message: DiscordenoMessage,
): Promise<void> {
  const command = parse(message.content);
  if (command === null) {
    return;
  }
  switch (command.name) {
    case "help": {
      await commandHelp(wrapper, config, message, command);
      break;
    }
    case "breach": {
      await commandBreach(wrapper, config, message, command);
      break;
    }
    case "unbreach": {
      await commandUnBreach(wrapper, config, message, command);
      break;
    }
    case "sitrep": {
      await commandSitRep(wrapper, config, message, command);
      break;
    }
    case "pin": {
      await commandPin(wrapper, config, message, command);
      break;
    }
    case "unpin": {
      await commandUnpin(wrapper, config, message, command);
      break;
    }
  }
}

/**
 * Check if a command sender is an admin on the server.
 *
 * If not, a response gif is sent in response to the message.
 */
async function senderIsAdmin(
  wrapper: BotWrapper,
  message: DiscordenoMessage,
): Promise<boolean> {
  if (message.member === undefined || message.guildId === undefined) {
    return false;
  }
  const isAdmin = wrapper.hasGuildPermissions(
    message.guildId,
    message.member,
    [
      "ADMINISTRATOR",
    ],
  );
  if (!isAdmin) {
    await wrapper.replyTo(
      message,
      "https://tenor.com/view/no-nooo-nope-eat-fingerwag-gif-14832139",
    );
  }
  return isAdmin;
}

// ===========================
// Individual command handlers
// ===========================

async function commandHelp(
  wrapper: BotWrapper,
  _config: Config,
  message: DiscordenoMessage,
  _command: Command,
) {
  await wrapper.replyTo(message, HELP_RESPONSE);
}

async function commandBreach(
  wrapper: BotWrapper,
  config: Config,
  message: DiscordenoMessage,
  _command: Command,
) {
  if (message.guildId === undefined || !await senderIsAdmin(wrapper, message)) {
    return;
  }
  if (message.mentionedUserIds.length === 0) {
    await wrapper.replyTo(message, "You must tag a user");
    return;
  }
  for (const mentioned of message.mentionedUserIds) {
    await wrapper.addRole(
      message.guildId,
      mentioned,
      config.containmentRoleId,
    );
  }
  await wrapper.replyTo(message, config.containmentResponseGif);
}

async function commandUnBreach(
  wrapper: BotWrapper,
  config: Config,
  message: DiscordenoMessage,
  _command: Command,
) {
  if (message.guildId === undefined || !await senderIsAdmin(wrapper, message)) {
    return;
  }
  if (message.mentionedUserIds.length === 0) {
    await wrapper.replyTo(message, "You must tag a user");
    return;
  }
  for (const mentioned of message.mentionedUserIds) {
    await wrapper.removeRole(
      message.guildId,
      mentioned,
      config.containmentRoleId,
    );
  }
  await wrapper.addReaction(message.channelId, message.id, "👍");
}

async function commandSitRep(
  wrapper: BotWrapper,
  config: Config,
  message: DiscordenoMessage,
  _command: Command,
) {
  if (message.guildId === undefined || !await senderIsAdmin(wrapper, message)) {
    return;
  }
  const containmentRole = config.containmentRoleId;
  const containedMembers: Array<bigint> = [];
  // would be nice to actually get the shard id here
  await wrapper.fetchMembers(message.guildId, 0);
  const members = (wrapper.bot as BotWithCache).members;
  for (const member of members.values()) {
    if (member.roles.includes(containmentRole)) {
      const user = await wrapper.getUser(member.id);
      containedMembers.push(user.id);
    }
  }
  if (containedMembers.length === 0) {
    await wrapper.replyTo(message, "No one is contained");
  } else {
    await wrapper.replyTo(
      message,
      "Contained users: " +
        containedMembers.map((id) => `<@!${id}>`).join(", "),
    );
  }
}

async function commandPin(
  wrapper: BotWrapper,
  _config: Config,
  message: DiscordenoMessage,
  command: Command,
) {
  if (command.args.length !== 1) {
    await wrapper.replyTo(
      message,
      "This command requires a single argument: the ID of a message to pin",
    );
    return;
  }
  await wrapper.pinMessage(message.channelId, BigInt(command.args[0]));
  await wrapper.addReaction(message.channelId, message.id, "👍");
}

async function commandUnpin(
  wrapper: BotWrapper,
  _config: Config,
  message: DiscordenoMessage,
  command: Command,
) {
  if (command.args.length !== 1) {
    await wrapper.replyTo(
      message,
      "This command requires a single argument: the ID of a message to unpin",
    );
    return;
  }
  await wrapper.unpinMessage(message.channelId, BigInt(command.args[0]));
  await wrapper.addReaction(message.channelId, message.id, "👍");
}
