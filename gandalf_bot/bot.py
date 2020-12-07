import logging
import os
from typing import Optional

import discord
from discord import File, Message, Role
from discord.ext import commands
from discord.ext.commands import Context
from loguru import logger

from .config import Config
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


def command_perms_check(context: Context) -> bool:
    """Command check gate that prevents commands from being issued by non-admins."""
    return context.author.guild_permissions.administrator


# ===============
# SCP Containment
# ===============


async def _get_containment_role(
    context: Context, config=Config.from_disk()
) -> Optional[Role]:
    role = context.guild.get_role(config.containment_role_id)
    if not role:
        await context.send("The bot configuration is borked")
        return None
    return role


@bot.command(brief="Put someone into containment")
@commands.check(command_perms_check)
async def breach(context: Context, *args: str) -> None:
    logger.debug(
        f"Bot::command::breach by {context.author.name} in {context.channel.name}"
    )
    if not args:
        await context.send(
            "Command is: `!breach [name] (name2 ...)` and you have to reference the "
            + "users, like with the @[name]<tab>"
        )
    config = Config.from_disk()
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
@commands.check(command_perms_check)
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
@commands.check(command_perms_check)
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
    if message.author.id in Config.from_disk().blessable_user_ids and is_incoherent(
        message.content
    ):
        await message.add_reaction(BLESS_YOU_EMOJI)
    if bot.user in message.mentions:
        await message.channel.send(get_random_quote())


# ============
# Dice rolling
# ============


@bot.command(brief="Roll some Chronicles of Darkness dice")
async def roll(context: Context, *args: str) -> None:
    if "help" in args:
        await context.send(roll_dice_help())
        return
    await context.send(roll_dice(" ".join(args)))


# =================
# Merit screenshots
# =================


@bot.command()
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


# =======
# Startup
# =======


def main() -> None:
    logger.debug("Setting up")
    config = Config.from_disk()
    bot.run(config.token)
    logger.warning("Bot terminated")
