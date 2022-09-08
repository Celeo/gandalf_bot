// ===== Bot library =====

export {
  ApplicationCommandOptionTypes,
  createBot,
  createEventHandlers,
  InteractionResponseTypes,
  InteractionTypes,
} from "https://deno.land/x/discordeno@13.0.0-rc18/mod.ts";
export type {
  Bot,
  DiscordenoEmoji,
  DiscordenoInteraction,
  DiscordenoMember,
  DiscordenoMessage,
} from "https://deno.land/x/discordeno@13.0.0-rc18/mod.ts";
export {
  enableCachePlugin,
  enableCacheSweepers,
} from "https://deno.land/x/discordeno_cache_plugin@0.0.21/mod.ts";
export type {
  BotWithCache,
} from "https://deno.land/x/discordeno_cache_plugin@0.0.21/mod.ts";
export {
  enablePermissionsPlugin,
} from "https://deno.land/x/discordeno_permissions_plugin@0.0.15/mod.ts";

import {
  addReaction,
  addRole,
  fetchMembers,
  getDmChannel,
  getMember,
  getUser,
  pinMessage,
  removeRole,
  sendMessage,
  startBot,
  unpinMessage,
} from "https://deno.land/x/discordeno@13.0.0-rc18/mod.ts";
import type {
  Bot,
  CreateMessage,
  DiscordenoGuild,
  DiscordenoMember,
  DiscordenoMessage,
  PermissionStrings,
} from "https://deno.land/x/discordeno@13.0.0-rc18/mod.ts";
import type {
  BotWithCache,
} from "https://deno.land/x/discordeno_cache_plugin@0.0.21/mod.ts";
import {
  hasGuildPermissions,
} from "https://deno.land/x/discordeno_permissions_plugin@0.0.15/mod.ts";

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

  async addRole(guildId: bigint, memberId: bigint, roleId: bigint) {
    return await addRole(this.bot, guildId, memberId, roleId);
  }

  async fetchMembers(guildId: bigint, shardId: number) {
    return await fetchMembers(this.bot, guildId, shardId);
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

  async pinMessage(channelId: bigint, messageId: bigint) {
    return await pinMessage(this.bot, channelId, messageId);
  }

  async removeRole(guildId: bigint, memberId: bigint, roleId: bigint) {
    return await removeRole(this.bot, guildId, memberId, roleId);
  }

  async sendMessage(channelId: bigint, content: CreateMessage) {
    return await sendMessage(this.bot, channelId, content);
  }

  async replyTo(
    message: DiscordenoMessage,
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

  async unpinMessage(channelId: bigint, messageId: bigint) {
    return await unpinMessage(this.bot, channelId, messageId);
  }

  hasGuildPermissions(
    guild: bigint | DiscordenoGuild,
    member: bigint | DiscordenoMember,
    permissions: PermissionStrings[],
  ) {
    return hasGuildPermissions(
      this.bot as BotWithCache,
      guild,
      member,
      permissions,
    );
  }
}

// ===== memoize =====

export { memoizy } from "https://deno.land/x/memoizy@1.0.0/mod.ts";
