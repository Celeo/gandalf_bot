import os

import discord
from discord.ext import commands
from discord.ext.commands import Context
from dotenv import load_dotenv
from loguru import logger


__version__ = "0.1.0"

bot_description = ""
intents = discord.Intens.default()
intents.members = True
bot = commands.Bot(command_prefix="!", description=bot_description, intents=intents)


# ========
#   Util
# ========


def get_token() -> str:
    load_dotenv()
    return os.environ["DISCORD_TOKEN"]


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


# TODO


# ===========
#   Startup
# ===========


def main() -> None:
    logger.debug("Setting up")
    token = get_token()
    bot.run(token)
    logger.warning("Bot terminated")


if __name__ == "__main__":
    main()
