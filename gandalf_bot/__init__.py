import os

import discord
from discord import Message
from discord.ext import commands
from discord.ext.commands import Context
from loguru import logger

from config import Config  # type: ignore
from message_util import is_incoherent, BLESS_YOU_EMOJI  # type: ignore


__version__ = "0.1.0"


# ===========
#   General
# ===========


intents = discord.Intents.default()
intents.members = True
bot = commands.Bot(command_prefix="!", description="", intents=intents)


@bot.event
async def on_ready() -> None:
    """Callback for when the bot connects."""
    logger.info("Bot::on_ready")


def command_perms_check(context: Context) -> bool:
    """Command check gate that prevents commands from being issued by non-admins."""
    return context.author.guild_permissions.administrator


# ===================
#   SCP Containment
# ===================


@bot.command(brief="Put an SCP into containment")
@commands.check(command_perms_check)
async def breach(context: Context, *args: str) -> None:
    logger.debug(
        f"Bot::command::breach by {context.author.name} in {context.channel.name}"
    )
    await context.send("Command not implemented!")


@bot.command(brief="Let someone out of containment")
@commands.check(command_perms_check)
async def unbreach(context: Context, *args: str) -> None:
    logger.debug(
        f"Bot::comand::unbreach by {context.author.name} in {context.channel.name}"
    )
    await context.send("Command not implemented!")


@bot.command(brief="Get a situation report of the containment facilities")
@commands.check(command_perms_check)
async def sitrep(context: Context, *args: str) -> None:
    logger.debug(
        f"Bot::comand::sitrep by {context.author.name} in {context.channel.name}"
    )
    await context.send("Command not implemented!")


# ======================
#   Bless-you reaction
# ======================


@bot.event
async def on_message(message: Message) -> None:
    if message.author == bot.user:
        return
    if message.author.id not in Config.from_disk().blessable_user_ids:
        return
    if not is_incoherent(message.content):
        return
    await message.add_reaction(BLESS_YOU_EMOJI)


# ===========
#   Startup
# ===========


def main() -> None:
    logger.debug("Setting up")
    config = Config.from_disk()
    bot.run(config.token)
    logger.warning("Bot terminated")


if __name__ == "__main__":
    main()
