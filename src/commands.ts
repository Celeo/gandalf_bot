import {
  addReaction,
  addRole,
  BotWithCache,
  DiscordenoMessage,
  fetchMembers,
  getUser,
  hasGuildPermissions,
  pinMessage,
  removeRole,
  unpinMessage,
} from "./deps.ts";
import { replyTo } from "./util.ts";
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
addreactionrole   Add reaction roles
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
  bot: BotWithCache,
  config: Config,
  message: DiscordenoMessage,
): Promise<void> {
  const command = parse(message.content);
  if (command === null) {
    return;
  }
  switch (command.name) {
    case "help": {
      await commandHelp(bot, config, message, command);
      break;
    }
    case "breach": {
      await commandBreach(bot, config, message, command);
      break;
    }
    case "unbreach": {
      await commandUnBreach(bot, config, message, command);
      break;
    }
    case "sitrep": {
      await commandSitRep(bot, config, message, command);
      break;
    }
    case "pin": {
      await commandPin(bot, config, message, command);
      break;
    }
    case "unpin": {
      await commandUnpin(bot, config, message, command);
      break;
    }
    case "addreactionrole": {
      await commandAddReactionRole(bot, config, message, command);
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
  bot: BotWithCache,
  message: DiscordenoMessage,
): Promise<boolean> {
  if (message.member === undefined || message.guildId === undefined) {
    return false;
  }
  const isAdmin = hasGuildPermissions(bot, message.guildId, message.member, [
    "ADMINISTRATOR",
  ]);
  if (!isAdmin) {
    await replyTo(
      bot,
      message,
      "https://tenor.com/view/no-nooo-nope-eat-fingerwag-gif-14832139",
    );
  }
  return isAdmin;
}

async function commandHelp(
  bot: BotWithCache,
  _config: Config,
  message: DiscordenoMessage,
  _command: Command,
) {
  await replyTo(bot, message, HELP_RESPONSE);
}

async function commandBreach(
  bot: BotWithCache,
  config: Config,
  message: DiscordenoMessage,
  _command: Command,
) {
  if (!senderIsAdmin(bot, message)) {
    return;
  }
  if (message.mentionedUserIds.length === 0) {
    await replyTo(bot, message, "You must tag a user");
  }
  for (const mentioned of message.mentionedUserIds) {
    await addRole(
      bot,
      message.guildId as bigint,
      mentioned,
      config.containmentRoleId,
    );
  }
  await replyTo(bot, message, config.containmentResponseGif);
}

async function commandUnBreach(
  bot: BotWithCache,
  config: Config,
  message: DiscordenoMessage,
  _command: Command,
) {
  if (!senderIsAdmin(bot, message)) {
    return;
  }
  if (message.mentionedUserIds.length === 0) {
    await replyTo(bot, message, "You must tag a user");
  }
  for (const mentioned of message.mentionedUserIds) {
    await removeRole(
      bot,
      message.guildId as bigint,
      mentioned,
      config.containmentRoleId,
    );
  }
  await addReaction(bot, message.channelId, message.id, "👍");
}

async function commandSitRep(
  bot: BotWithCache,
  config: Config,
  message: DiscordenoMessage,
  _command: Command,
) {
  if (!senderIsAdmin(bot, message)) {
    return;
  }
  const containmentRole = config.containmentRoleId;
  const containedMembers: Array<bigint> = [];
  await fetchMembers(bot, message.guildId as bigint, 0);
  const members = bot.members;
  for (const member of members.values()) {
    if (member.roles.includes(containmentRole)) {
      const user = await getUser(bot, member.id);
      containedMembers.push(user.id);
    }
  }
  if (containedMembers.length === 0) {
    await replyTo(bot, message, "No one is contained");
  } else {
    await replyTo(
      bot,
      message,
      "Contained users: " +
        containedMembers.map((id) => `<@!${id}>`).join(", "),
    );
  }
}

async function commandPin(
  bot: BotWithCache,
  _config: Config,
  message: DiscordenoMessage,
  command: Command,
) {
  if (command.args.length !== 1) {
    await replyTo(
      bot,
      message,
      "This command requires a single argument: the ID of a message to pin",
    );
  }
  await pinMessage(bot, message.channelId, BigInt(command.args[0]));
  await addReaction(bot, message.channelId, message.id, "👍");
}

async function commandUnpin(
  bot: BotWithCache,
  _config: Config,
  message: DiscordenoMessage,
  command: Command,
) {
  if (command.args.length !== 1) {
    await replyTo(
      bot,
      message,
      "This command requires a single argument: the ID of a message to unpin",
    );
  }
  await unpinMessage(bot, message.channelId, BigInt(command.args[0]));
  await addReaction(bot, message.channelId, message.id, "👍");
}

// deno-lint-ignore require-await
async function commandAddReactionRole(
  bot: BotWithCache,
  _config: Config,
  message: DiscordenoMessage,
  _command: Command,
) {
  if (!senderIsAdmin(bot, message)) {
    return;
  }
  // TODO
}
