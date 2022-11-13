// ===== Bot library =====

export {
  ApplicationCommandOptionTypes,
  createBot,
  createEventHandlers,
  GatewayIntents,
  InteractionResponseTypes,
  InteractionTypes,
} from "https://deno.land/x/discordeno@17.0.1/mod.ts";
export {
  enableCachePlugin,
  enableCacheSweepers,
  enablePermissionsPlugin,
} from "https://deno.land/x/discordeno@17.0.1/plugins/mod.ts";
export type {
  Emoji,
  Interaction,
  Member,
  Message,
  User,
} from "https://deno.land/x/discordeno@17.0.1/mod.ts";
export type {
  BotWithCache,
} from "https://deno.land/x/discordeno@17.0.1/plugins/mod.ts";

import {
  addReaction,
  addRole,
  editMessage,
  getDmChannel,
  getMember,
  getUser,
  pinMessage,
  removeRole,
  sendMessage,
  startBot,
  unpinMessage,
} from "https://deno.land/x/discordeno@17.0.1/mod.ts";
import {
  BotWithCache,
  hasGuildPermissions,
} from "https://deno.land/x/discordeno@17.0.1/plugins/mod.ts";
import type {
  Bot,
  CreateMessage,
  EditMessage,
  Guild,
  Member,
  Message,
  PermissionStrings,
} from "https://deno.land/x/discordeno@17.0.1/mod.ts";

/**
 * Wrapper for Discordeno's `Bot` object.
 *
 * In a class rather than separately-imported functions
 * to facilitate testing and organization.
 */
export class BotWrapper {
  readonly bot: Bot;

  constructor(bot: Bot) {
    this.bot = bot;
  }

  async startBot() {
    return await startBot(this.bot);
  }

  async addReaction(channelId: bigint, messageId: bigint, emoji: string) {
    return await addReaction(this.bot, channelId, messageId, emoji);
  }

  async addRole(guildId: bigint | string, memberId: bigint, roleId: bigint) {
    return await addRole(this.bot, guildId, memberId, roleId);
  }

  async getDmChannel(userId: bigint) {
    return await getDmChannel(this.bot, userId);
  }

  async getMember(guildId: bigint, id: bigint) {
    return await getMember(this.bot, guildId, id);
  }

  async getUser(userId: bigint) {
    return await getUser(this.bot, userId);
  }

  async pinMessage(channelId: bigint | string, messageId: bigint) {
    return await pinMessage(this.bot, channelId, messageId);
  }

  async removeRole(guildId: bigint | string, memberId: bigint, roleId: bigint) {
    return await removeRole(this.bot, guildId, memberId, roleId);
  }

  async sendMessage(channelId: bigint, content: CreateMessage) {
    return await sendMessage(this.bot, channelId, content);
  }

  async replyTo(
    message: Message,
    content: string,
  ) {
    return await this.sendMessage(message.channelId, {
      content,
      messageReference: {
        messageId: message.id,
        channelId: message.channelId,
        failIfNotExists: false,
      },
    });
  }

  async unpinMessage(channelId: bigint | string, messageId: bigint) {
    return await unpinMessage(this.bot, channelId, messageId);
  }

  hasGuildPermissions(
    guild: bigint | Guild,
    member: bigint | Member,
    permissions: PermissionStrings[],
  ) {
    return hasGuildPermissions(
      this.bot as BotWithCache,
      guild,
      member,
      permissions,
    );
  }

  async editMessage(
    channelId: bigint,
    messageId: bigint,
    options: EditMessage,
  ) {
    return await editMessage(this.bot, channelId, messageId, options);
  }
}

// ===== other =====

export { memoizy } from "https://deno.land/x/memoizy@1.0.0/mod.ts";
import * as log from "https://deno.land/std@0.163.0/log/mod.ts";
import { dateAsString } from "./dateUtil.ts";

log.setup({
  handlers: {
    console: new log.handlers.ConsoleHandler("DEBUG", {
      formatter: (record: log.LogRecord): string => {
        const ds = dateAsString(record.datetime);
        return `${ds} [${record.levelName}] ${record.msg}`;
      },
    }),
  },
  loggers: {
    default: {
      level: "DEBUG",
      handlers: ["console"],
    },
  },
});
export const logger = log.getLogger();
