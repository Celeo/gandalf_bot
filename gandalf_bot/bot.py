import logging
import os
from typing import Optional

import discord
from discord import (
    File,
    Message,
    Role,
    RawReactionActionEvent,
)
from discord.ext import commands
from discord.ext.commands import Context, CommandError
from loguru import logger
from more_itertools import grouper
from prettytable import PrettyTable

from .config import (
    BasicConfig,
    RoleConfigEntry,
    connect_to_db,
    load_roles_from_disk,
)
from .message_util import is_incoherent, BLESS_YOU_EMOJI
from .quotes import get_random_quote
from .dice import roll_dice, roll_dice_help


# =======
# General
# =======


logging.basicConfig(level=logging.WARN)  # for discord.py library logging
intents = discord.Intents.default()
intents.members = True
bot = commands.Bot(command_prefix="!", description="Gandalf the Grey", intents=intents)


@bot.event
async def on_ready() -> None:
    """Callback for when the bot connects."""
    logger.info("Bot::on_ready")


@bot.event
async def on_command_error(context: Context, error: CommandError) -> None:
    pass


def _admin_command_check(context: Context) -> bool:
    """Command check gate that prevents commands from being issued by non-admins."""
    return context.author.guild_permissions.administrator


# ===============
# SCP Containment
# ===============


async def _get_containment_role(
    context: Context, config=BasicConfig.from_disk()
) -> Optional[Role]:
    role = context.guild.get_role(config.containment_role_id)
    if not role:
        await context.send("The bot configuration is borked")
        return None
    return role


@bot.command(brief="Put someone into containment")
@commands.check(_admin_command_check)
async def breach(context: Context, *args: str) -> None:
    logger.debug(
        f"Bot::command::breach by {context.author.name} in {context.channel.name}"
    )
    if not args:
        await context.send(
            "Command is: `!breach [name] (name2 ...)` and you have to reference the "
            + "users, like with the @[name]<tab>"
        )
    config = BasicConfig.from_disk()
    containment_role = await _get_containment_role(context, config)
    if not containment_role:
        return
    mentions = context.message.mentions
    for member in mentions:
        await member.add_roles(containment_role)
    if config.containment_response_gif:
        await context.send(config.containment_response_gif)
    await context.send("They will trouble us no longer!")


@bot.command(brief="Let someone out of containment")
@commands.check(_admin_command_check)
async def unbreach(context: Context, *args: str) -> None:
    logger.debug(
        f"Bot::command::unbreach by {context.author.name} in {context.channel.name}"
    )
    containment_role = await _get_containment_role(context)
    if not containment_role:
        return
    mentions = context.message.mentions
    for member in mentions:
        await member.remove_roles(containment_role)
    await context.send("It is done.")


@bot.command(brief="Get a situation report of the containment")
@commands.check(_admin_command_check)
async def sitrep(context: Context, *args: str) -> None:
    logger.debug(
        f"Bot::command::sitrep by {context.author.name} in {context.channel.name}"
    )
    containment_role = await _get_containment_role(context)
    if not containment_role:
        return
    contained = []
    for member in context.guild.members:
        if containment_role in member.roles:
            contained.append(member.display_name)
    if contained:
        await context.send(
            "These people are contained: {}".format(", ".join(contained))
        )
    else:
        await context.send("No one is currently contained")


# ==================
# Bless-you reaction
# ==================


@bot.event
async def on_message(message: Message) -> None:
    await bot.process_commands(message)
    if message.author == bot.user:
        return
    if (
        message.author.id in BasicConfig.from_disk().blessable_user_ids
        and is_incoherent(message.content)
    ):
        await message.add_reaction(BLESS_YOU_EMOJI)
    if bot.user in message.mentions:
        await message.channel.send(get_random_quote())


# ============
# Dice rolling
# ============


@bot.command(brief="Roll some CoD dice")
async def roll(context: Context, *args: str) -> None:
    if "help" in args:
        await context.send(roll_dice_help())
        return
    result = roll_dice(" ".join(args))
    await context.send(f"{context.message.author.mention} {result}")


# =================
# Merit screenshots
# =================


@bot.command(brief="Show a CoD merit screenshot")
async def merit(context: Context, *args: str) -> None:
    if len(args) == 0:
        await context.send("Usage: `!merit [name]`")
        return
    merit_screenshots = "merit_screenshots"
    if not os.path.exists(merit_screenshots):
        await context.send("No screenshots folder")
        return
    name = "_".join(args).replace(" ", "_")
    found = False
    screenshot_files = sorted(os.listdir(merit_screenshots))
    for f_name in screenshot_files:
        if f_name.startswith(name):
            with open(f"{merit_screenshots}/{f_name}", "rb") as f:
                await context.send(file=File(f))
                found = True
    if not found:
        await context.send("Could not find any matching merit screenshots")


# ==============
# Reaction roles
# ==============


async def _handle_rection(payload: RawReactionActionEvent, add: bool) -> None:
    member = payload.member
    if member.bot:
        return
    channel_id = payload.channel_id
    message_id = payload.message_id
    emoji_name = payload.emoji.name
    for conf_role in load_roles_from_disk():
        if conf_role.matches(channel_id, message_id, emoji_name):
            for role_obj in member.guild.roles:
                if role_obj.name == conf_role.role_name:
                    if add:
                        logger.debug(
                            f'Adding role "{conf_role.role_name}" to "{member.display_name}"'
                        )
                        await member.add_roles(role_obj)
                        await member.send(
                            f'You have been granted the role "{conf_role.role_name}" on the server "{member.guild.name}"'
                        )
                    else:
                        logger.debug(
                            f'Removing role "{conf_role.role_name}" from "{member.display_name}"'
                        )
                        await member.remove_roles(role_obj)
                        await member.send(
                            f'You have been stripped of the role "{conf_role.role_name}" on the server "{member.guild.name}"'
                        )
                    return
            logger.warning(f'Could not find a role with name "{conf_role.role_name}"')
            return


@bot.event
async def on_raw_reaction_add(payload: RawReactionActionEvent) -> None:
    await _handle_rection(payload, True)


@bot.event
async def on_raw_reaction_remove(payload: RawReactionActionEvent) -> None:
    # This payload contains `member == None`, so pull the needed data from
    # the client and populate the payload with a `Member` before processing.
    guild = bot.get_guild(payload.guild_id)
    member = guild.get_member(payload.user_id)
    payload.member = member
    await _handle_rection(payload, False)


@bot.command(brief="Add or remove a reaction role assignment")
@commands.check(_admin_command_check)
async def reactionrole(
    context: Context,
    add_or_remove: str,
    channel_id: int,
    message_id: int,
    emoji_name: str,
    role: Role,
) -> None:
    if add_or_remove.lower() in ("add", "create"):
        for existing in load_roles_from_disk():
            if existing.matches(
                channel_id=channel_id,
                message_id=message_id,
                emoji_name=emoji_name,
            ):
                await context.send(
                    "A configuration for that combination already exists"
                )
                return
        RoleConfigEntry.create(
            channel_id=channel_id,
            message_id=message_id,
            emoji_name=emoji_name,
            role_name=role.name,
        )
        await context.send("Reaction role created")
    elif add_or_remove.lower() in ("remove", "delete"):
        for existing in load_roles_from_disk():
            if existing.matches(
                channel_id=channel_id,
                message_id=message_id,
                emoji_name=emoji_name,
            ):
                existing.delete_instance()
                await context.send("Reaction role removed")
                return
        await context.send("No matching reaction role found")
    else:
        await context.send(
            f'Unknown <add_or_remove> parameter: "{add_or_remove}". Try "add" or "remove" next time.'
        )


@bot.command(brief="List configured reaction roles")
@commands.check(_admin_command_check)
async def reactionroles(context: Context) -> None:
    roles = load_roles_from_disk()
    if len(roles) == 0:
        await context.send("There are no configured reaction roles")
        return
    header = "**Configured reaction roles**\n"
    field_names = [
        "Index",
        "Channel ID",
        "Message ID",
        "Role name",
        "Emoji",
    ]
    row_index = 0
    for group_index, group in enumerate(grouper(roles, 10)):
        table = PrettyTable()
        table.field_names = field_names
        for role in group:
            if not role:
                continue
            table.add_row(
                [
                    row_index,
                    role.channel_id,
                    role.message_id,
                    role.role_name,
                    role.emoji_name,
                ]
            )
            row_index += 1
        s = "```\n{}\n```".format(table.get_string())
        if group_index == 0:
            s = header + s
        await context.send(s)


# =======
# Startup
# =======


def main() -> None:
    logger.debug("Setting up")
    config = BasicConfig.from_disk()
    connect_to_db()
    bot.run(config.token)
    logger.warning("Bot terminated")
